/**
 * Robot3D — Three.js robot whose head follows the mouse cursor.
 * Inspired by the 21st.dev interactive robot design.
 * No external assets — fully self-contained WebGL.
 */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface Robot3DProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

function buildRobot(scene: THREE.Scene) {
  const group = new THREE.Group();

  // ── shared materials ──────────────────────────────────────────────────────
  const matBody = new THREE.MeshPhysicalMaterial({
    color: 0x1a1a2e,
    metalness: 0.9,
    roughness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  });
  const matPurple = new THREE.MeshPhysicalMaterial({
    color: 0x3d1a6e,
    metalness: 0.8,
    roughness: 0.1,
    clearcoat: 1,
    emissive: new THREE.Color(0x2a0f4e),
    emissiveIntensity: 0.3,
  });
  const matAccent = new THREE.MeshPhysicalMaterial({
    color: 0x5b2d9e,
    metalness: 0.7,
    roughness: 0.2,
    emissive: new THREE.Color(0x3a1a7e),
    emissiveIntensity: 0.4,
  });
  const matEye = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.0,
    roughness: 0.05,
    clearcoat: 1,
    emissive: new THREE.Color(0xdddddd),
    emissiveIntensity: 0.2,
  });
  const matNeck = new THREE.MeshPhysicalMaterial({
    color: 0x0d0d1a,
    metalness: 0.95,
    roughness: 0.05,
    clearcoat: 1,
  });

  // ── body (cube) ───────────────────────────────────────────────────────────
  const bodyGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4, 1, 1, 1);
  const body = new THREE.Mesh(bodyGeo, [matBody, matBody, matBody, matBody, matPurple, matBody]);
  body.position.y = -0.3;
  body.castShadow = true;
  group.add(body);

  // body edge accent (top rim)
  const rimGeo = new THREE.BoxGeometry(1.42, 0.04, 1.42);
  const rim = new THREE.Mesh(rimGeo, matAccent);
  rim.position.y = 0.4;
  group.add(rim);

  // ── neck ──────────────────────────────────────────────────────────────────
  const neckGroup = new THREE.Group();
  neckGroup.position.y = 0.48;

  const neck1Geo = new THREE.CylinderGeometry(0.12, 0.18, 0.22, 16);
  const neck1 = new THREE.Mesh(neck1Geo, matNeck);
  neck1.position.y = 0.11;
  neckGroup.add(neck1);

  const neck2Geo = new THREE.SphereGeometry(0.16, 16, 16);
  const neck2 = new THREE.Mesh(neck2Geo, matNeck);
  neck2.position.y = 0.26;
  neckGroup.add(neck2);

  const neck3Geo = new THREE.CylinderGeometry(0.09, 0.13, 0.12, 16);
  const neck3 = new THREE.Mesh(neck3Geo, matNeck);
  neck3.position.y = 0.38;
  neckGroup.add(neck3);

  group.add(neckGroup);

  // ── head (the part that tracks the mouse) ─────────────────────────────────
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.95;

  // main head box (purple front face)
  const headGeo = new THREE.BoxGeometry(1.1, 0.76, 0.72);
  const headMesh = new THREE.Mesh(headGeo, [
    matBody,          // right
    matBody,          // left
    matBody,          // top
    matBody,          // bottom
    matPurple,        // front (face)
    matBody,          // back
  ]);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // purple edge glow rim around face
  const faceRimGeo = new THREE.BoxGeometry(1.12, 0.78, 0.04);
  const faceRim = new THREE.Mesh(faceRimGeo, matAccent);
  faceRim.position.z = 0.35;
  headGroup.add(faceRim);

  // antenna nub on right side
  const antGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.18, 10);
  const ant = new THREE.Mesh(antGeo, matNeck);
  ant.rotation.z = Math.PI / 2;
  ant.position.set(-0.63, 0.2, 0);
  headGroup.add(ant);
  const antBallGeo = new THREE.SphereGeometry(0.055, 10, 10);
  const antBall = new THREE.Mesh(antBallGeo, matAccent);
  antBall.position.set(-0.73, 0.2, 0);
  headGroup.add(antBall);

  // ── eyes ──────────────────────────────────────────────────────────────────
  const eyeGeo = new THREE.SphereGeometry(0.13, 20, 20);
  const eyeL = new THREE.Mesh(eyeGeo, matEye);
  eyeL.position.set(-0.24, 0.05, 0.37);
  headGroup.add(eyeL);

  const eyeR = new THREE.Mesh(eyeGeo, matEye);
  eyeR.position.set(0.24, 0.05, 0.37);
  headGroup.add(eyeR);

  // eye pupils (small dark sphere inside each eye)
  const pupilGeo = new THREE.SphereGeometry(0.055, 10, 10);
  const matPupil = new THREE.MeshBasicMaterial({ color: 0x111122 });
  const pupL = new THREE.Mesh(pupilGeo, matPupil);
  pupL.position.set(-0.24, 0.05, 0.49);
  headGroup.add(pupL);
  const pupR = new THREE.Mesh(pupilGeo, matPupil);
  pupR.position.set(0.24, 0.05, 0.49);
  headGroup.add(pupR);

  group.add(headGroup);

  // lift whole robot slightly
  group.position.y = -0.3;

  scene.add(group);

  return { group, headGroup };
}

