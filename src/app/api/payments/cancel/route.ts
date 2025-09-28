import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
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

		// Tìm payment link của order
		const paymentLink = await prisma.paymentLink.findUnique({
			where: { orderId: orderId },
			include: {
				order: {
					include: {
						customer: {
							include: {
								user: true,
							},
						},
					},
				},
			},
		});

		if (!paymentLink) {
			return NextResponse.json(
				{ error: 'Payment link not found' },
				{ status: 404 },
			);
		}

		// Kiểm tra quyền truy cập
		if (paymentLink.order.customer.user.id !== session.user.id) {
			return NextResponse.json({ error: 'Access denied' }, { status: 403 });
		}

		// Cập nhật status payment link thành CANCELLED
		await prisma.paymentLink.update({
			where: { id: paymentLink.id },
			data: { status: 'CANCELLED' },
		});

		return NextResponse.json({
			success: true,
			message: 'Payment cancelled successfully',
		});
	} catch (error) {
		console.error('Payment cancellation error:', error);
		return NextResponse.json(
			{ error: 'Failed to cancel payment' },
			{ status: 500 },
		);
	}
}
