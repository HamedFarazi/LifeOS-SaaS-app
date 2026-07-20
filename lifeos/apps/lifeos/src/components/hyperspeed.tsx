/**
 * Hyperspeed — React Bits official implementation (TypeScript)
 * Source: https://reactbits.dev/backgrounds/hyperspeed
 * Fix: ShaderChunk fog directives separated with newlines to avoid GLSL preprocessor errors.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset } from 'postprocessing';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface HyperspeedProps {
  effectOptions?: Record<string, unknown>;
  style?: React.CSSProperties;
  className?: string;
}

// ── helpers ───────────────────────────────────────────────────────────────────
const random = (base: number | number[]) =>
  Array.isArray(base) ? Math.random() * (base[1] - base[0]) + base[0] : Math.random() * base;
const pickRandom = (arr: any) =>
  Array.isArray(arr) ? arr[Math.floor(Math.random() * arr.length)] : arr;
function lerp(current: number, target: number, speed = 0.1, limit = 0.001) {
  const change = (target - current) * speed;
  return Math.abs(change) < limit ? target - current : change;
}
const nsin = (val: number) => Math.sin(val) * 0.5 + 0.5;

// ── fog chunk helpers (each on its own line for GLSL preprocessor) ────────────
// We build fog strings with explicit newlines so #ifdef directives are line-start.
const fogParsFrag  = '\n' + THREE.ShaderChunk['fog_pars_fragment']  + '\n';
const fogFrag      = '\n' + THREE.ShaderChunk['fog_fragment']       + '\n';
const fogParsVert  = '\n' + THREE.ShaderChunk['fog_pars_vertex']    + '\n';
const fogVert      = '\n' + THREE.ShaderChunk['fog_vertex']         + '\n';

// ── distortion definitions ────────────────────────────────────────────────────
const turbulentUniforms = {
  uFreq: { value: new THREE.Vector4(4, 8, 8, 1) },
  uAmp:  { value: new THREE.Vector4(25, 5, 10, 10) },
};
const deepUniforms = {
  uFreq: { value: new THREE.Vector2(4, 8) },
  uAmp:  { value: new THREE.Vector2(10, 20) },
  uPowY: { value: new THREE.Vector2(20, 2) },
};
const mountainUniforms = {
  uFreq: { value: new THREE.Vector3(3, 6, 10) },
  uAmp:  { value: new THREE.Vector3(30, 30, 20) },
};
const xyUniforms = {
  uFreq: { value: new THREE.Vector2(5, 2) },
  uAmp:  { value: new THREE.Vector2(25, 15) },
};
const LongRaceUniforms = {
  uFreq: { value: new THREE.Vector2(2, 3) },
  uAmp:  { value: new THREE.Vector2(35, 10) },
};

const distortions: Record<string, any> = {
  turbulentDistortion: {
    uniforms: turbulentUniforms,
    getDistortion: `
      uniform vec4 uFreq;
      uniform vec4 uAmp;
      float nsin(float val){ return sin(val)*0.5+0.5; }
      #define PI 3.14159265358979
      float getDistortionX(float progress){
        return (cos(PI*progress*uFreq.r+uTime)*uAmp.r + pow(cos(PI*progress*uFreq.g+uTime*(uFreq.g/uFreq.r)),2.)*uAmp.g);
      }
      float getDistortionY(float progress){
        return (-nsin(PI*progress*uFreq.b+uTime)*uAmp.b + -pow(nsin(PI*progress*uFreq.a+uTime/(uFreq.b/uFreq.a)),5.)*uAmp.a);
      }
      vec3 getDistortion(float progress){
        return vec3(getDistortionX(progress)-getDistortionX(0.0125), getDistortionY(progress)-getDistortionY(0.0125), 0.);
      }
    `,
    getJS: (progress: number, time: number) => {
      const uFreq = turbulentUniforms.uFreq.value;
      const uAmp  = turbulentUniforms.uAmp.value;
      const getX = (p: number) => Math.cos(Math.PI*p*uFreq.x+time)*uAmp.x + Math.pow(Math.cos(Math.PI*p*uFreq.y+time*(uFreq.y/uFreq.x)),2)*uAmp.y;
      const getY = (p: number) => -nsin(Math.PI*p*uFreq.z+time)*uAmp.z - Math.pow(nsin(Math.PI*p*uFreq.w+time/(uFreq.z/uFreq.w)),5)*uAmp.w;
      return new THREE.Vector3(getX(progress)-getX(progress+0.007), getY(progress)-getY(progress+0.007), 0)
        .multiply(new THREE.Vector3(-2,-5,0)).add(new THREE.Vector3(0,0,-10));
    },
  },
  mountainDistortion: {
    uniforms: mountainUniforms,
    getDistortion: `
      uniform vec3 uAmp; uniform vec3 uFreq;
      #define PI 3.14159265358979
      float nsin(float val){ return sin(val)*0.5+0.5; }
      vec3 getDistortion(float progress){
        float fix=0.02;
        return vec3(
          cos(progress*PI*uFreq.x+uTime)*uAmp.x - cos(fix*PI*uFreq.x+uTime)*uAmp.x,
          nsin(progress*PI*uFreq.y+uTime)*uAmp.y - nsin(fix*PI*uFreq.y+uTime)*uAmp.y,
          nsin(progress*PI*uFreq.z+uTime)*uAmp.z - nsin(fix*PI*uFreq.z+uTime)*uAmp.z
        );
      }
    `,
    getJS: (progress: number, time: number) => {
      const fix=0.02, f=mountainUniforms.uFreq.value, a=mountainUniforms.uAmp.value;
      return new THREE.Vector3(
        Math.cos(progress*Math.PI*f.x+time)*a.x - Math.cos(fix*Math.PI*f.x+time)*a.x,
        nsin(progress*Math.PI*f.y+time)*a.y - nsin(fix*Math.PI*f.y+time)*a.y,
        nsin(progress*Math.PI*f.z+time)*a.z - nsin(fix*Math.PI*f.z+time)*a.z,
      ).multiply(new THREE.Vector3(2,2,2)).add(new THREE.Vector3(0,0,-5));
    },
  },
  xyDistortion: {
    uniforms: xyUniforms,
    getDistortion: `
      uniform vec2 uFreq; uniform vec2 uAmp;
      #define PI 3.14159265358979
      vec3 getDistortion(float progress){
        float fix=0.02;
        return vec3(
          cos(progress*PI*uFreq.x+uTime)*uAmp.x - cos(fix*PI*uFreq.x+uTime)*uAmp.x,
          sin(progress*PI*uFreq.y+PI/2.+uTime)*uAmp.y - sin(fix*PI*uFreq.y+PI/2.+uTime)*uAmp.y,
          0.
        );
      }
    `,
    getJS: (progress: number, time: number) => {
      const fix=0.02, f=xyUniforms.uFreq.value, a=xyUniforms.uAmp.value;
      return new THREE.Vector3(
        Math.cos(progress*Math.PI*f.x+time)*a.x - Math.cos(fix*Math.PI*f.x+time)*a.x,
        Math.sin(progress*Math.PI*f.y+time+Math.PI/2)*a.y - Math.sin(fix*Math.PI*f.y+time+Math.PI/2)*a.y, 0,
      ).multiply(new THREE.Vector3(2,0.4,1)).add(new THREE.Vector3(0,0,-3));
    },
  },
  LongRaceDistortion: {
    uniforms: LongRaceUniforms,
    getDistortion: `
      uniform vec2 uFreq; uniform vec2 uAmp;
      #define PI 3.14159265358979
      vec3 getDistortion(float progress){
        float cam=0.0125;
        return vec3(
          sin(progress*PI*uFreq.x+uTime)*uAmp.x - sin(cam*PI*uFreq.x+uTime)*uAmp.x,
          sin(progress*PI*uFreq.y+uTime)*uAmp.y - sin(cam*PI*uFreq.y+uTime)*uAmp.y,
          0.
        );
      }
    `,
    getJS: (progress: number, time: number) => {
      const cam=0.0125, f=LongRaceUniforms.uFreq.value, a=LongRaceUniforms.uAmp.value;
      return new THREE.Vector3(
        Math.sin(progress*Math.PI*f.x+time)*a.x - Math.sin(cam*Math.PI*f.x+time)*a.x,
        Math.sin(progress*Math.PI*f.y+time)*a.y - Math.sin(cam*Math.PI*f.y+time)*a.y, 0,
      ).multiply(new THREE.Vector3(1,1,0)).add(new THREE.Vector3(0,0,-5));
    },
  },
  deepDistortion: {
    uniforms: deepUniforms,
    getDistortion: `
      uniform vec2 uFreq; uniform vec2 uAmp; uniform vec2 uPowY;
      #define PI 3.14159265358979
      float nsin(float val){ return sin(val)*0.5+0.5; }
      vec3 getDistortion(float progress){
        return vec3(
          sin(progress*PI*uFreq.x+uTime)*uAmp.x - sin(0.02*PI*uFreq.x+uTime)*uAmp.x,
          pow(abs(progress*uPowY.x),uPowY.y)+sin(progress*PI*uFreq.y+uTime)*uAmp.y - (pow(abs(0.02*uPowY.x),uPowY.y)+sin(0.02*PI*uFreq.y+uTime)*uAmp.y),
          0.
        );
      }
    `,
    getJS: (progress: number, time: number) => {
      const f=deepUniforms.uFreq.value, a=deepUniforms.uAmp.value, py=deepUniforms.uPowY.value;
      const getX=(p: number)=>Math.sin(p*Math.PI*f.x+time)*a.x;
      const getY=(p: number)=>Math.pow(p*py.x,py.y)+Math.sin(p*Math.PI*f.y+time)*a.y;
      return new THREE.Vector3(getX(progress)-getX(progress+0.01), getY(progress)-getY(progress+0.01), 0)
        .multiply(new THREE.Vector3(-2,-4,0)).add(new THREE.Vector3(0,0,-10));
    },
  },
};

// ── Shader sources — each on own line so #ifdef is at line start ──────────────
const carLightsFragment = [
  '#define USE_FOG;',
  fogParsFrag,
  'varying vec3 vColor;',
  'varying vec2 vUv;',
  'uniform vec2 uFade;',
  'void main() {',
  '  vec3 color = vec3(vColor);',
  '  float alpha = smoothstep(uFade.x, uFade.y, vUv.x);',
  '  gl_FragColor = vec4(color, alpha);',
  '  if (gl_FragColor.a < 0.0001) discard;',
  fogFrag,
  '}',
].join('\n');

const carLightsVertex = [
  '#define USE_FOG;',
  fogParsVert,
  'attribute vec3 aOffset;',
  'attribute vec3 aMetrics;',
  'attribute vec3 aColor;',
  'uniform float uTravelLength;',
  'uniform float uTime;',
  'varying vec2 vUv;',
  'varying vec3 vColor;',
  '#include <getDistortion_vertex>',
  'void main() {',
  '  vec3 transformed = position.xyz;',
  '  float radius = aMetrics.r;',
  '  float myLength = aMetrics.g;',
  '  float speed = aMetrics.b;',
  '  transformed.xy *= radius;',
  '  transformed.z *= myLength;',
  '  transformed.z += myLength - mod(uTime * speed + aOffset.z, uTravelLength);',
  '  transformed.xy += aOffset.xy;',
  '  float progress = abs(transformed.z / uTravelLength);',
  '  transformed.xyz += getDistortion(progress);',
  '  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);',
  '  gl_Position = projectionMatrix * mvPosition;',
  '  vUv = uv;',
  '  vColor = aColor;',
  fogVert,
  '}',
].join('\n');

const sideSticksVertex = [
  '#define USE_FOG;',
  fogParsVert,
  'attribute float aOffset;',
  'attribute vec3 aColor;',
  'attribute vec2 aMetrics;',
  'uniform float uTravelLength;',
  'uniform float uTime;',
  'varying vec3 vColor;',
  'mat4 rotationY(in float angle){',
  '  return mat4(cos(angle),0,sin(angle),0, 0,1,0,0, -sin(angle),0,cos(angle),0, 0,0,0,1);',
  '}',
  '#include <getDistortion_vertex>',
  'void main(){',
  '  vec3 transformed = position.xyz;',
  '  float width = aMetrics.x; float height = aMetrics.y;',
  '  transformed.xy *= vec2(width, height);',
  '  float time = mod(uTime * 60. * 2. + aOffset, uTravelLength);',
  '  transformed = (rotationY(3.14/2.) * vec4(transformed,1.)).xyz;',
  '  transformed.z += -uTravelLength + time;',
  '  float progress = abs(transformed.z / uTravelLength);',
  '  transformed.xyz += getDistortion(progress);',
  '  transformed.y += height / 2.;',
  '  transformed.x += -width / 2.;',
  '  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);',
  '  gl_Position = projectionMatrix * mvPosition;',
  '  vColor = aColor;',
  fogVert,
  '}',
].join('\n');

const sideSticksFragment = [
  '#define USE_FOG;',
  fogParsFrag,
  'varying vec3 vColor;',
  'void main(){',
  '  gl_FragColor = vec4(vColor, 1.);',
  fogFrag,
  '}',
].join('\n');

const roadVertex = [
  '#define USE_FOG;',
  'uniform float uTime;',
  fogParsVert,
  'uniform float uTravelLength;',
  'varying vec2 vUv;',
  '#include <getDistortion_vertex>',
  'void main() {',
  '  vec3 transformed = position.xyz;',
  '  vec3 distortion = getDistortion((transformed.y + uTravelLength/2.) / uTravelLength);',
  '  transformed.x += distortion.x;',
  '  transformed.z += distortion.y;',
  '  transformed.y += -1. * distortion.z;',
  '  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);',
  '  gl_Position = projectionMatrix * mvPosition;',
  '  vUv = uv;',
  fogVert,
  '}',
].join('\n');

const roadMarkings_vars = `
uniform float uLanes;
uniform vec3 uBrokenLinesColor;
uniform vec3 uShoulderLinesColor;
uniform float uShoulderLinesWidthPercentage;
uniform float uBrokenLinesLengthPercentage;
uniform float uBrokenLinesWidthPercentage;
`;

const roadMarkings_fragment = `
uv.y = mod(uv.y + uTime * 0.05, 1.);
float laneWidth = 1.0 / uLanes;
float brokenLineWidth = laneWidth * uBrokenLinesWidthPercentage;
float laneEmptySpace = 1. - uBrokenLinesLengthPercentage;
float brokenLines = step(1.0-brokenLineWidth, fract(uv.x*2.0)) * step(laneEmptySpace, fract(uv.y*10.0));
float sideLines = step(1.0-brokenLineWidth, fract((uv.x - laneWidth*(uLanes-1.0))*2.0)) + step(brokenLineWidth, uv.x);
brokenLines = mix(brokenLines, sideLines, uv.x);
`;

const roadBaseFragment = [
  '#define USE_FOG;',
  'varying vec2 vUv;',
  'uniform vec3 uColor;',
  'uniform float uTime;',
  '// roadMarkings_vars_placeholder',
  fogParsFrag,
  'void main() {',
  '  vec2 uv = vUv;',
  '  vec3 color = vec3(uColor);',
  '  // roadMarkings_fragment_placeholder',
  '  gl_FragColor = vec4(color, 1.);',
  fogFrag,
  '}',
].join('\n');

const islandFragment = roadBaseFragment
  .replace('// roadMarkings_vars_placeholder', '')
  .replace('// roadMarkings_fragment_placeholder', '');

const roadFragment = roadBaseFragment
  .replace('// roadMarkings_vars_placeholder', roadMarkings_vars)
  .replace('// roadMarkings_fragment_placeholder', roadMarkings_fragment);

// ── App class ─────────────────────────────────────────────────────────────────
class App {
  options: any; container: HTMLElement;
  renderer!: THREE.WebGLRenderer; composer!: EffectComposer;
  camera!: THREE.PerspectiveCamera; scene!: THREE.Scene;
  fogUniforms: any; clock: THREE.Clock;
  road: any; leftCarLights: any; rightCarLights: any; leftSticks: any;
  fovTarget: number; speedUpTarget = 0; speedUp = 0; timeOffset = 0;
  disposed = false; hasValidSize = false;
  tick: () => void; init: () => void; setSize: (w: number, h: number, s: boolean) => void;
  onMouseDown: (e: Event) => void; onMouseUp: (e: Event) => void;
  onTouchStart: (e: Event) => void; onTouchEnd: (e: Event) => void;
  onContextMenu: (e: Event) => void; onWindowResize: () => void;

  constructor(container: HTMLElement, options: any) {
    this.options = options; this.container = container;
    if (!options.distortion) options.distortion = distortions.turbulentDistortion;
    this.fovTarget = options.fov;
    const initW = Math.max(1, container.offsetWidth);
    const initH = Math.max(1, container.offsetHeight);
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setSize(initW, initH, false);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.composer = new EffectComposer(this.renderer);
    container.append(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(options.fov, initW / initH, 0.1, 10000);
    this.camera.position.set(0, 8, -5);
    this.scene = new THREE.Scene(); this.scene.background = null;
    const fog = new THREE.Fog(options.colors.background, options.length * 0.2, options.length * 500);
    this.scene.fog = fog;
    this.fogUniforms = { fogColor: { value: fog.color }, fogNear: { value: fog.near }, fogFar: { value: fog.far } };
    this.clock = new THREE.Clock();
    this.hasValidSize = initW > 0 && initH > 0;
    this.road = new Road(this, options);
    this.leftCarLights  = new CarLights(this, options, options.colors.leftCars,  options.movingAwaySpeed,   new THREE.Vector2(0, 1 - options.carLightsFade));
    this.rightCarLights = new CarLights(this, options, options.colors.rightCars, options.movingCloserSpeed, new THREE.Vector2(1, 0 + options.carLightsFade));
    this.leftSticks = new LightsSticks(this, options);

    this.tick = this._tick.bind(this);
    this.init = this._init.bind(this);
    this.setSize = this._setSize.bind(this);
    this.onWindowResize = this._onWindowResize.bind(this);
    this.onMouseDown = (e: Event) => { if (options.onSpeedUp) options.onSpeedUp(e); this.fovTarget = options.fovSpeedUp; this.speedUpTarget = options.speedUp; };
    this.onMouseUp   = (e: Event) => { if (options.onSlowDown) options.onSlowDown(e); this.fovTarget = options.fov; this.speedUpTarget = 0; };
    this.onTouchStart = this.onMouseDown; this.onTouchEnd = this.onMouseUp;
    this.onContextMenu = (e: Event) => e.preventDefault();
    window.addEventListener('resize', this.onWindowResize);
  }

  _onWindowResize() {
    const w = this.container.offsetWidth, h = this.container.offsetHeight;
    if (w <= 0 || h <= 0) { this.hasValidSize = false; return; }
    this.renderer.setSize(w, h); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.composer.setSize(w, h); this.hasValidSize = true;
  }

  initPasses() {
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.composer.addPass(new EffectPass(this.camera, new BloomEffect({ luminanceThreshold: 0.2, luminanceSmoothing: 0, resolutionScale: 1 })));
    const smaa = new EffectPass(this.camera, new SMAAEffect({ preset: SMAAPreset.MEDIUM }));
    smaa.renderToScreen = true; this.composer.addPass(smaa);
  }

  _init() {
    this.initPasses();
    const o = this.options;
    this.road.init();
    this.leftCarLights.init();  this.leftCarLights.mesh.position.setX(-o.roadWidth/2 - o.islandWidth/2);
    this.rightCarLights.init(); this.rightCarLights.mesh.position.setX(o.roadWidth/2 + o.islandWidth/2);
    this.leftSticks.init();     this.leftSticks.mesh.position.setX(-(o.roadWidth + o.islandWidth/2));
    this.container.addEventListener('mousedown', this.onMouseDown);
    this.container.addEventListener('mouseup',   this.onMouseUp);
    this.container.addEventListener('mouseout',  this.onMouseUp);
    this.container.addEventListener('touchstart',  this.onTouchStart, { passive: true });
    this.container.addEventListener('touchend',    this.onTouchEnd,   { passive: true });
    this.container.addEventListener('touchcancel', this.onTouchEnd,   { passive: true });
    this.container.addEventListener('contextmenu', this.onContextMenu);
    this.tick();
  }

  _setSize(w: number, h: number, s: boolean) {
    if (w <= 0 || h <= 0) { this.hasValidSize = false; return; }
    this.composer.setSize(w, h, s); this.hasValidSize = true;
  }

  update(delta: number) {
    const lp = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta);
    this.speedUp += lerp(this.speedUp, this.speedUpTarget, lp, 0.00001);
    this.timeOffset += this.speedUp * delta;
    const time = this.clock.elapsedTime + this.timeOffset;
    this.rightCarLights.update(time); this.leftCarLights.update(time); this.leftSticks.update(time); this.road.update(time);
    let updateCamera = false;
    const fovChange = lerp(this.camera.fov, this.fovTarget, lp);
    if (fovChange !== 0) { this.camera.fov += fovChange * delta * 6; updateCamera = true; }
    if (this.options.distortion.getJS) {
      const d = this.options.distortion.getJS(0.025, time);
      this.camera.lookAt(new THREE.Vector3(this.camera.position.x+d.x, this.camera.position.y+d.y, this.camera.position.z+d.z));
      updateCamera = true;
    }
    if (updateCamera) this.camera.updateProjectionMatrix();
  }

  _tick() {
    if (this.disposed) return;
    if (!this.hasValidSize) {
      const w = this.container.offsetWidth, h = this.container.offsetHeight;
      if (w > 0 && h > 0) { this.renderer.setSize(w,h,false); this.camera.aspect=w/h; this.camera.updateProjectionMatrix(); this.composer.setSize(w,h); this.hasValidSize=true; }
      else { requestAnimationFrame(this.tick); return; }
    }
    const canvas = this.renderer.domElement;
    if (canvas.clientWidth>0 && canvas.clientHeight>0 && (canvas.width!==canvas.clientWidth || canvas.height!==canvas.clientHeight)) {
      this._setSize(canvas.clientWidth, canvas.clientHeight, false);
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight; this.camera.updateProjectionMatrix();
    }
    const delta = this.clock.getDelta();
    this.composer.render(delta); this.update(delta);
    requestAnimationFrame(this.tick);
  }

  dispose() {
    this.disposed = true;
    if (this.scene) { this.scene.traverse((o: any) => { if (!o.isMesh) return; o.geometry?.dispose(); Array.isArray(o.material)?o.material.forEach((m:any)=>m.dispose()):o.material?.dispose(); }); this.scene.clear(); }
    if (this.renderer) { this.renderer.dispose(); this.renderer.forceContextLoss(); this.renderer.domElement.parentNode?.removeChild(this.renderer.domElement); }
    this.composer?.dispose();
    window.removeEventListener('resize', this.onWindowResize);
    if (this.container) {
      this.container.removeEventListener('mousedown', this.onMouseDown); this.container.removeEventListener('mouseup', this.onMouseUp); this.container.removeEventListener('mouseout', this.onMouseUp);
      this.container.removeEventListener('touchstart', this.onTouchStart); this.container.removeEventListener('touchend', this.onTouchEnd); this.container.removeEventListener('touchcancel', this.onTouchEnd);
      this.container.removeEventListener('contextmenu', this.onContextMenu);
    }
  }
}

// ── Road, CarLights, LightsSticks ────────────────────────────────────────────
class Road {
  webgl: App; options: any; uTime = { value: 0 };
  constructor(webgl: App, options: any) { this.webgl = webgl; this.options = options; }
  createPlane(side: number, _w: number, isRoad: boolean) {
    const o = this.options;
    const geo = new THREE.PlaneGeometry(isRoad ? o.roadWidth : o.islandWidth, o.length, 20, 100);
    let uniforms: any = { uTravelLength:{value:o.length}, uColor:{value:new THREE.Color(isRoad?o.colors.roadColor:o.colors.islandColor)}, uTime:this.uTime };
    if (isRoad) uniforms = { ...uniforms, uLanes:{value:o.lanesPerRoad}, uBrokenLinesColor:{value:new THREE.Color(o.colors.brokenLines)}, uShoulderLinesColor:{value:new THREE.Color(o.colors.shoulderLines)}, uShoulderLinesWidthPercentage:{value:o.shoulderLinesWidthPercentage}, uBrokenLinesLengthPercentage:{value:o.brokenLinesLengthPercentage}, uBrokenLinesWidthPercentage:{value:o.brokenLinesWidthPercentage} };
    const mat = new THREE.ShaderMaterial({ fragmentShader:isRoad?roadFragment:islandFragment, vertexShader:roadVertex, side:THREE.DoubleSide, uniforms:Object.assign(uniforms, this.webgl.fogUniforms, o.distortion.uniforms) });
    mat.onBeforeCompile = (s: any) => { s.vertexShader = s.vertexShader.replace('#include <getDistortion_vertex>', o.distortion.getDistortion); };
    const mesh = new THREE.Mesh(geo, mat); mesh.rotation.x=-Math.PI/2; mesh.position.z=-o.length/2; mesh.position.x+=(o.islandWidth/2+o.roadWidth/2)*side; this.webgl.scene.add(mesh); return mesh;
  }
  init() { this.createPlane(-1,this.options.roadWidth,true); this.createPlane(1,this.options.roadWidth,true); this.createPlane(0,this.options.islandWidth,false); }
  update(time: number) { this.uTime.value = time; }
}

class CarLights {
  webgl: App; options: any; colors: any; speed: any; fade: THREE.Vector2; mesh!: THREE.Mesh;
  constructor(webgl: App, options: any, colors: any, speed: any, fade: THREE.Vector2) { this.webgl=webgl; this.options=options; this.colors=colors; this.speed=speed; this.fade=fade; }
  init() {
    const o = this.options;
    const curve = new THREE.LineCurve3(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,-1));
    const geo = new THREE.TubeGeometry(curve, 40, 1, 8, false);
    const inst = new THREE.InstancedBufferGeometry(); inst.copy(geo as any);
    inst.instanceCount = o.lightPairsPerRoadWay * 2;
    const lw = o.roadWidth / o.lanesPerRoad;
    const aOffset: number[]=[], aMetrics: number[]=[], aColor: number[]=[];
    const cols = Array.isArray(this.colors) ? this.colors.map((c: any) => new THREE.Color(c)) : new THREE.Color(this.colors);
    for (let i=0; i<o.lightPairsPerRoadWay; i++) {
      const r=random(o.carLightsRadius), len=random(o.carLightsLength), sp=random(this.speed);
      const lane=i%o.lanesPerRoad; let lx=lane*lw-o.roadWidth/2+lw/2+random(o.carShiftX)*lw;
      const cw=random(o.carWidthPercentage)*lw, oy=random(o.carFloorSeparation)+r*1.3, oz=-random(o.length);
      aOffset.push(lx-cw/2,oy,oz, lx+cw/2,oy,oz); aMetrics.push(r,len,sp, r,len,sp);
      const col: THREE.Color = pickRandom(cols); aColor.push(col.r,col.g,col.b, col.r,col.g,col.b);
    }
    inst.setAttribute('aOffset',  new THREE.InstancedBufferAttribute(new Float32Array(aOffset),3,false));
    inst.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(new Float32Array(aMetrics),3,false));
    inst.setAttribute('aColor',   new THREE.InstancedBufferAttribute(new Float32Array(aColor),3,false));
    const mat = new THREE.ShaderMaterial({ fragmentShader:carLightsFragment, vertexShader:carLightsVertex, transparent:true, uniforms:Object.assign({uTime:{value:0},uTravelLength:{value:o.length},uFade:{value:this.fade}},this.webgl.fogUniforms,o.distortion.uniforms) });
    mat.onBeforeCompile = (s: any) => { s.vertexShader = s.vertexShader.replace('#include <getDistortion_vertex>', o.distortion.getDistortion); };
    this.mesh = new THREE.Mesh(inst, mat); this.mesh.frustumCulled=false; this.webgl.scene.add(this.mesh);
  }
  update(time: number) { (this.mesh.material as THREE.ShaderMaterial).uniforms.uTime.value = time; }
}

class LightsSticks {
  webgl: App; options: any; mesh!: THREE.Mesh;
  constructor(webgl: App, options: any) { this.webgl=webgl; this.options=options; }
  init() {
    const o = this.options;
    const geo = new THREE.PlaneGeometry(1,1);
    const inst = new THREE.InstancedBufferGeometry(); inst.copy(geo as any);
    inst.instanceCount = o.totalSideLightSticks;
    const stickOffset = o.length/(o.totalSideLightSticks-1);
    const aOffset: number[]=[], aColor: number[]=[], aMetrics: number[]=[];
    const cols = Array.isArray(o.colors.sticks) ? o.colors.sticks.map((c: any)=>new THREE.Color(c)) : new THREE.Color(o.colors.sticks);
    for (let i=0; i<o.totalSideLightSticks; i++) {
      aOffset.push((i-1)*stickOffset*2+stickOffset*Math.random());
      const col: THREE.Color = pickRandom(cols); aColor.push(col.r,col.g,col.b);
      aMetrics.push(random(o.lightStickWidth), random(o.lightStickHeight));
    }
    inst.setAttribute('aOffset',  new THREE.InstancedBufferAttribute(new Float32Array(aOffset),1,false));
    inst.setAttribute('aColor',   new THREE.InstancedBufferAttribute(new Float32Array(aColor),3,false));
    inst.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(new Float32Array(aMetrics),2,false));
    const mat = new THREE.ShaderMaterial({ fragmentShader:sideSticksFragment, vertexShader:sideSticksVertex, side:THREE.DoubleSide, uniforms:Object.assign({uTravelLength:{value:o.length},uTime:{value:0}},this.webgl.fogUniforms,o.distortion.uniforms) });
    mat.onBeforeCompile = (s: any) => { s.vertexShader = s.vertexShader.replace('#include <getDistortion_vertex>', o.distortion.getDistortion); };
    this.mesh = new THREE.Mesh(inst, mat); this.mesh.frustumCulled=false; this.webgl.scene.add(this.mesh);
  }
  update(time: number) { (this.mesh.material as THREE.ShaderMaterial).uniforms.uTime.value = time; }
}

// ── Default options & React component ────────────────────────────────────────
export const DEFAULT_HYPERSPEED_OPTS = {
  onSpeedUp: () => {}, onSlowDown: () => {},
  distortion: 'turbulentDistortion',
  length: 400, roadWidth: 10, islandWidth: 2, lanesPerRoad: 4,
  fov: 90, fovSpeedUp: 150, speedUp: 2, carLightsFade: 0.4,
  totalSideLightSticks: 20, lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05, brokenLinesWidthPercentage: 0.1, brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5], lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80], movingCloserSpeed: [-120, -160],
  carLightsLength: [400*0.03, 400*0.2], carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5], carShiftX: [-0.8, 0.8], carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x080808, islandColor: 0x0a0a0a, background: 0x000000,
    shoulderLines: 0xffffff, brokenLines: 0xffffff,
    leftCars: [0xd856bf, 0x6750a2, 0xc247ac], rightCars: [0x03b3c3, 0x0e5ea5, 0x324555], sticks: 0x03b3c3,
  },
};

export default function Hyperspeed({ effectOptions, style, className }: HyperspeedProps) {
  const ref    = useRef<HTMLDivElement>(null);
  const appRef = useRef<App | null>(null);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    let raf: number;
    raf = requestAnimationFrame(() => {
      if (appRef.current) { appRef.current.dispose(); appRef.current = null; while(el.firstChild) el.removeChild(el.firstChild); }
      const opts = { ...DEFAULT_HYPERSPEED_OPTS, ...(effectOptions??{}), colors: { ...DEFAULT_HYPERSPEED_OPTS.colors, ...((effectOptions as any)?.colors??{}) } };
      if (typeof opts.distortion === 'string') opts.distortion = distortions[opts.distortion] ?? distortions.turbulentDistortion;
      const app = new App(el, opts);
      appRef.current = app;
      app.init();
    });
    return () => { cancelAnimationFrame(raf); appRef.current?.dispose(); appRef.current = null; };
  }, [effectOptions]);

  return (
    <div ref={ref} className={className}
      style={{ width:'100%', height:'100%', overflow:'hidden', position:'absolute', top:0, left:0, ...style }}
    />
  );
}
