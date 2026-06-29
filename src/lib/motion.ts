import type { Transition } from 'motion/react';

export const spring: Transition = { type: 'spring', stiffness: 350, damping: 28 };
export const exitTransition: Transition = { duration: 0.15, ease: 'easeIn' };
