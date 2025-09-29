'use client';

import { toast as sonnerToast } from 'sonner';

type ToastOptions = {
	description?: string;
	action?: {
		label: string;
		onClick: () => void;
	};
	duration?: number;
};

export const toast = {
	success: (message: string, options?: ToastOptions) => {
		return sonnerToast.success(message, {
			description: options?.description,
			duration: options?.duration,
			action: options?.action
				? {
						label: options.action.label,
						onClick: options.action.onClick,
					}
				: undefined,
		});
	},
	error: (message: string, options?: ToastOptions) => {
		return sonnerToast.error(message, {
			description: options?.description,
			duration: options?.duration,
			action: options?.action
				? {
						label: options.action.label,
						onClick: options.action.onClick,
					}
				: undefined,
		});
	},
	info: (message: string, options?: ToastOptions) => {
		return sonnerToast.info(message, {
			description: options?.description,
			duration: options?.duration,
			action: options?.action
				? {
						label: options.action.label,
						onClick: options.action.onClick,
					}
				: undefined,
		});
	},
	warning: (message: string, options?: ToastOptions) => {
		return sonnerToast.warning(message, {
			description: options?.description,
			duration: options?.duration,
			action: options?.action
				? {
						label: options.action.label,
						onClick: options.action.onClick,
					}
				: undefined,
		});
	},
	message: (message: string, options?: ToastOptions) => {
		return sonnerToast.message(message, {
			description: options?.description,
			duration: options?.duration,
			action: options?.action
				? {
						label: options.action.label,
						onClick: options.action.onClick,
					}
				: undefined,
		});
	},
};

export const useToast = () => {
	return { toast };
};
