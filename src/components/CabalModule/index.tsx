import React, { useEffect, useRef } from 'react';
import bikeData from './bike.json'; // 直接导入 JSON 文件
import BrowserOnly from '@docusaurus/BrowserOnly';
import * as THREE from 'three';
import { CabalLoader } from './Loader';
import { EBM } from './ebm';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const BikeModel: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // 场景、相机和渲染器
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xe0e0e0);

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      );
      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.position.z = 500;

      // ground
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false }));
      mesh.rotation.x = - Math.PI / 2;
      scene.add(mesh);

      const grid = new THREE.GridHelper(200, 40, 0x000000, 0x000000);
      grid.material.opacity = 0.2;
      grid.material.transparent = true;
      scene.add(grid);

      const loader = new CabalLoader(scene);
      loader.loadModel(bikeData as EBM);

      // lights
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
      hemiLight.position.set(0, 20, 0);
      scene.add(hemiLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 3);
      dirLight.position.set(0, 20, 10);
      scene.add(dirLight);

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const controls = new OrbitControls(camera, canvasRef.current);

      const tick = () => {
        controls.update();
        loader.update();
        renderer.render(scene, camera);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);

      return () => {
        renderer.dispose();
      };
    }
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100vh' }} />
    </div>
  );
};

const WrappedBikeModel = () => (
  <BrowserOnly>
    {() => <BikeModel />}
  </BrowserOnly>
);

export default WrappedBikeModel;