import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import payOS from '@/lib/payos';
import { prisma } from '@/lib/prisma';

export async function GET(
	request: NextRequest,
	{ params }: { params: { orderId: string } },
) {
	try {
		const session = await auth();

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { orderId } = params;

		// Tìm đơn hàng
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				customer: {
					include: {
						user: true,
					},
				},
			},
		});

		if (!order) {
			return NextResponse.json({ error: 'Order not found' }, { status: 404 });
		}

		// Kiểm tra quyền truy cập
		if (order.customer.user.id !== session.user.id) {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 });
		}

		// Tìm payment link của đơn hàng
		const paymentLink = await prisma.paymentLink.findUnique({
			where: {
				orderId: orderId,
			},
		});

		if (!paymentLink) {
			return NextResponse.json(
				{ error: 'Payment link not found' },
				{ status: 404 },
			);
		}

		try {
			// Lấy thông tin thanh toán từ PayOS
			const paymentInfo = await payOS.paymentRequests.get(
				paymentLink.orderCode,
			);

			return NextResponse.json({
				success: true,
				data: {
					paymentInfo,
					paymentLink,
					orderStatus: order.status,
					paymentStatus: order.paymentStatus,
				},
			});
		} catch {
			// Nếu không thể lấy từ PayOS, trả về thông tin từ database
			return NextResponse.json({
				success: true,
				data: {
					paymentInfo: null,
					paymentLink,
					orderStatus: order.status,
					paymentStatus: order.paymentStatus,
				},
			});
		}
	} catch (error) {
		console.error('Payment status check error:', error);
		return NextResponse.json(
			{ error: 'Failed to check payment status' },
			{ status: 500 },
		);
	}
}
