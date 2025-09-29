import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		// Check if user is authenticated and is admin
		if (!session || session.user.role !== 'ADMIN') {
			return NextResponse.json(
				{ error: 'Unauthorized - Admin access required' },
				{ status: 401 },
			);
		}

		const { month, year, vendorId } = await request.json();

		if (!month || !year || !vendorId || month < 1 || month > 12) {
			return NextResponse.json(
				{ error: 'Tháng, năm và vendor ID không hợp lệ' },
				{ status: 400 },
			);
		}

		// TODO: Add check to only allow bill creation at the end of the month
		// const today = new Date();
		// const lastDayOfMonth = new Date(year, month, 0).getDate();
		// if (today.getDate() !== lastDayOfMonth || today.getMonth() + 1 !== month || today.getFullYear() !== year) {
		//   return NextResponse.json(
		//     { error: 'Chỉ có thể tạo bill vào ngày cuối tháng' },
		//     { status: 400 }
		//   );
		// }

		// Check if bill already exists for this vendor and month
		const existingBill = await prisma.bill.findFirst({
			where: {
				vendorId,
				startDate: {
					gte: new Date(year, month - 1, 1),
				},
				endDate: {
					lte: new Date(year, month, 0, 23, 59, 59, 999),
				},
			},
		});

		if (existingBill) {
			return NextResponse.json(
				{ error: 'Bill cho tháng này đã tồn tại' },
				{ status: 400 },
			);
		}

		// Date range for the selected month
		const startDate = new Date(year, month - 1, 1);
		const endDate = new Date(year, month, 0, 23, 59, 59, 999);

		// Get all completed orders for this vendor in the month
		const orders = await prisma.order.findMany({
			where: {
				vendorId,
				createdAt: {
					gte: startDate,
					lte: endDate,
				},
				paymentStatus: 'COMPLETED' as const,
			},
		});

		// Calculate revenue statistics
		const codOrders = orders.filter((order) => order.paymentMethod === 'COD');
		const qrCodeOrders = orders.filter(
			(order) => order.paymentMethod === 'QRCODE',
		);

		const totalCOD = codOrders.reduce(
			(sum, order) => sum + order.servicePrice,
			0,
		);
		const totalQRCODE = qrCodeOrders.reduce(
			(sum, order) => sum + order.servicePrice,
			0,
		);
		const totalQRCODEDeliveryFee = qrCodeOrders.reduce(
			(sum, order) => sum + order.deliveryFee,
			0,
		);

		// Calculate commissions (2%)
		const totalCODCompleted = Math.round(totalCOD * 0.02);
		const totalQRCODECompleted = Math.round(totalQRCODE * 0.02);

		// Create bill
		const bill = await prisma.bill.create({
			data: {
				vendorId,
				startDate,
				endDate,
				totalCOD,
				totalQRCODE,
				totalCODCompleted,
				totalQRCODECompleted,
				totalQRCODEDeliveryFee,
			},
			include: {
				vendor: {
					include: {
						user: true,
					},
				},
			},
		});

		return NextResponse.json({
			message: 'Bill được tạo thành công',
			bill: {
				id: bill.id,
				vendorName: bill.vendor.shopName,
				month,
				year,
				totalCOD: bill.totalCOD,
				totalQRCODE: bill.totalQRCODE,
				totalCODCompleted: bill.totalCODCompleted,
				totalQRCODECompleted: bill.totalQRCODECompleted,
				totalQRCODEDeliveryFee: bill.totalQRCODEDeliveryFee,
				totalAmountToPay:
					bill.totalQRCODE -
					bill.totalCODCompleted -
					bill.totalQRCODECompleted +
					bill.totalQRCODEDeliveryFee,
				createdAt: bill.startDate,
			},
		});
	} catch (error) {
		console.error('Create bill API error:', error);
		return NextResponse.json(
			{ error: 'Có lỗi xảy ra khi tạo bill' },
			{ status: 500 },
		);
	}
}
