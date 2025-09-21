import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT: Cập nhật service
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
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

		// Kiểm tra service có tồn tại và thuộc về vendor này không
		const existingService = await prisma.vendorServiceFee.findFirst({
			where: {
				id: params.id,
				vendorId: vendorProfile.id,
			},
		});

		if (!existingService) {
			return NextResponse.json({ error: 'Service not found' }, { status: 404 });
		}

		// Kiểm tra tên service đã tồn tại chưa (trừ service hiện tại)
		const duplicateService = await prisma.vendorServiceFee.findFirst({
			where: {
				vendorId: vendorProfile.id,
				name: name.trim(),
				id: { not: params.id },
			},
		});

		if (duplicateService) {
			return NextResponse.json(
				{ error: 'Service name already exists' },
				{ status: 400 },
			);
		}

		// Cập nhật service
		const updatedService = await prisma.vendorServiceFee.update({
			where: { id: params.id },
			data: {
				name: name.trim(),
				fee: parseFloat(fee),
			},
		});

		return NextResponse.json(updatedService);
	} catch (error) {
		console.error('Error updating vendor service:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

// DELETE: Xóa service
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const session = await auth();

		if (!session || session.user.role !== UserRole.VENDOR) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

		// Kiểm tra service có tồn tại và thuộc về vendor này không
		const existingService = await prisma.vendorServiceFee.findFirst({
			where: {
				id: params.id,
				vendorId: vendorProfile.id,
			},
		});

		if (!existingService) {
			return NextResponse.json({ error: 'Service not found' }, { status: 404 });
		}

		// Xóa service
		await prisma.vendorServiceFee.delete({
			where: { id: params.id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting vendor service:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
