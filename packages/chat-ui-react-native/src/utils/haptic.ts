import {triggerHaptic} from './native';

export const hapticHeavy = () => {
  triggerHaptic('impactHeavy');
};
