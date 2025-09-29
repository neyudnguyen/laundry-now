import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		const session = await auth();

		// Check if user is authenticated and is admin
		if (!session || session.user.role !== 'ADMIN') {
			return NextResponse.json(
				{ error: 'Unauthorized - Admin access required' },
				{ status: 401 },
			);
		}

		// Get current date for calculations
		const now = new Date();
		const currentMonth = now.getMonth() + 1;
		const currentYear = now.getFullYear();

		// Parallel queries for performance
		const [
			totalVendors,
			totalCustomers,
			pendingComplaints,
			totalSystemMoney,
			totalOrdersThisMonth,
			totalRevenueThisMonth,
		] = await Promise.all([
			// Count vendors with VENDOR role
			prisma.user.count({
				where: {
					role: 'VENDOR',
				},
			}),

			// Count customers with CUSTOMER role
			prisma.user.count({
				where: {
					role: 'CUSTOMER',
				},
			}),

			// Count pending complaints that need admin attention
			prisma.complaint.count({
				where: {
					status: {
						in: ['PENDING', 'IN_REVIEW'],
					},
				},
			}),

			// Calculate total money in system (completed QR Code orders)
			// This represents money admin has received but hasn't paid to vendors yet
			prisma.order.aggregate({
				where: {
					paymentMethod: 'QRCODE',
					paymentStatus: 'COMPLETED',
				},
				_sum: {
					servicePrice: true,
					deliveryFee: true,
				},
			}),

			// Total orders this month
			prisma.order.count({
				where: {
					paymentStatus: 'COMPLETED',
					updatedAt: {
						gte: new Date(currentYear, currentMonth - 1, 1),
						lte: new Date(currentYear, currentMonth, 0, 23, 59, 59, 999),
					},
				},
			}),

			// Total revenue this month (for admin commission calculation)
			prisma.order.aggregate({
				where: {
					paymentStatus: 'COMPLETED',
					updatedAt: {
						gte: new Date(currentYear, currentMonth - 1, 1),
						lte: new Date(currentYear, currentMonth, 0, 23, 59, 59, 999),
					},
				},
				_sum: {
					servicePrice: true,
				},
			}),
		]);

		// Calculate system money (total money admin is holding from QR Code orders)
		const totalQRCodeAmount = totalSystemMoney._sum.servicePrice || 0;
		const totalQRCodeDeliveryFee = totalSystemMoney._sum.deliveryFee || 0;
		// System money = QR Code revenue + delivery fees (admin holds this money)
		const systemMoney = totalQRCodeAmount + totalQRCodeDeliveryFee;

		// Calculate admin commission for this month
		const monthlyRevenue = totalRevenueThisMonth._sum.servicePrice || 0;
		const monthlyCommission = Math.round(monthlyRevenue * 0.1);

		return NextResponse.json({
			totalVendors,
			totalCustomers,
			pendingComplaints,
			systemMoney, // Money admin is holding for vendors
			adminCommission: monthlyCommission, // Admin's commission this month
			totalOrdersThisMonth,
			monthlyRevenue,
			month: currentMonth,
			year: currentYear,
		});
	} catch (error) {
		console.error('Admin dashboard API error:', error);
		return NextResponse.json(
			{ error: 'Có lỗi xảy ra khi lấy dữ liệu dashboard' },
			{ status: 500 },
		);
	}
}
