import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id || session.user.role !== 'VENDOR') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const month = searchParams.get('month');
		const year = searchParams.get('year');

		if (!month || !year) {
			return NextResponse.json(
				{ error: 'Tháng và năm là bắt buộc' },
				{ status: 400 },
			);
		}

		// Find vendor profile
		const vendorProfile = await prisma.vendorProfile.findUnique({
			where: { userId: session.user.id },
		});

		if (!vendorProfile) {
			return NextResponse.json(
				{ error: 'Vendor profile not found' },
				{ status: 404 },
			);
		}

		// Calculate date range for the month
		const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
		const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

		// Get orders for the selected month with completed payment status
		// Use updatedAt to calculate revenue based on payment completion time, not order creation time
		const orders = await prisma.order.findMany({
			where: {
				vendorId: vendorProfile.id,
				paymentStatus: 'COMPLETED',
				updatedAt: {
					gte: startDate,
					lte: endDate,
				},
			},
			select: {
				id: true,
				paymentMethod: true,
				servicePrice: true,
				deliveryFee: true,
				createdAt: true,
			},
		});

		// Calculate revenue statistics
		const codOrders = orders.filter((order) => order.paymentMethod === 'COD');
		const qrcodeOrders = orders.filter(
			(order) => order.paymentMethod === 'QRCODE',
		);

		const totalCODRevenue = codOrders.reduce(
			(sum, order) => sum + order.servicePrice,
			0,
		);

		const totalQRCodeRevenue = qrcodeOrders.reduce(
			(sum, order) => sum + order.servicePrice,
			0,
		);

		const totalQRCodeDeliveryFee = qrcodeOrders.reduce(
			(sum, order) => sum + order.deliveryFee,
			0,
		);

		// Calculate commissions (10%)
		const codCommission = Math.round(totalCODRevenue * 0.1);
		const qrcodeCommission = Math.round(totalQRCodeRevenue * 0.1);

		// Calculate total amount to receive
		// = QR Code revenue - COD commission - QR Code commission + QR Code delivery fees
		const totalAmountToReceive =
			totalQRCodeRevenue -
			codCommission -
			qrcodeCommission +
			totalQRCodeDeliveryFee;

		const revenueStats = {
			month: parseInt(month),
			year: parseInt(year),
			totalCODRevenue,
			totalQRCodeRevenue,
			totalQRCodeDeliveryFee,
			codCommission,
			qrcodeCommission,
			totalCommission: codCommission + qrcodeCommission,
			totalAmountToReceive: Math.max(0, totalAmountToReceive), // Ensure non-negative
			ordersCount: {
				cod: codOrders.length,
				qrcode: qrcodeOrders.length,
				total: orders.length,
			},
		};

		return NextResponse.json(revenueStats);
	} catch (error) {
		console.error('Error fetching revenue stats:', error);
		return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
	}
}
