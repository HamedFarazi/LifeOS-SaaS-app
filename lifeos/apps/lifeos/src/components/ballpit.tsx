/**
 * Ballpit — React Bits inspired implementation (TypeScript)
 * Features:
 *  - gravity=0 → floating/zero-gravity mode (balls drift, not fall)
 *  - scroll reaction: scroll impulse kicks all balls
 *  - mouse/pointer follow: cursor sphere pushes balls
 *  - Uses standard MeshPhysicalMaterial (no custom shader — Three.js r150+ compat)
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import {
  Vector3, MeshPhysicalMaterial, InstancedMesh,
  AmbientLight, SphereGeometry, Scene, Color, Object3D,
  SRGBColorSpace, MathUtils, PMREMGenerator, WebGLRenderer,
  PerspectiveCamera, PointLight, ACESFilmicToneMapping,
  Plane, Raycaster, Vector2,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface BallpitProps {
  className?: string;
  count?: number;
  gravity?: number;
  friction?: number;
  wallBounce?: number;
  followCursor?: boolean;
  colors?: number[];
  minSize?: number;
  maxSize?: number;
  scrollReaction?: boolean;
}

const { randFloat, randFloatSpread } = MathUtils;

interface PhysicsCfg {
  count: number; gravity: number; friction: number; wallBounce: number;
  maxVelocity: number; maxX: number; maxY: number; maxZ: number;
  minSize: number; maxSize: number; size0: number;
  controlSphere0: boolean; followCursor: boolean;
}

// shared temp vectors — never used concurrently
const tA = new Vector3(), tB = new Vector3(), tC = new Vector3();
const tD = new Vector3(), tE = new Vector3(), tF = new Vector3();
const tG = new Vector3(), tH = new Vector3();

class BallPhysics {
  cfg: PhysicsCfg;
  pos: Float32Array;
  vel: Float32Array;
  sizes: Float32Array;
  center = new Vector3();

  constructor(cfg: PhysicsCfg) {
    this.cfg   = cfg;
    this.pos   = new Float32Array(3 * cfg.count).fill(0);
    this.vel   = new Float32Array(3 * cfg.count).fill(0);
    this.sizes = new Float32Array(cfg.count).fill(1);
    this.center.toArray(this.pos, 0);
    for (let i = 1; i < cfg.count; i++) {
      this.pos[3*i]   = randFloatSpread(2 * cfg.maxX);
      this.pos[3*i+1] = randFloatSpread(2 * cfg.maxY);
      this.pos[3*i+2] = randFloatSpread(2 * cfg.maxZ);
    }
    this.sizes[0] = cfg.size0;
    for (let i = 1; i < cfg.count; i++) {
      this.sizes[i] = randFloat(cfg.minSize, cfg.maxSize);
    }
  }

  /** Apply an impulse to all non-cursor balls (e.g. from scroll) */
  applyImpulse(ix: number, iy: number, iz: number) {
    const { vel: v, cfg: c } = this;
    const start = c.controlSphere0 ? 1 : 0;
    for (let i = start; i < c.count; i++) {
      const b = 3*i;
      v[b]   += ix * this.sizes[i];
      v[b+1] += iy * this.sizes[i];
      v[b+2] += iz * this.sizes[i];
    }
  }

  step(delta: number) {
    const { cfg: c, pos: s, vel: v, sizes: n } = this;
    let start = 0;
    if (c.controlSphere0) {
      start = 1;
      tA.fromArray(s, 0).lerp(this.center, 0.1).toArray(s, 0);
      tB.set(0,0,0).toArray(v, 0);
    }

    // integrate velocity → position
    for (let i = start; i < c.count; i++) {
      const b = 3*i;
      tA.fromArray(s,b); tB.fromArray(v,b);
      tB.y -= delta * c.gravity * n[i];
      tB.multiplyScalar(c.friction);
      tB.clampLength(0, c.maxVelocity);
      tA.add(tB);
      tA.toArray(s,b); tB.toArray(v,b);
    }

    // ball-ball collision
    for (let i = start; i < c.count; i++) {
      const b = 3*i; const ri = n[i];
      tA.fromArray(s,b); tB.fromArray(v,b);
      for (let j = i+1; j < c.count; j++) {
        const bj = 3*j; const rj = n[j];
        tC.fromArray(s,bj); tD.fromArray(v,bj);
        tE.copy(tC).sub(tA);
        const dist = tE.length(), sr = ri+rj;
        if (dist < sr && dist > 0.0001) {
          const ov = sr - dist;
          tF.copy(tE).normalize().multiplyScalar(0.5 * ov);
          tG.copy(tF).multiplyScalar(Math.max(tB.length(), 1));
          tH.copy(tF).multiplyScalar(Math.max(tD.length(), 1));
          tA.sub(tF); tB.sub(tG); tA.toArray(s,b); tB.toArray(v,b);
          tC.add(tF); tD.add(tH); tC.toArray(s,bj); tD.toArray(v,bj);
        }
      }

      // cursor sphere repulsion
      if (c.controlSphere0) {
        tE.fromArray(s, 0);
        const diff = tE.clone().sub(tA);
        const d0 = diff.length(), sr0 = ri + n[0];
        if (d0 < sr0 && d0 > 0.0001) {
          tF.copy(diff).normalize().multiplyScalar(sr0 - d0);
          tG.copy(tF).multiplyScalar(Math.max(tB.length(), 2));
          tA.sub(tF); tB.sub(tG);
        }
      }

      // wall bounds
      if (Math.abs(tA.x) + ri > c.maxX) { tA.x = Math.sign(tA.x)*(c.maxX-ri); tB.x = -tB.x*c.wallBounce; }
      if (c.gravity === 0) {
        if (Math.abs(tA.y) + ri > c.maxY) { tA.y = Math.sign(tA.y)*(c.maxY-ri); tB.y = -tB.y*c.wallBounce; }
      } else if (tA.y - ri < -c.maxY) { tA.y = -c.maxY+ri; tB.y = -tB.y*c.wallBounce; }
      const mz = Math.max(c.maxZ, c.maxSize ?? 1);
      if (Math.abs(tA.z) + ri > mz) { tA.z = Math.sign(tA.z)*(c.maxZ-ri); tB.z = -tB.z*c.wallBounce; }

      tA.toArray(s,b); tB.toArray(v,b);
    }
  }
}

