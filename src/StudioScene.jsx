import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// This studio produces the site's background film, not a research visualization.
export default function StudioScene() {
  const host = useRef(null);
  useEffect(() => {
    const container = host.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xf4f7f1, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf4f7f1);
    const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 2, 18);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xc3cfbc, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 3.0);
    key.position.set(-5, 8, 10);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xd0ff9f, 2.7);
    rim.position.set(7, 0, -2);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xadc1e4, 1.5);
    fill.position.set(10, -3, 8);
    scene.add(fill);

    const group = new THREE.Group();
    group.position.set(4.25, -0.25, 0);
    group.rotation.set(-0.16, -0.24, -0.35);
    scene.add(group);
    const meshes = [];
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x7c9674, metalness: 0.25, roughness: 0.3,
      clearcoat: 0.7, clearcoatRoughness: 0.2, side: THREE.DoubleSide,
    });
    const greenMaterial = material.clone();
    greenMaterial.color.setHex(0x7ea65b);
    const silverMaterial = material.clone();
    silverMaterial.color.setHex(0x99a6ab);

    const segments = 112;
    const curve = Array.from({ length: segments + 1 }, (_, j) => {
      const a = j / segments * Math.PI * 2 - Math.PI;
      return {
        x: Math.sin(a * 0.76) * 3.1,
        sinY: Math.sin(a), cosY: Math.cos(a),
        sinZ: Math.sin(a * 1.35), cosZ: Math.cos(a * 1.35),
        dx: Math.cos(a * 0.67) * 0.56,
        dy: Math.sin(a * 0.55) * 0.63,
        dz: Math.cos(a * 0.73) * 0.8,
        y: 0, z: 0,
      };
    });
    for (let ribbon = 0; ribbon < 58; ribbon++) {
      const v = (ribbon / 57 - 0.5) * 3.7;
      const geometry = new THREE.PlaneGeometry(1, 1, segments, 1);
      const positions = geometry.attributes.position;
      const mesh = new THREE.Mesh(geometry, ribbon % 8 === 0 ? greenMaterial : ribbon % 5 === 0 ? silverMaterial : material);
      group.add(mesh);
      meshes.push({ geometry, positions, v });
    }

    let frame;
    let resizeFrame;
    let lastFrame = -Infinity;
    const start = performance.now();
    let controlledTime = null;
    function render(time) {
      const phase = Math.sin(time * Math.PI / 6) * 0.24;
      const sinPhase = Math.sin(phase);
      const cosPhase = Math.cos(phase);
      // The centreline is shared by all ribbons; calculate its deformation once.
      for (const point of curve) {
        point.y = (point.cosY * cosPhase - point.sinY * sinPhase) * 1.48;
        point.z = (point.sinZ * cosPhase + point.cosZ * sinPhase) * 1.7;
      }
      for (const { geometry, positions, v } of meshes) {
        for (let row = 0; row < 2; row++) {
          const offset = v + (row - 0.5) * 0.057;
          for (let j = 0; j <= segments; j++) {
            const point = curve[j];
            positions.setXYZ(row * (segments + 1) + j, point.x + offset * point.dx, point.y + offset * point.dy, point.z + offset * point.dz);
          }
        }
        positions.needsUpdate = true;
        geometry.computeVertexNormals();
      }
      group.rotation.y = -0.24 + Math.sin(time * Math.PI / 6) * 0.075;
      renderer.render(scene, camera);
      window.__studioReady = true;
    }
    function animate(now) {
      if (document.hidden || controlledTime !== null) { frame = undefined; return; }
      if (now - lastFrame >= 1000 / 30 - 0.5) {
        render((now - start) / 1000);
        lastFrame = now;
      }
      frame = requestAnimationFrame(animate);
    }
    window.__renderStudioAt = value => {
      cancelAnimationFrame(frame);
      controlledTime = value;
      if (value === null) frame = requestAnimationFrame(animate);
      else render(value);
    };
    frame = requestAnimationFrame(animate);
    function resize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      group.position.x = window.innerWidth > 900 ? 4.25 : window.innerWidth > 700 ? 2.25 : 0;
      group.scale.setScalar(window.innerWidth > 700 ? 1 : 0.65);
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (controlledTime !== null) render(controlledTime);
    }
    resize();
    const scheduleResize = () => {
      if (!resizeFrame) resizeFrame = requestAnimationFrame(() => { resizeFrame = undefined; resize(); });
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden && controlledTime === null) frame = requestAnimationFrame(animate);
    };
    window.addEventListener('resize', scheduleResize);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener('resize', scheduleResize);
      document.removeEventListener('visibilitychange', visibility);
      meshes.forEach(({ geometry }) => geometry.dispose());
      [material, greenMaterial, silverMaterial].forEach(m => m.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      delete window.__renderStudioAt;
      delete window.__studioReady;
    };
  }, []);
  return <div className="studio-scene" ref={host} aria-label="Procedural kinetic ribbon sculpture" />;
}
