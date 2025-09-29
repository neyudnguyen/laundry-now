import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();

		if (!session || session.user.role !== 'ADMIN') {
			return NextResponse.json(
				{ error: 'Không có quyền truy cập' },
				{ status: 403 },
			);
		}

		const { id } = await params;
		const { status } = await request.json();

		if (!status || !['PENDING', 'PAID'].includes(status)) {
			return NextResponse.json(
				{ error: 'Trạng thái không hợp lệ' },
				{ status: 400 },
			);
		}

		// Check if bill exists
		const existingBill = await prisma.bill.findUnique({
			where: { id },
			include: {
				vendor: {
					select: {
						shopName: true,
					},
				},
			},
		});

		if (!existingBill) {
			return NextResponse.json(
				{ error: 'Không tìm thấy hóa đơn' },
				{ status: 404 },
			);
		}

		// Update bill status
		const updatedBill = await prisma.bill.update({
			where: { id },
			data: { status },
			include: {
				vendor: {
					select: {
						shopName: true,
					},
				},
			},
		});

		return NextResponse.json({
			message: 'Cập nhật trạng thái thành công',
			bill: {
				id: updatedBill.id,
				status: updatedBill.status,
				vendorName: updatedBill.vendor.shopName,
			},
		});
	} catch (error) {
		console.error('Error updating bill status:', error);
		return NextResponse.json(
			{ error: 'Có lỗi xảy ra khi cập nhật trạng thái' },
			{ status: 500 },
		);
	}
}
