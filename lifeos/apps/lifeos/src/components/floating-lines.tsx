import { useEffect, useRef } from 'react';
import {
  Clock, Mesh, OrthographicCamera, PlaneGeometry,
  Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer,
} from 'three';
import './floating-lines.css';

const vertexShader = `precision highp float;
void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;

const fragmentShader = `precision highp float;
uniform float iTime;uniform vec3 iResolution;uniform float animationSpeed;
uniform bool enableTop;uniform bool enableMiddle;uniform bool enableBottom;
uniform int topLineCount;uniform int middleLineCount;uniform int bottomLineCount;
uniform float topLineDistance;uniform float middleLineDistance;uniform float bottomLineDistance;
uniform vec3 topWavePosition;uniform vec3 middleWavePosition;uniform vec3 bottomWavePosition;
uniform vec2 iMouse;uniform bool interactive;uniform float bendRadius;uniform float bendStrength;uniform float bendInfluence;
uniform bool parallax;uniform float parallaxStrength;uniform vec2 parallaxOffset;
uniform vec3 lineGradient[8];uniform int lineGradientCount;
const vec3 BLACK=vec3(0.0);const vec3 PINK=vec3(233.,71.,245.)/255.;const vec3 BLUE=vec3(47.,75.,162.)/255.;
mat2 rotate(float r){return mat2(cos(r),sin(r),-sin(r),cos(r));}
vec3 background_color(vec2 uv){vec3 col=vec3(0.);float y=sin(uv.x-0.2)*0.3-0.1;float m=uv.y-y;col+=mix(BLUE,BLACK,smoothstep(0.,1.,abs(m)));col+=mix(PINK,BLACK,smoothstep(0.,1.,abs(m-0.8)));return col*0.5;}
vec3 getLineColor(float t,vec3 baseColor){if(lineGradientCount<=0)return baseColor;vec3 g;if(lineGradientCount==1){g=lineGradient[0];}else{float ct=clamp(t,0.,0.9999);float sc=ct*float(lineGradientCount-1);int idx=int(floor(sc));float f=fract(sc);int idx2=min(idx+1,lineGradientCount-1);g=mix(lineGradient[idx],lineGradient[idx2],f);}return g*0.5;}
float wave(vec2 uv,float offset,vec2 screenUv,vec2 mouseUv,bool shouldBend){float time=iTime*animationSpeed;float amp=sin(offset+time*0.2)*0.3;float y=sin(uv.x+offset+time*0.1)*amp;if(shouldBend){vec2 d=screenUv-mouseUv;float inf=exp(-dot(d,d)*bendRadius);y+=(mouseUv.y-screenUv.y)*inf*bendStrength*bendInfluence;}float m=uv.y-y;return 0.0175/max(abs(m)+0.01,1e-3)+0.01;}
void mainImage(out vec4 fragColor,in vec2 fragCoord){vec2 baseUv=(2.*fragCoord-iResolution.xy)/iResolution.y;baseUv.y*=-1.;if(parallax)baseUv+=parallaxOffset;vec3 col=vec3(0.);vec3 b=lineGradientCount>0?vec3(0.):background_color(baseUv);vec2 mouseUv=vec2(0.);if(interactive){mouseUv=(2.*iMouse-iResolution.xy)/iResolution.y;mouseUv.y*=-1.;}
if(enableBottom){for(int i=0;i<bottomLineCount;++i){float fi=float(i);float t=fi/max(float(bottomLineCount-1),1.);vec3 lc=getLineColor(t,b);float ang=bottomWavePosition.z*log(length(baseUv)+1.);vec2 ruv=baseUv*rotate(ang);col+=lc*wave(ruv+vec2(bottomLineDistance*fi+bottomWavePosition.x,bottomWavePosition.y),1.5+0.2*fi,baseUv,mouseUv,interactive)*0.2;}}
if(enableMiddle){for(int i=0;i<middleLineCount;++i){float fi=float(i);float t=fi/max(float(middleLineCount-1),1.);vec3 lc=getLineColor(t,b);float ang=middleWavePosition.z*log(length(baseUv)+1.);vec2 ruv=baseUv*rotate(ang);col+=lc*wave(ruv+vec2(middleLineDistance*fi+middleWavePosition.x,middleWavePosition.y),2.+0.15*fi,baseUv,mouseUv,interactive);}}
if(enableTop){for(int i=0;i<topLineCount;++i){float fi=float(i);float t=fi/max(float(topLineCount-1),1.);vec3 lc=getLineColor(t,b);float ang=topWavePosition.z*log(length(baseUv)+1.);vec2 ruv=baseUv*rotate(ang);ruv.x*=-1.;col+=lc*wave(ruv+vec2(topLineDistance*fi+topWavePosition.x,topWavePosition.y),1.+0.2*fi,baseUv,mouseUv,interactive)*0.1;}}
fragColor=vec4(col,1.);}
void main(){vec4 color=vec4(0.);mainImage(color,gl_FragCoord.xy);gl_FragColor=color;}`;

const MAX_STOPS = 8;

function hexToVec3(hex: string): Vector3 {
  let v = hex.trim().replace('#', '');
  if (v.length === 3) v = v[0]+v[0]+v[1]+v[1]+v[2]+v[2];
  return new Vector3(parseInt(v.slice(0,2),16)/255, parseInt(v.slice(2,4),16)/255, parseInt(v.slice(4,6),16)/255);
}

interface FloatingLinesProps {
  linesGradient?: string[];
  enabledWaves?: Array<'top'|'middle'|'bottom'>;
  lineCount?: number | number[];
  lineDistance?: number | number[];
  topWavePosition?: {x:number;y:number;rotate:number};
  middleWavePosition?: {x:number;y:number;rotate:number};
  bottomWavePosition?: {x:number;y:number;rotate:number};
  animationSpeed?: number;
  interactive?: boolean;
  bendRadius?: number;
  bendStrength?: number;
  mouseDamping?: number;
  parallax?: boolean;
  parallaxStrength?: number;
  mixBlendMode?: React.CSSProperties['mixBlendMode'];
}

export default function FloatingLines({
  linesGradient,
  enabledWaves = ['top','middle','bottom'],
  lineCount = [6],
  lineDistance = [5],
  topWavePosition,
  middleWavePosition,
  bottomWavePosition = {x:2.0,y:-0.7,rotate:-1},
  animationSpeed = 1,
  interactive = true,
  bendRadius = 5.0,
  bendStrength = -0.5,
  mouseDamping = 0.05,
  parallax = true,
  parallaxStrength = 0.2,
  mixBlendMode = 'screen',
}: FloatingLinesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetMouse = useRef(new Vector2(-1000,-1000));
  const currentMouse = useRef(new Vector2(-1000,-1000));
  const targetInf = useRef(0);
  const currentInf = useRef(0);
  const targetPar = useRef(new Vector2(0,0));
  const currentPar = useRef(new Vector2(0,0));

  const getCount = (w: string) => {
    if (typeof lineCount === 'number') return lineCount;
    const i = (enabledWaves as string[]).indexOf(w);
    return i>=0 ? ((lineCount as number[])[i] ?? 6) : 0;
  };
  const getDist = (w: string) => {
    if (typeof lineDistance === 'number') return lineDistance * 0.01;
    const i = (enabledWaves as string[]).indexOf(w);
    return i>=0 ? (((lineDistance as number[])[i] ?? 5) * 0.01) : 0.05;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let active = true;
    const scene = new Scene();
    const camera = new OrthographicCamera(-1,1,1,-1,0,1);
    camera.position.z = 1;
    const renderer = new WebGLRenderer({antialias:true,alpha:false});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const uniforms: Record<string, {value: unknown}> = {
      iTime:{value:0}, iResolution:{value:new Vector3(1,1,1)},
      animationSpeed:{value:animationSpeed},
      enableTop:{value:enabledWaves.includes('top')},
      enableMiddle:{value:enabledWaves.includes('middle')},
      enableBottom:{value:enabledWaves.includes('bottom')},
      topLineCount:{value:getCount('top')}, middleLineCount:{value:getCount('middle')}, bottomLineCount:{value:getCount('bottom')},
      topLineDistance:{value:getDist('top')}, middleLineDistance:{value:getDist('middle')}, bottomLineDistance:{value:getDist('bottom')},
      topWavePosition:{value:new Vector3(topWavePosition?.x??10, topWavePosition?.y??0.5, topWavePosition?.rotate??-0.4)},
      middleWavePosition:{value:new Vector3(middleWavePosition?.x??5, middleWavePosition?.y??0, middleWavePosition?.rotate??0.2)},
      bottomWavePosition:{value:new Vector3(bottomWavePosition?.x??2, bottomWavePosition?.y??-0.7, bottomWavePosition?.rotate??0.4)},
      iMouse:{value:new Vector2(-1000,-1000)},
      interactive:{value:interactive}, bendRadius:{value:bendRadius}, bendStrength:{value:bendStrength}, bendInfluence:{value:0},
      parallax:{value:parallax}, parallaxStrength:{value:parallaxStrength}, parallaxOffset:{value:new Vector2(0,0)},
      lineGradient:{value:Array.from({length:MAX_STOPS},()=>new Vector3(1,1,1))},
      lineGradientCount:{value:0},
    };

    if (linesGradient?.length) {
      const stops = linesGradient.slice(0,MAX_STOPS);
      (uniforms.lineGradientCount as {value:number}).value = stops.length;
      stops.forEach((hex,i) => {
        const c = hexToVec3(hex);
        (uniforms.lineGradient.value as Vector3[])[i].set(c.x,c.y,c.z);
      });
    }

    const material = new ShaderMaterial({uniforms, vertexShader, fragmentShader});
    const geo = new PlaneGeometry(2,2);
    scene.add(new Mesh(geo, material));
    const clock = new Clock();

    const setSize = () => {
      if (!active) return;
      const w = container.clientWidth||1, h = container.clientHeight||1;
      renderer.setSize(w,h,false);
      (uniforms.iResolution.value as Vector3).set(renderer.domElement.width, renderer.domElement.height, 1);
    };
    setSize();
    const ro = typeof ResizeObserver!=='undefined' ? new ResizeObserver(()=>{ if(active) setSize(); }) : null;
    ro?.observe(container);

    const onMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const dpr = renderer.getPixelRatio();
      targetMouse.current.set((e.clientX-rect.left)*dpr, (rect.height-(e.clientY-rect.top))*dpr);
      targetInf.current = 1;
      if (parallax) {
        targetPar.current.set((e.clientX-rect.left-rect.width/2)/rect.width*parallaxStrength, -(e.clientY-rect.top-rect.height/2)/rect.height*parallaxStrength);
      }
    };
    const onLeave = () => { targetInf.current = 0; };
    if (interactive) { renderer.domElement.addEventListener('pointermove',onMove); renderer.domElement.addEventListener('pointerleave',onLeave); }

    let raf = 0;
    const loop = () => {
      if (!active) return;
      (uniforms.iTime as {value:number}).value = clock.getElapsedTime();
      if (interactive) {
        currentMouse.current.lerp(targetMouse.current,mouseDamping);
        (uniforms.iMouse.value as Vector2).copy(currentMouse.current);
        currentInf.current += (targetInf.current-currentInf.current)*mouseDamping;
        (uniforms.bendInfluence as {value:number}).value = currentInf.current;
      }
      if (parallax) {
        currentPar.current.lerp(targetPar.current,mouseDamping);
        (uniforms.parallaxOffset.value as Vector2).copy(currentPar.current);
      }
      renderer.render(scene,camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      if (interactive) { renderer.domElement.removeEventListener('pointermove',onMove); renderer.domElement.removeEventListener('pointerleave',onLeave); }
      geo.dispose(); material.dispose(); renderer.dispose(); renderer.forceContextLoss();
      renderer.domElement.parentElement?.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="floating-lines-container" style={{mixBlendMode}} />;
}
