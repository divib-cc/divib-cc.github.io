import { useEffect, useRef, useState, useCallback } from 'react';
import { setupScene } from './components/setupScene';
import { setupEnvironment, EnvironmentSetup } from './components/setupEnvironment';
import { AnimationManager } from './components/animationManager';
import * as THREE from 'three';
import { EBMLoader } from './EBMLoader';
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
  const [waterTime, setWaterTime] = useState(1.0 / 60.0);
  const waterTimeRef = useRef(waterTime); // 新增 ref

  // 同步状态到 ref
  useEffect(() => {
    waterTimeRef.current = waterTime;
  }, [waterTime]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationManager = useRef<AnimationManager | null>(null);
  const environment = useRef<EnvironmentSetup | null>(null);
  const mixersRef = useRef<THREE.AnimationMixer[]>([]);
  const modelsRef = useRef<THREE.Group[]>([]);
  const clipsRef = useRef<Array<{ default: THREE.AnimationClip | null, pressed: THREE.AnimationClip | null }>>([]);

  // 新增：跟踪当前动作和过渡状态
  const currentActionsRef = useRef<THREE.AnimationAction[]>([]);
  const transitionsRef = useRef<Array<{
    mixer: THREE.AnimationMixer,
    oldAction: THREE.AnimationAction,
    newAction: THREE.AnimationAction,
    startTime: number,
    duration: number
  }>>([]);

  const handleMouseDown = useCallback(() => {
    mixersRef.current.forEach((mixer, index) => {
      const clips = clipsRef.current[index];
      if (!mixer || !clips || !clips.pressed) return;

      const currentAction = currentActionsRef.current[index];
      const newClip = clips.pressed;
      const newAction = mixer.clipAction(newClip);

      if (currentAction === newAction) return;

      // 初始化新动作参数
      newAction.reset();
      newAction.enabled = true;
      newAction.setEffectiveWeight(0); // 初始权重为0
      newAction.play();
      newAction.setLoop(THREE.LoopRepeat, Infinity);

      // 记录过渡状态
      transitionsRef.current.push({
        mixer,
        oldAction: currentAction,
        newAction,
        startTime: performance.now(),
        duration: 0.1 // 过渡时间0.3秒
      });

      // 更新当前动作引用
      currentActionsRef.current[index] = newAction;
      setWaterTime(1.0 / 10.0)
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    mixersRef.current.forEach((mixer, index) => {
      const clips = clipsRef.current[index];
      if (!mixer || !clips || !clips.default) return;

      const currentAction = currentActionsRef.current[index];
      const newClip = clips.default;
      const newAction = mixer.clipAction(newClip);

      if (currentAction === newAction) return;

      // 初始化新动作参数
      newAction.reset();
      newAction.enabled = true;
      newAction.setEffectiveWeight(0); // 初始权重为0
      newAction.play();
      newAction.setLoop(THREE.LoopRepeat, Infinity);

      // 记录过渡状态
      transitionsRef.current.push({
        mixer,
        oldAction: currentAction,
        newAction,
        startTime: performance.now(),
        duration: 0.2
      });

      // 更新当前动作引用
      currentActionsRef.current[index] = newAction;
      setWaterTime(1.0 / 30.0)
    });
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 初始化场景
    const { scene, camera, renderer, controls, dispose } = setupScene(canvasRef.current);

    // 设置环境
    environment.current = setupEnvironment(scene, renderer);
    const cabalLoader = new EBMLoader();

    // 异步加载模型
    const loadModel = (url: string): Promise<THREE.Group> => {
      return new Promise((resolve) => {
        cabalLoader.load(url, (group) => {
          scene.add(group);
          resolve(group);
        });
      });
    };

    // 加载所有模型并初始化动画
    Promise.all([
      loadModel('./three/bike12.ebm'),
      loadModel('./three/z6.ech')
    ]).then(([bikeModel, z6Model]) => {
      modelsRef.current = [bikeModel, z6Model];
      bikeModel.rotation.y= 180;
      z6Model.rotation.y= 180;
      // 创建动画混合器
      const bikeMixer = new THREE.AnimationMixer(bikeModel);
      const z6Mixer = new THREE.AnimationMixer(z6Model);
      mixersRef.current = [bikeMixer, z6Mixer];

      // 提取动画片段
      const bikeDefaultClip = THREE.AnimationClip.findByName(bikeModel.animations, 'idle');
      const bikePressedClip = THREE.AnimationClip.findByName(bikeModel.animations, 'move');
      const z6DefaultClip = THREE.AnimationClip.findByName(z6Model.animations, 'ride__sp00');
      const z6PressedClip = THREE.AnimationClip.findByName(z6Model.animations, 'ride__sp01');

      clipsRef.current = [
        { default: bikeDefaultClip, pressed: bikePressedClip },
        { default: z6DefaultClip, pressed: z6PressedClip }
      ];

      // 初始化默认动作
      currentActionsRef.current = [];
      if (bikeDefaultClip) {
        const action = bikeMixer.clipAction(bikeDefaultClip);
        action.play();
        currentActionsRef.current[0] = action;
      }
      if (z6DefaultClip) {
        const action = z6Mixer.clipAction(z6DefaultClip);
        action.play();
        currentActionsRef.current[1] = action;
      }
    });

    // 动画循环
    const clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();
      const currentTime = performance.now();

      // 处理过渡动画
      transitionsRef.current = transitionsRef.current.filter(transition => {
        const { mixer, oldAction, newAction, startTime, duration } = transition;
        const elapsed = (currentTime - startTime) / 1000;

        if (elapsed >= duration) {
          oldAction.enabled = false; // 禁用旧动作
          newAction.setEffectiveWeight(1); // 新动作权重设为1
          return false;
        }

        const t = elapsed / duration;
        oldAction.setEffectiveWeight(1 - t); // 旧动作权重逐渐减少
        newAction.setEffectiveWeight(t); // 新动作权重逐渐增加
        return true;
      });

      requestAnimationFrame(animate);
      controls.update();
      mixersRef.current.forEach(mixer => mixer.update(delta));

      if (environment.current) {
        const waterUniforms = environment.current.water.material.uniforms;
        // 使用 ref 的当前值
        waterUniforms['time'].value += waterTimeRef.current;
      }

      animationManager.current?.update(delta);
      renderer.render(scene, camera);
    };
    animate();

    // 清理函数
    return () => {
      transitionsRef.current = [];
      currentActionsRef.current = [];
      mixersRef.current.forEach(mixer => mixer.stopAllAction());
      modelsRef.current.forEach(model => scene.remove(model));
      mixersRef.current = [];
      dispose();
      environment.current?.updateSun();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100vh' }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    />
  );
};

export default Index;