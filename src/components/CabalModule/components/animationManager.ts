import { AnimationAction, AnimationClip, AnimationMixer, LoopRepeat, Object3D } from 'three';

export class AnimationManager {
  private mixer: AnimationMixer;
  private actions: Record<string, AnimationAction> = {};
  private currentAction: AnimationAction | null = null;

  constructor(private root: Object3D, animations: AnimationClip[]) {
    this.mixer = new AnimationMixer(root);
    
    animations.forEach(clip => {
      this.actions[clip.name] = this.mixer.clipAction(clip);
      this.actions[clip.name].setEffectiveWeight(0);
    });
  }

  public autoPlayFirst() {
    const firstAction = Object.values(this.actions)[0];
    if (firstAction) {
      this.currentAction = firstAction;
      firstAction.setEffectiveWeight(1).play();
    }
  }

  public crossFadeTo(actionName: string, duration: number) {
    const targetAction = this.actions[actionName];
    if (!targetAction || this.currentAction === targetAction) return;

    targetAction.reset();
    targetAction.setEffectiveWeight(1);
    targetAction.play();

    if (this.currentAction) {
      this.currentAction.enabled = true;
      this.currentAction.crossFadeTo(targetAction, duration, false);
    }

    this.currentAction = targetAction;
  }

  public update(delta: number) {
    this.mixer.update(delta);
  }
}