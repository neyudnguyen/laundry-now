import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
	try {
		const session = await auth();

		// Check if user is authenticated and is admin
		if (!session || session.user.role !== 'ADMIN') {
			return NextResponse.json(
				{ error: 'Unauthorized - Admin access required' },
				{ status: 401 },
			);
		}

		const { searchParams } = new URL(request.url);
		const month = parseInt(searchParams.get('month') || '');
		const year = parseInt(searchParams.get('year') || '');
		const vendorId = searchParams.get('vendorId');

		if (!month || !year || month < 1 || month > 12) {
			return NextResponse.json(
				{ error: 'Tháng và năm không hợp lệ' },
				{ status: 400 },
			);
		}

		// Date range for the selected month
		const startDate = new Date(year, month - 1, 1);
		const endDate = new Date(year, month, 0, 23, 59, 59, 999);

		// Base query conditions
		const baseConditions = {
			createdAt: {
				gte: startDate,
				lte: endDate,
			},
			paymentStatus: 'COMPLETED' as const,
		};

		// Add vendor filter if specified
		if (vendorId) {
			Object.assign(baseConditions, { vendorId });
		}

		// Get all completed orders in the month (optionally filtered by vendor)
		// Only include orders from vendors who currently have VENDOR role
		const orders = await prisma.order.findMany({
			where: {
				...baseConditions,
				vendor: {
					user: {
						role: 'VENDOR',
					},
				},
			},
			include: {
				vendor: {
					include: {
						user: true,
					},
				},
			},
		});

		// Calculate revenue statistics
		const codOrders = orders.filter((order) => order.paymentMethod === 'COD');
		const qrCodeOrders = orders.filter(
			(order) => order.paymentMethod === 'QRCODE',
		);

		const totalCODRevenue = codOrders.reduce(
			(sum, order) => sum + order.servicePrice,
			0,
		);
		const totalQRCodeRevenue = qrCodeOrders.reduce(
			(sum, order) => sum + order.servicePrice,
			0,
		);
		const totalQRCodeDeliveryFee = qrCodeOrders.reduce(
			(sum, order) => sum + order.deliveryFee,
			0,
		);

		// Calculate commissions (2%)
		const codCommission = Math.round(totalCODRevenue * 0.02);
		const qrcodeCommission = Math.round(totalQRCodeRevenue * 0.02);
		const totalCommission = codCommission + qrcodeCommission;

		// Calculate total amount admin needs to pay to vendor
		// = QR Code revenue - COD commission - QR Code commission + QR Code delivery fee
		const totalAmountToPay =
			totalQRCodeRevenue - totalCommission + totalQRCodeDeliveryFee;

		// If vendor is specified, get vendor details
		let vendorInfo = null;
		if (vendorId && orders.length > 0) {
			const firstOrderWithVendor = orders.find((order) => order.vendor);
			if (firstOrderWithVendor) {
				const vendor = firstOrderWithVendor.vendor;
				vendorInfo = {
					id: vendor.id,
					shopName: vendor.shopName,
					phone: vendor.user.phone,
					email: vendor.user.email,
				};
			}
		}

		// Get all vendors list for dropdown (regardless of current filter)
		// Only include users who currently have VENDOR role
		const allVendors = await prisma.vendorProfile.findMany({
			where: {
				user: {
					role: 'VENDOR',
				},
			},
			include: {
				user: true,
			},
			orderBy: {
				shopName: 'asc',
			},
		});

		const vendorsList = allVendors.map((vendor) => ({
			id: vendor.id,
			shopName: vendor.shopName,
			phone: vendor.user.phone,
		}));

		// Check if bill already exists for the selected vendor and month
		let billExists = false;
		if (vendorId) {
			const existingBill = await prisma.bill.findFirst({
				where: {
					vendorId,
					startDate: {
						gte: startDate,
					},
					endDate: {
						lte: endDate,
					},
				},
			});
			billExists = !!existingBill;
		}

		// Check if the month has completed (can only create bill after month ends)
		const today = new Date();
		const canCreateBill = today > endDate;
		const nextAvailableDate = new Date(year, month, 1); // First day of next month

		return NextResponse.json({
			month,
			year,
			vendorInfo,
			totalCODRevenue,
			totalQRCodeRevenue,
			totalQRCodeDeliveryFee,
			codCommission,
			qrcodeCommission,
			totalCommission,
			totalAmountToPay,
			ordersCount: {
				cod: codOrders.length,
				qrcode: qrCodeOrders.length,
				total: orders.length,
			},
			vendorsList,
			billExists,
			canCreateBill,
			nextAvailableDate: nextAvailableDate.toISOString(),
		});
	} catch (error) {
		console.error('Admin revenue API error:', error);
		return NextResponse.json(
			{ error: 'Có lỗi xảy ra khi lấy dữ liệu doanh thu' },
			{ status: 500 },
		);
	}
}