export function Robot3D({ width = 320, height = 320, className, style }: Robot3DProps) {
  const mountRef   = useRef<HTMLDivElement>(null);
  const mouseRef   = useRef({ x: 0, y: 0 });
  const targetRef  = useRef({ rx: 0, ry: 0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth  || (typeof width  === 'number' ? width  : 320);
    const h = mount.clientHeight || (typeof height === 'number' ? height : 320);

    // ── renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // ── scene & camera ────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0.3, 4.5);
    camera.lookAt(0, 0.2, 0);

    // ── lights ────────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0x1a1040, 2.5);
    scene.add(ambient);

    // Key light — blue-white from upper front
    const keyLight = new THREE.DirectionalLight(0x8899ff, 3.5);
    keyLight.position.set(2, 4, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Fill light — purple from left
    const fillLight = new THREE.PointLight(0x6622cc, 6, 12);
    fillLight.position.set(-3, 1, 2);
    scene.add(fillLight);

    // Rim light — blue from back
    const rimLight = new THREE.PointLight(0x3355ff, 4, 10);
    rimLight.position.set(0, 2, -3);
    scene.add(rimLight);

    // Floor glow
    const floorLight = new THREE.PointLight(0x4400aa, 3, 8);
    floorLight.position.set(0, -2.5, 0);
    scene.add(floorLight);

    // ── floor plane (receives shadow + glow) ──────────────────────────────
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x08060f,
      roughness: 0.9,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.05;
    floor.receiveShadow = true;
    scene.add(floor);

    // ── robot ─────────────────────────────────────────────────────────────
    const { group, headGroup } = buildRobot(scene);

    // ── mouse tracking ────────────────────────────────────────────────────
    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      // normalize to -1..1 relative to mount center
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouseRef.current.y = ((e.clientY - rect.top)  / rect.height) * 2 - 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ── resize ────────────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const nw = mount.clientWidth, nh = mount.clientHeight;
      if (nw > 0 && nh > 0) {
        renderer.setSize(nw, nh);
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
      }
    });
    ro.observe(mount);

    // ── animation loop ────────────────────────────────────────────────────
    let rafId = 0;
    let disposed = false;
    let time = 0;

    function loop() {
      if (disposed) return;
      rafId = requestAnimationFrame(loop);
      time += 0.016;

      // smooth lerp toward mouse position
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // head rotation: follow mouse
      // rotateY: horizontal (clamp ±35°), rotateX: vertical (clamp ±20°)
      targetRef.current.ry = mx * 0.55;
      targetRef.current.rx = -my * 0.35;

      headGroup.rotation.y += (targetRef.current.ry - headGroup.rotation.y) * 0.08;
      headGroup.rotation.x += (targetRef.current.rx - headGroup.rotation.x) * 0.08;

      // gentle idle bob on entire robot
      group.position.y = -0.3 + Math.sin(time * 1.2) * 0.04;
      group.rotation.y = Math.sin(time * 0.4) * 0.04;

      renderer.render(scene, camera);
    }
    loop();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      renderer.forceContextLoss();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={className}
      style={{
        width,
        height,
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
