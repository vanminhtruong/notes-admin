import React from 'react';
import { toast as toastify, type ToastOptions, type Id } from 'react-toastify';
import ToastConfirm, { type ToastConfirmProps } from '@components/common/ToastConfirm';

// Default toast options
const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Toast helper object
export const toast = {
  /**
   * Success toast
   */
  success: (message: string, options?: ToastOptions): Id => {
    return toastify.success(message, {
      ...defaultOptions,
      ...options,
    });
  },

  /**
   * Error toast
   */
  error: (message: string, options?: ToastOptions): Id => {
    return toastify.error(message, {
      ...defaultOptions,
      ...options,
    });
  },

  /**
   * Warning toast
   */
  warning: (message: string, options?: ToastOptions): Id => {
    return toastify.warning(message, {
      ...defaultOptions,
      ...options,
    });
  },

  /**
   * Info toast
   */
  info: (message: string, options?: ToastOptions): Id => {
    return toastify.info(message, {
      ...defaultOptions,
      ...options,
    });
  },

  /**
   * Confirmation dialog toast
   * @param props - ToastConfirmProps
   * @returns Promise that resolves to true if confirmed, false if cancelled
   */
  confirm: (
    props: Omit<ToastConfirmProps, 'onConfirm' | 'onCancel'>
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      toastify(
        ({ closeToast }) => (
          <ToastConfirm
            {...props}
            onConfirm={async () => {
              closeToast?.();
              resolve(true);
            }}
            onCancel={() => {
              closeToast?.();
              resolve(false);
            }}
          />
        ),
        {
          position: 'top-center',
          autoClose: false,
          closeButton: false,
          draggable: false,
          closeOnClick: false,
          hideProgressBar: true,
        }
      );
    });
  },

  /**
   * Danger confirmation (for delete actions)
   */
  confirmDelete: async (
    title: string,
    message?: string,
    confirmText: string = 'Xóa',
    cancelText: string = 'Hủy'
  ): Promise<boolean> => {
    return toast.confirm({
      title,
      message,
      type: 'danger',
      confirmText,
      cancelText,
    });
  },

  /**
   * Warning confirmation
   */
  confirmWarning: async (
    title: string,
    message?: string,
    confirmText: string = 'Xác nhận',
    cancelText: string = 'Hủy'
  ): Promise<boolean> => {
    return toast.confirm({
      title,
      message,
      type: 'warning',
      confirmText,
      cancelText,
    });
  },

  /**
   * Custom toast with component
   */
  custom: (content: React.ReactNode, options?: ToastOptions): Id => {
    return toastify(content, {
      ...defaultOptions,
      ...options,
    });
  },

  /**
   * Dismiss a toast
   */
  dismiss: (toastId?: Id): void => {
    toastify.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: (): void => {
    toastify.dismiss();
  },
};

export default toast;
