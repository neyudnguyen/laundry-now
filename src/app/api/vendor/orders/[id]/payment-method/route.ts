import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const session = await auth();

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		if (session.user.role !== 'VENDOR') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const { paymentMethod } = await request.json();
		const orderId = params.id;

		// Validate payment method
		if (!['COD', 'QRCODE'].includes(paymentMethod)) {
			return NextResponse.json(
				{ error: 'Phương thức thanh toán không hợp lệ' },
				{ status: 400 },
			);
		}

		// Kiểm tra xem đơn hàng có thuộc về vendor này không
		const existingOrder = await prisma.order.findFirst({
			where: {
				id: orderId,
				vendor: {
					userId: session.user.id,
				},
			},
		});

		if (!existingOrder) {
			return NextResponse.json(
				{ error: 'Không tìm thấy đơn hàng' },
				{ status: 404 },
			);
		}

		// Kiểm tra trạng thái đơn hàng - chỉ cho phép chỉnh sửa nếu chưa hoàn tất hoặc đã hủy
		if (
			existingOrder.status === 'COMPLETED' ||
			existingOrder.status === 'CANCELLED'
		) {
			return NextResponse.json(
				{
					error:
						'Không thể chỉnh sửa phương thức thanh toán của đơn hàng đã hoàn tất hoặc đã hủy',
				},
				{ status: 400 },
			);
		}

		// Cập nhật phương thức thanh toán
		const updatedOrder = await prisma.order.update({
			where: { id: orderId },
			data: {
				paymentMethod: paymentMethod as 'COD' | 'QRCODE',
			},
		});

		return NextResponse.json({
			message: 'Đã cập nhật phương thức thanh toán thành công',
			order: updatedOrder,
		});
	} catch (error) {
		console.error('Error updating payment method:', error);
		return NextResponse.json(
			{ error: 'Lỗi server khi cập nhật phương thức thanh toán' },
			{ status: 500 },
		);
	}
}
