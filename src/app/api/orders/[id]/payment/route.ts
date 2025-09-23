import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { NotificationMessages, createNotification } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id: orderId } = await params;
		const { paymentMethod, amount } = await request.json();

		// Get order to verify ownership and status
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				customer: {
					include: {
						user: true,
					},
				},
				vendor: {
					include: {
						user: true,
					},
				},
			},
		});

		if (!order) {
			return NextResponse.json(
				{ error: 'Không tìm thấy đơn hàng' },
				{ status: 404 },
			);
		}

		// Check if user is customer or vendor of this order
		const userRole = session.user.role;
		let isAuthorized = false;

		if (userRole === 'CUSTOMER') {
			isAuthorized = order.customer.userId === session.user.id;
		} else if (userRole === 'VENDOR') {
			isAuthorized = order.vendor.userId === session.user.id;
		}

		if (!isAuthorized) {
			return NextResponse.json(
				{ error: 'Không có quyền truy cập' },
				{ status: 403 },
			);
		}

		// Check if payment is already completed
		if (order.paymentStatus === 'COMPLETED') {
			return NextResponse.json(
				{ error: 'Đơn hàng đã được thanh toán' },
				{ status: 400 },
			);
		}

		// Check if order status allows payment
		if (order.status !== 'PAYMENT_REQUIRED' && order.status !== 'COMPLETED') {
			return NextResponse.json(
				{ error: 'Trạng thái đơn hàng không cho phép thanh toán' },
				{ status: 400 },
			);
		}

		// Calculate total amount
		const totalAmount = order.servicePrice + order.deliveryFee;

		// For now, we'll just mark payment as completed
		// In real implementation, you would integrate with payment gateway
		const updatedOrder = await prisma.order.update({
			where: { id: orderId },
			data: {
				paymentStatus: 'COMPLETED',
				...(order.status === 'PAYMENT_REQUIRED' && { status: 'COMPLETED' }),
			},
		});

		// Create notifications for both parties
		try {
			// Notification for vendor about payment received
			await createNotification({
				userId: order.vendor.userId,
				message: NotificationMessages.orderPaymentReceived(
					order.id,
					totalAmount,
				),
			});

			// Notification for customer confirming payment
			await createNotification({
				userId: order.customer.userId,
				message: `Thanh toán cho đơn hàng #${order.id} đã được xác nhận thành công.`,
			});
		} catch (notificationError) {
			console.error('Error creating payment notifications:', notificationError);
		}

		return NextResponse.json({
			message: 'Thanh toán thành công',
			order: updatedOrder,
		});
	} catch (error) {
		console.error('Error processing payment:', error);
		return NextResponse.json({ error: 'Lỗi server nội bộ' }, { status: 500 });
	}
}
