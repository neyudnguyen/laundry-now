import { NextRequest, NextResponse } from 'next/server';

import payOS from '@/lib/payos';
import type { WebhookRequest } from '@/lib/payos';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
	try {
		const body: WebhookRequest = await request.json();

		// Xác minh webhook signature
		const webhookData = await payOS.webhooks.verify(body);

		if (!webhookData) {
			return NextResponse.json(
				{ error: 'Invalid webhook signature' },
				{ status: 400 },
			);
		}

		const { orderCode, code, desc } = webhookData;

		// Tìm order theo orderCode
		const order = await prisma.order.findUnique({
			where: { orderCode: orderCode },
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
			console.error(`Order not found for orderCode: ${orderCode}`);
			return NextResponse.json({ error: 'Order not found' }, { status: 404 });
		}

		// Chỉ xử lý khi thanh toán thành công
		if (code === '00' && desc === 'Thành công') {
			// Cập nhật order thành COMPLETED
			await prisma.$transaction([
				prisma.order.update({
					where: { id: order.id },
					data: {
						paymentStatus: 'COMPLETED',
						status: 'COMPLETED',
					},
				}),
				prisma.notification.create({
					data: {
						message: `Đơn hàng ${order.id} đã được thanh toán thành công!`,
						userId: order.customer.userId,
					},
				}),
				prisma.notification.create({
					data: {
						message: `Đơn hàng ${order.id} đã được khách hàng thanh toán thành công!`,
						userId: order.vendor.userId,
					},
				}),
			]);

			console.log(`Payment successful for order ${order.id}`);
		} else {
			// Không làm gì khi thanh toán thất bại/hủy - giữ nguyên trạng thái order
			console.log(`Payment failed/cancelled for order ${order.id}: ${desc}`);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Webhook processing error:', error);
		return NextResponse.json(
			{ error: 'Webhook processing failed' },
			{ status: 500 },
		);
	}
}

// Disable body parsing for webhook
export const config = {
	api: {
		bodyParser: false,
	},
};
