import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const setupScene = (canvas: HTMLCanvasElement) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xe0e0e0);
  
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.set(0, 200, 500);
  
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;

  const controls = new OrbitControls(camera, canvas);
  
  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', handleResize);

  return { scene, camera, renderer, controls, dispose: () => {
    window.removeEventListener('resize', handleResize);
    renderer.dispose();
  }};
};