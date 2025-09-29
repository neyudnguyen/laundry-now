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

		// Check if the month has completed before allowing bill creation
		// Can only create bill after the month has ended
		const today = new Date();
		const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month at 23:59:59

		if (today <= endOfMonth) {
			// Calculate the first day of the next month when bills can be created
			let nextMonth = month + 1;
			let nextYear = year;
			if (nextMonth > 12) {
				nextMonth = 1;
				nextYear = year + 1;
			}
			const nextAvailableDate = new Date(nextYear, nextMonth - 1, 1);

			return NextResponse.json(
				{
					error: `Chỉ có thể tạo bill sau khi tháng ${month}/${year} đã hoàn thành. Vui lòng thử lại từ ngày ${nextAvailableDate.toLocaleDateString('vi-VN')}.`,
					canCreateAfter: nextAvailableDate.toISOString(),
				},
				{ status: 400 },
			);
		}

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

		// Check if vendor exists and has VENDOR role
		const vendor = await prisma.vendorProfile.findUnique({
			where: { id: vendorId },
			include: {
				user: true,
			},
		});

		if (!vendor) {
			return NextResponse.json(
				{ error: 'Vendor không tồn tại' },
				{ status: 404 },
			);
		}

		if (vendor.user.role !== 'VENDOR') {
			return NextResponse.json(
				{ error: 'User này hiện không phải là vendor' },
				{ status: 400 },
			);
		}

		// Date range for the selected month
		const startDate = new Date(year, month - 1, 1);
		const endDate = new Date(year, month, 0, 23, 59, 59, 999);

		// Get all completed orders for this vendor in the month
		// Additional safety check to ensure vendor still has VENDOR role
		const orders = await prisma.order.findMany({
			where: {
				vendorId,
				createdAt: {
					gte: startDate,
					lte: endDate,
				},
				paymentStatus: 'COMPLETED' as const,
				vendor: {
					user: {
						role: 'VENDOR',
					},
				},
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
