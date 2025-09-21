import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Lấy danh sách services của vendor
export async function GET() {
	try {
		const session = await auth();

		if (!session || session.user.role !== UserRole.VENDOR) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Tìm vendorProfile của user hiện tại
		const vendorProfile = await prisma.vendorProfile.findUnique({
			where: { userId: session.user.id },
			include: {
				vendorServiceFees: {
					orderBy: {
						createdAt: 'desc',
					},
				},
			},
		});

		if (!vendorProfile) {
			return NextResponse.json(
				{ error: 'Vendor profile not found' },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			services: vendorProfile.vendorServiceFees,
		});
	} catch (error) {
		console.error('Error fetching vendor services:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

// POST: Tạo service mới
export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session || session.user.role !== UserRole.VENDOR) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { name, fee } = await request.json();

		if (!name || !fee) {
			return NextResponse.json(
				{ error: 'Name and fee are required' },
				{ status: 400 },
			);
		}

		if (fee <= 0) {
			return NextResponse.json(
				{ error: 'Fee must be greater than 0' },
				{ status: 400 },
			);
		}

		// Tìm vendorProfile của user hiện tại
		const vendorProfile = await prisma.vendorProfile.findUnique({
			where: { userId: session.user.id },
		});

		if (!vendorProfile) {
			return NextResponse.json(
				{ error: 'Vendor profile not found' },
				{ status: 404 },
			);
		}

		// Kiểm tra tên service đã tồn tại chưa
		const existingService = await prisma.vendorServiceFee.findFirst({
			where: {
				vendorId: vendorProfile.id,
				name: name.trim(),
			},
		});

		if (existingService) {
			return NextResponse.json(
				{ error: 'Service name already exists' },
				{ status: 400 },
			);
		}

		// Tạo service mới
		const newService = await prisma.vendorServiceFee.create({
			data: {
				name: name.trim(),
				fee: parseFloat(fee),
				vendorId: vendorProfile.id,
			},
		});

		return NextResponse.json(newService);
	} catch (error) {
		console.error('Error creating vendor service:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
