import { prisma } from '@/lib/prisma';

export interface CreateNotificationOptions {
	userId: string;
	message: string;
}

export async function createNotification({
	userId,
	message,
}: CreateNotificationOptions) {
	try {
		const notification = await prisma.notification.create({
			data: {
				userId,
				message,
			},
		});
		return notification;
	} catch (error) {
		console.error('Error creating notification:', error);
		throw error;
	}
}

// Utility functions for creating specific types of notifications
export const NotificationMessages = {
	// Customer notifications
	orderConfirmed: (orderNumber: string) =>
		`Đơn hàng #${orderNumber} đã được xác nhận và đang được xử lý.`,
	orderPickedUp: (orderNumber: string) =>
		`Đơn hàng #${orderNumber} đã được lấy và đang trong quá trình giặt ủi.`,
	orderInWashing: (orderNumber: string) =>
		`Đơn hàng #${orderNumber} đang được giặt ủi.`,
	orderPaymentRequired: (orderNumber: string, amount: number) =>
		`Đơn hàng #${orderNumber} đã hoàn thành. Vui lòng thanh toán ${new Intl.NumberFormat(
			'vi-VN',
			{
				style: 'currency',
				currency: 'VND',
			},
		).format(amount)}.`,
	orderCompleted: (orderNumber: string) =>
		`Đơn hàng #${orderNumber} đã hoàn thành. Cảm ơn bạn đã sử dụng dịch vụ!`,
	orderCancelled: (orderNumber: string, reason?: string) =>
		`Đơn hàng #${orderNumber} đã bị hủy${reason ? `: ${reason}` : ''}.`,

	// Vendor notifications
	newOrder: (orderNumber: string, customerName: string) =>
		`Bạn có đơn hàng mới #${orderNumber} từ khách hàng ${customerName}.`,
	orderPaymentReceived: (orderNumber: string, amount: number) =>
		`Đã nhận thanh toán ${new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount)} cho đơn hàng #${orderNumber}.`,
	newReview: (rating: number, customerName: string) =>
		`Bạn nhận được đánh giá ${rating} sao từ khách hàng ${customerName}.`,
	customerMessage: (customerName: string, message: string) =>
		`Tin nhắn từ ${customerName}: ${message}`,
};

// Helper function to create order-related notifications
export async function createOrderNotification(
	userId: string,
	orderNumber: string,
	type:
		| 'confirmed'
		| 'picked_up'
		| 'in_washing'
		| 'payment_required'
		| 'completed'
		| 'cancelled',
	extraData?: { amount?: number; reason?: string },
) {
	let message: string;

	switch (type) {
		case 'confirmed':
			message = NotificationMessages.orderConfirmed(orderNumber);
			break;
		case 'picked_up':
			message = NotificationMessages.orderPickedUp(orderNumber);
			break;
		case 'in_washing':
			message = NotificationMessages.orderInWashing(orderNumber);
			break;
		case 'payment_required':
			message = NotificationMessages.orderPaymentRequired(
				orderNumber,
				extraData?.amount || 0,
			);
			break;
		case 'completed':
			message = NotificationMessages.orderCompleted(orderNumber);
			break;
		case 'cancelled':
			message = NotificationMessages.orderCancelled(
				orderNumber,
				extraData?.reason,
			);
			break;
		default:
			throw new Error(`Unknown notification type: ${type}`);
	}

	return createNotification({ userId, message });
}