const dummy = new Object3D();

class InstancedBalls extends InstancedMesh {
  cfg: PhysicsCfg;
  physics: BallPhysics;
  light: PointLight;

  constructor(renderer: WebGLRenderer, opts: Partial<PhysicsCfg> & { colors?: number[]; lightIntensity?: number }) {
    const cfg: PhysicsCfg = {
      count: 200, gravity: 0, friction: 0.98, wallBounce: 0.95,
      maxVelocity: 0.15, maxX: 5, maxY: 5, maxZ: 2,
      minSize: 0.5, maxSize: 1, size0: 1,
      controlSphere0: false, followCursor: true,
      ...opts,
    };

    const pmrem  = new PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const geo = new SphereGeometry(1, 16, 16);
    const mat = new MeshPhysicalMaterial({
      envMap: envTex,
      metalness: 0.5, roughness: 0.5,
      clearcoat: 1,   clearcoatRoughness: 0.15,
    });

    super(geo, mat, cfg.count);
    this.cfg     = cfg;
    this.physics = new BallPhysics(cfg);

    const ambient = new AmbientLight(0xffffff, 1);
    this.add(ambient);
    this.light = new PointLight(0xffffff, opts.lightIntensity ?? 200);
    this.add(this.light);

    const colors = opts.colors ?? [];
    if (colors.length > 1) {
      const stops = colors.map(c => new Color(c));
      const lerped = new Color();
      for (let i = 0; i < cfg.count; i++) {
        const t = i / (cfg.count - 1);
        const scaled = t * (stops.length - 1);
        const idx = Math.floor(scaled);
        const alpha = scaled - idx;
        const a = stops[idx], b = stops[Math.min(idx+1, stops.length-1)];
        lerped.setRGB(a.r+alpha*(b.r-a.r), a.g+alpha*(b.g-a.g), a.b+alpha*(b.b-a.b));
        this.setColorAt(i, lerped);
        if (i === 0) this.light.color.copy(lerped);
      }
      if (this.instanceColor) this.instanceColor.needsUpdate = true;
    }
  }

