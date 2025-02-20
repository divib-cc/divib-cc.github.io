import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

export type EnvironmentSetup = {
  water: Water;
  sky: Sky;
  updateSun: () => void;
  parameters: {
    elevation: number;
    azimuth: number;
  };
};

export const setupEnvironment = (scene: THREE.Scene, renderer: THREE.WebGLRenderer): EnvironmentSetup => {
  // 初始化参数
  const parameters = {
    elevation: 2,
    azimuth: 180
  };

  // 水环境设置
  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
  const water = new Water(
    waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load('three/waternormals.jpg', texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined
    }
  );
  water.rotation.x = -Math.PI / 2;
  scene.add(water);

  // 天空盒设置
  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  // 初始化PMREM生成器
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const sceneEnv = new THREE.Scene();
  let renderTarget: THREE.WebGLRenderTarget | null = null;

  // 太阳位置更新函数
  const updateSun = () => {
    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);
    
    const sun = new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
    
    sky.material.uniforms['sunPosition'].value.copy(sun);
    water.material.uniforms['sunDirection'].value.copy(sun).normalize();

    if (renderTarget) renderTarget.dispose();
    
    sceneEnv.add(sky);
    renderTarget = pmremGenerator.fromScene(sceneEnv);
    scene.add(sky);
    
    scene.environment = renderTarget.texture;
  };

  // 初始化灯光
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 3);
  dirLight.position.set(0, 20, 10);
  scene.add(dirLight);

  // 首次更新太阳位置
  updateSun();

  return {
    water,
    sky,
    updateSun,
    parameters
  };
};