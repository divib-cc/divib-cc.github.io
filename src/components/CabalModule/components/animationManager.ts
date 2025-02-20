import * as THREE from 'three';

export class AnimationManager {
    private mixer: THREE.AnimationMixer;
    private currentAction: THREE.AnimationAction | null = null;
    private animations: THREE.AnimationClip[] = [];
  
    constructor(model: THREE.Object3D, animations: THREE.AnimationClip[] = []) {
      this.mixer = new THREE.AnimationMixer(model);
      this.animations = animations;
    }
  
    playAnimation(clip: THREE.AnimationClip) {
      if (this.currentAction) {
        this.currentAction.stop();
        this.currentAction.reset();
      }
      
      this.currentAction = this.mixer.clipAction(clip);
      this.currentAction
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .play();
    }
  
    // 添加自动播放第一个动画的方法
    autoPlayFirst() {
      if (this.animations.length > 0) {
        this.playAnimation(this.animations[0]);
      }
    }
  
    update(delta: number) {
      this.mixer.update(delta);
    }
  }