  update(delta: number) {
    this.physics.step(delta);
    for (let i = 0; i < this.cfg.count; i++) {
      dummy.position.fromArray(this.physics.pos, 3*i);
      dummy.scale.setScalar(i === 0 && !this.cfg.followCursor ? 0 : this.physics.sizes[i]);
      dummy.updateMatrix();
      this.setMatrixAt(i, dummy.matrix);
      if (i === 0) this.light.position.copy(dummy.position);
    }
    this.instanceMatrix.needsUpdate = true;
  }
}

function createBallpit(
  canvas: HTMLCanvasElement,
  opts: BallpitProps & Partial<PhysicsCfg> = {}
) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;

  const camera = new PerspectiveCamera(75, 1, 0.1, 100);
  camera.position.set(0, 0, 20);
  camera.lookAt(0, 0, 0);

  const scene = new Scene();
  const balls = new InstancedBalls(renderer, opts as any);
  scene.add(balls);

  function resize() {
    const p = canvas.parentElement;
    const w = Math.max(p?.clientWidth ?? 1, 1);
    const h = Math.max(p?.clientHeight ?? 1, 1);
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const fovR = (camera.fov * Math.PI) / 180;
    const wH = 2 * Math.tan(fovR / 2) * camera.position.length();
    balls.cfg.maxX = (wH * camera.aspect) / 2;
    balls.cfg.maxY = wH / 2;
  }
  resize();
  const ro = new ResizeObserver(resize);
  if (canvas.parentElement) ro.observe(canvas.parentElement);

  // ── mouse / pointer tracking ──────────────────────────────────────────────
  const raycaster = new Raycaster();
  const plane = new Plane(new Vector3(0, 0, 1), 0);
  const hit   = new Vector3();
  const nPos  = new Vector2();

  function onMove(e: PointerEvent) {
    const r = canvas.getBoundingClientRect();
    nPos.x = ((e.clientX - r.left) / r.width)  * 2 - 1;
    nPos.y = -((e.clientY - r.top)  / r.height) * 2 + 1;
    raycaster.setFromCamera(nPos, camera);
    camera.getWorldDirection(plane.normal);
    raycaster.ray.intersectPlane(plane, hit);
    balls.physics.center.copy(hit);
    balls.cfg.controlSphere0 = true;
  }
  function onLeave() { balls.cfg.controlSphere0 = false; }

  if (opts.followCursor !== false) {
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
  }

  // ── scroll reaction ───────────────────────────────────────────────────────
  let lastScrollY = window.scrollY;
  function onScroll() {
    if (opts.scrollReaction === false) return;
    const delta = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    // convert scroll delta to world-space impulse
    const scrollStrength = 0.008;
    const ix = (Math.random() - 0.5) * Math.abs(delta) * scrollStrength * 0.3;
    const iy = -delta * scrollStrength;
    const iz = (Math.random() - 0.5) * Math.abs(delta) * scrollStrength * 0.2;
    balls.physics.applyImpulse(ix, iy, iz);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── random drift for gravity=0 mode ──────────────────────────────────────
  // give balls an initial random velocity so they drift around
  if ((opts.gravity ?? 0) === 0) {
    const initSpeed = 0.04;
    for (let i = 1; i < balls.cfg.count; i++) {
      const b = 3*i;
      balls.physics.vel[b]   = (Math.random() - 0.5) * initSpeed;
      balls.physics.vel[b+1] = (Math.random() - 0.5) * initSpeed;
      balls.physics.vel[b+2] = (Math.random() - 0.5) * initSpeed * 0.3;
    }
  }

  // ── render loop ───────────────────────────────────────────────────────────
  let lastT = performance.now();
  let rafId = 0;
  let disposed = false;

  function loop() {
    if (disposed) return;
    rafId = requestAnimationFrame(loop);
    const now = performance.now();
    const delta = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;
    balls.update(delta);
    renderer.render(scene, camera);
  }
  loop();

  return {
    dispose() {
      disposed = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      scene.traverse((o: any) => {
        if (o.isMesh) { o.geometry?.dispose(); o.material?.dispose(); }
      });
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

export default function Ballpit({
  className = '',
  followCursor = true,
  scrollReaction = true,
  ...props
}: BallpitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instRef   = useRef<{ dispose: () => void } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let raf: number;
    raf = requestAnimationFrame(() => {
      instRef.current = createBallpit(canvas, { followCursor, scrollReaction, ...props });
    });
    return () => {
      cancelAnimationFrame(raf);
      instRef.current?.dispose();
      instRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}
