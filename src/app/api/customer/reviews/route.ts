import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { NotificationMessages, createNotification } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.phone) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get user and customer profile
		const user = await prisma.user.findUnique({
			where: { phone: session.user.phone },
			include: {
				customerProfile: true,
			},
		});

		if (!user || user.role !== 'CUSTOMER' || !user.customerProfile) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const { orderId, rating, comment } = await request.json();

		// Validate input
		if (!orderId || !rating || rating < 1 || rating > 5) {
			return NextResponse.json(
				{ error: 'Dữ liệu không hợp lệ' },
				{ status: 400 },
			);
		}

		// Check if order exists and belongs to customer
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				vendor: {
					include: {
						user: true,
					},
				},
				review: true,
			},
		});

		if (!order) {
			return NextResponse.json(
				{ error: 'Không tìm thấy đơn hàng' },
				{ status: 404 },
			);
		}

		if (order.customerId !== user.customerProfile.id) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		// Check if order is completed
		if (order.status !== 'COMPLETED') {
			return NextResponse.json(
				{ error: 'Chỉ có thể đánh giá đơn hàng đã hoàn thành' },
				{ status: 400 },
			);
		}

		// Check if order is already reviewed
		if (order.review) {
			return NextResponse.json(
				{ error: 'Đơn hàng này đã được đánh giá' },
				{ status: 400 },
			);
		}

		// Create review and update order
		const result = await prisma.$transaction(async (tx) => {
			// Create review
			const review = await tx.review.create({
				data: {
					rating,
					comment: comment || null,
					customerId: user.id,
					vendorId: order.vendorId,
				},
			});

			// Update order with review reference
			await tx.order.update({
				where: { id: orderId },
				data: { reviewId: review.id },
			});

			return review;
		});

		// Create notification for vendor about new review
		try {
			await createNotification({
				userId: order.vendor.userId,
				message: NotificationMessages.newReview(
					rating,
					user.customerProfile?.fullName || 'Khách hàng',
				),
			});
		} catch (notificationError) {
			console.error('Error creating review notification:', notificationError);
		}

		return NextResponse.json({
			message: 'Đánh giá đã được tạo thành công',
			review: result,
		});
	} catch (error) {
		console.error('Error creating review:', error);
		return NextResponse.json({ error: 'Lỗi server nội bộ' }, { status: 500 });
	}
}
