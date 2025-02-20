import { useEffect, useRef, useState } from 'react';
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
        {() => <CanvasComponent />}
      </BrowserOnly>
    </div>
  );
};

const CanvasComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationManager = useRef<AnimationManager | null>(null);
  const environment = useRef<EnvironmentSetup | null>(null);
  const isMouseDown = useRef(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 初始化场景
    const { scene, camera, renderer, controls, dispose } = setupScene(canvasRef.current);

    // 设置环境
    environment.current = setupEnvironment(scene, renderer);

    const cabalLoader = new CabalLoader();
    cabalLoader.load('./three/bike12.ebm', (group) => {
      scene.add(group);
      animationManager.current = new AnimationManager(group, group.animations);
      animationManager.current.autoPlayFirst();
    });

    // 鼠标事件处理
    const handleMouseDown = () => {
      isMouseDown.current = true;
      animationManager.current?.crossFadeTo('move', 0.5);
    };

    const handleMouseUp = () => {
      isMouseDown.current = false;
      animationManager.current?.crossFadeTo('idle', 0.5);
    };

    // 添加事件监听
    canvasRef.current.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // 动画循环
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();

      if (environment.current) {
        const waterUniforms = environment.current.water.material.uniforms;
        waterUniforms['time'].value += 1.0 / 60.0;
      }

      animationManager.current?.update(clock.getDelta());
      renderer.render(scene, camera);
    };
    animate();

    // 清理函数
    return () => {
      canvasRef.current?.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      dispose();
      environment.current?.updateSun();
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100vh' }} />;
};

export default Index;