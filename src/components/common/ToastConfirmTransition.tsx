import { useLayoutEffect } from 'react';
import type { ToastTransitionProps } from 'react-toastify';

/** Confirmations close immediately when the user makes a choice. */
export default function ToastConfirmTransition({ isIn, done, playToast, children }: ToastTransitionProps) {
  useLayoutEffect(() => {
    if (isIn) playToast();
    else done();
  }, [isIn, done, playToast]);

  return isIn ? <>{children}</> : null;
}
