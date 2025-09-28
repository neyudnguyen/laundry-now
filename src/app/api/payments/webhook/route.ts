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

		// Tìm payment link theo orderCode
		const paymentLink = await prisma.paymentLink.findUnique({
			where: {
				orderCode: orderCode,
			},
			include: {
				order: true,
			},
		});

		if (!paymentLink) {
			console.error(`Payment link not found for orderCode: ${orderCode}`);
			return NextResponse.json(
				{ error: 'Payment link not found' },
				{ status: 404 },
			);
		}

		const order = paymentLink.order;

		// Kiểm tra trạng thái thanh toán
		if (code === '00' && desc === 'Thành công') {
			// Thanh toán thành công - cập nhật cả PaymentLink và Order
			await prisma.$transaction([
				prisma.paymentLink.update({
					where: { id: paymentLink.id },
					data: { status: 'PAID' },
				}),
				prisma.order.update({
					where: { id: order.id },
					data: {
						paymentStatus: 'COMPLETED',
						status: 'COMPLETED', // Hoặc trạng thái khác tùy theo business logic
					},
				}),
				prisma.notification.create({
					data: {
						message: `Đơn hàng ${order.id} đã được thanh toán thành công!`,
						userId: order.customerId,
					},
				}),
				prisma.notification.create({
					data: {
						message: `Đơn hàng ${order.id} đã được khách hàng thanh toán thành công!`,
						userId: order.vendorId,
					},
				}),
			]);

			console.log(`Payment successful for order ${order.id}`);
		} else {
			// Thanh toán thất bại
			await prisma.$transaction([
				prisma.paymentLink.update({
					where: { id: paymentLink.id },
					data: { status: 'FAILED' },
				}),
				prisma.order.update({
					where: { id: order.id },
					data: { paymentStatus: 'FAILED' },
				}),
				prisma.notification.create({
					data: {
						message: `Thanh toán đơn hàng ${order.id} thất bại. Vui lòng thử lại!`,
						userId: order.customerId,
					},
				}),
			]);

			console.log(`Payment failed for order ${order.id}: ${desc}`);
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
