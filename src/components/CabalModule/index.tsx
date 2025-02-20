import { useEffect, useRef } from 'react';
import { setupScene } from './components/setupScene';
import { setupEnvironment, EnvironmentSetup } from './components/setupEnvironment';
import { AnimationManager } from './components/animationManager';

import * as THREE from 'three';
import { CabalLoader } from './CabalLoader';
import BrowserOnly from '@docusaurus/BrowserOnly';


const Index: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <BrowserOnly>
        {() => (
          <CanvasComponent />
        )}
      </BrowserOnly>
    </div>
  );
};


const CanvasComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationManager = useRef<AnimationManager | null>(null);


  const environment = useRef<EnvironmentSetup | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 初始化场景
    const { scene, camera, renderer, controls, dispose } = setupScene(canvasRef.current);

    // 设置环境
    environment.current = setupEnvironment(scene, renderer);

    const cabalLoader = new CabalLoader()
    cabalLoader.load('./three/bike12.ebm', (group) => {
      scene.add(group);
      animationManager.current = new AnimationManager(group, group.animations);

      // 自动播放第一个动画
      animationManager.current.autoPlayFirst();
    })

    // 渲染循环
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      // 更新海面动画
      if (environment.current) {
        const waterUniforms = environment.current.water.material.uniforms;
        waterUniforms['time'].value += 1.0 / 60.0;
      }
      // 更新动画系统
      animationManager.current?.update(clock.getDelta());
      // 渲染场景
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      dispose();
      environment.current?.updateSun(); // 清理环境相关资源
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100vh' }} />;
};

export default Index;