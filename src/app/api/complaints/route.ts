import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { orderId, subject, message, type } = await request.json();

		if (!orderId || !subject || !message) {
			return NextResponse.json(
				{ error: 'Thiếu thông tin bắt buộc' },
				{ status: 400 },
			);
		}

		// Get order to verify relationship
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

		// Check if user is related to this order
		const userRole = session.user.role;
		let isCustomer = false;
		let isVendor = false;

		if (userRole === 'CUSTOMER' && order.customer.userId === session.user.id) {
			isCustomer = true;
		} else if (
			userRole === 'VENDOR' &&
			order.vendor.userId === session.user.id
		) {
			isVendor = true;
		}

		if (!isCustomer && !isVendor) {
			return NextResponse.json(
				{ error: 'Không có quyền tạo khiếu nại cho đơn hàng này' },
				{ status: 403 },
			);
		}

		// Create notification for the other party
		try {
			if (isCustomer) {
				// Customer complaining to vendor
				await createNotification({
					userId: order.vendor.userId,
					message: `Khiếu nại từ khách hàng ${order.customer.fullName} về đơn hàng #${order.id}: ${subject}`,
				});
			} else if (isVendor) {
				// Vendor reporting issue to customer
				await createNotification({
					userId: order.customer.userId,
					message: `Thông báo từ cửa hàng ${order.vendor.shopName} về đơn hàng #${order.id}: ${subject}`,
				});
			}
		} catch (notificationError) {
			console.error(
				'Error creating complaint notification:',
				notificationError,
			);
		}

		return NextResponse.json({
			message: 'Khiếu nại đã được gửi thành công',
			complaint: {
				orderId,
				subject,
				message,
				type,
				createdAt: new Date(),
			},
		});
	} catch (error) {
		console.error('Error creating complaint:', error);
		return NextResponse.json({ error: 'Lỗi server nội bộ' }, { status: 500 });
	}
}
