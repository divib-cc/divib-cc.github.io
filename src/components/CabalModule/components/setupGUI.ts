import { GUI } from 'dat.gui';
import { Water } from 'three/examples/jsm/objects/Water.js';
import * as THREE from 'three';

export const setupEnvironmentGUI = (
    gui: GUI,
    water: Water,
    parameters: { elevation: number; azimuth: number },
    updateSun: () => void
) => {
    const skyFolder = gui.addFolder('Sky');
    skyFolder.add(parameters, 'elevation', 0, 90, 0.1).onChange(updateSun);
    skyFolder.add(parameters, 'azimuth', -180, 180, 0.1).onChange(updateSun);
    skyFolder.open();

    const waterFolder = gui.addFolder('Water');
    waterFolder.add(water.material.uniforms.distortionScale, 'value', 0, 8, 0.1).name('Distortion Scale');
    waterFolder.add(water.material.uniforms.size, 'value', 0.1, 10, 0.1).name('Wave Size');
    waterFolder.open();
};

export const setupAnimationGUI = (
    gui: GUI,
    animations: THREE.AnimationClip[],
    playAnimation: (clip: THREE.AnimationClip) => void
  ) => {
    const animFolder = gui.addFolder('Animations');
    animFolder.open(); // 确保文件夹默认展开
    
    // 创建动画按钮列表
    animations.forEach((clip, index) => {
      const actionObj = {
        // 使用立即执行函数保持正确的clip引用
        [clip.name || `Animation_${index}`]: () => playAnimation(clip)
      };
      animFolder.add(actionObj, clip.name || `Animation_${index}`);
    });
  };