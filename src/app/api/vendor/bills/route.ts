import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
	try {
		const session = await auth();

		// Check if user is authenticated and is vendor
		if (!session || session.user.role !== 'VENDOR') {
			return NextResponse.json(
				{ error: 'Unauthorized - Vendor access required' },
				{ status: 401 },
			);
		}

		// Get vendor profile
		const vendorProfile = await prisma.vendorProfile.findUnique({
			where: {
				userId: session.user.id,
			},
		});

		if (!vendorProfile) {
			return NextResponse.json(
				{ error: 'Vendor profile not found' },
				{ status: 404 },
			);
		}

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '10');
		const month = searchParams.get('month')
			? parseInt(searchParams.get('month')!)
			: null;
		const year = searchParams.get('year')
			? parseInt(searchParams.get('year')!)
			: null;
		const skip = (page - 1) * limit;

		// Build where condition
		const whereCondition = {
			vendorId: vendorProfile.id,
			...(month &&
				year && {
					startDate: {
						gte: new Date(year, month - 1, 1),
						lte: new Date(year, month, 0, 23, 59, 59, 999),
					},
				}),
		};

		// Get all bills for this vendor with pagination and filtering
		const [bills, totalCount] = await Promise.all([
			prisma.bill.findMany({
				where: whereCondition,
				orderBy: {
					startDate: 'desc',
				},
				skip,
				take: limit,
			}),
			prisma.bill.count({
				where: whereCondition,
			}),
		]);

		// Format bills data
		const formattedBills = bills.map((bill) => ({
			id: bill.id,
			month: bill.startDate.getMonth() + 1,
			year: bill.startDate.getFullYear(),
			monthLabel: `Tháng ${bill.startDate.getMonth() + 1}/${bill.startDate.getFullYear()}`,
			status: bill.status,
			totalCOD: bill.totalCOD,
			totalQRCODE: bill.totalQRCODE,
			totalCODCompleted: bill.totalCODCompleted,
			totalQRCODECompleted: bill.totalQRCODECompleted,
			totalQRCODEDeliveryFee: bill.totalQRCODEDeliveryFee,
			totalCommission: bill.totalCODCompleted + bill.totalQRCODECompleted,
			totalAmountToReceive:
				bill.totalQRCODE -
				bill.totalCODCompleted -
				bill.totalQRCODECompleted +
				bill.totalQRCODEDeliveryFee,
			createdAt: bill.startDate.toISOString(),
			updatedAt: bill.endDate.toISOString(),
			period: {
				startDate: bill.startDate.toISOString(),
				endDate: bill.endDate.toISOString(),
			},
		}));

		const totalPages = Math.ceil(totalCount / limit);

		return NextResponse.json({
			bills: formattedBills,
			pagination: {
				page,
				limit,
				totalCount,
				totalPages,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
			},
		});
	} catch (error) {
		console.error('Vendor bills API error:', error);
		return NextResponse.json(
			{ error: 'Có lỗi xảy ra khi lấy danh sách hóa đơn' },
			{ status: 500 },
		);
	}
}
