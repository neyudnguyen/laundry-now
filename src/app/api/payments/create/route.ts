import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import payOS from '@/lib/payos';
import type { PaymentData } from '@/lib/payos';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { orderId } = body;

		if (!orderId) {
			return NextResponse.json(
				{ error: 'Order ID is required' },
				{ status: 400 },
			);
		}

		// Tìm đơn hàng trong database
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				customer: {
					include: {
						user: true,
					},
				},
				vendor: true,
				items: true,
			},
		});

		if (!order) {
			return NextResponse.json({ error: 'Order not found' }, { status: 404 });
		}

		// Kiểm tra quyền truy cập
		if (order.customer.user.id !== session.user.id) {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 });
		}

		// Kiểm tra trạng thái đơn hàng
		if (order.status !== 'PAYMENT_REQUIRED') {
			return NextResponse.json(
				{ error: 'Order is not ready for payment' },
				{ status: 400 },
			);
		}

		// Kiểm tra phương thức thanh toán
		if (order.paymentMethod !== 'QRCODE') {
			return NextResponse.json(
				{ error: 'Order payment method is not QR Code' },
				{ status: 400 },
			);
		}

		const totalAmount = order.servicePrice + order.deliveryFee;

		// Tạo orderCode unique từ timestamp và order ID
		const orderCodeNumber = parseInt(
			Date.now().toString().slice(-8) + order.id.slice(-2),
			10,
		);

		const paymentData: PaymentData = {
			orderCode: orderCodeNumber,
			amount: totalAmount,
			description: `Don hang ${order.id.slice(-8)}`,
			items: order.items.map((item) => ({
				name: item.name,
				quantity: item.quantity,
				price: item.unitPrice,
			})),
			cancelUrl: `${process.env.NEXTAUTH_URL}/customer/order-history/payment-result?payment=cancelled&orderId=${order.id}`,
			returnUrl: `${process.env.NEXTAUTH_URL}/customer/order-history/payment-result?payment=success&orderId=${order.id}`,
			buyerName: order.customer.fullName,
			buyerPhone: order.customer.user.phone,
			buyerEmail: order.customer.user.email || undefined,
		};

		// Tạo link thanh toán với payOS
		const paymentLinkResponse = await payOS.paymentRequests.create(paymentData);

		// Lưu orderCode vào order để dùng trong webhook
		await prisma.order.update({
			where: { id: orderId },
			data: { orderCode: orderCodeNumber.toString() },
		});

		// Trả về checkout URL để redirect
		return NextResponse.json({
			success: true,
			data: {
				checkoutUrl: paymentLinkResponse.checkoutUrl,
				orderCode: orderCodeNumber,
			},
		});
	} catch (error) {
		console.error('PayOS payment creation error:', error);
		return NextResponse.json(
			{ error: 'Failed to create payment link' },
			{ status: 500 },
		);
	}
}
