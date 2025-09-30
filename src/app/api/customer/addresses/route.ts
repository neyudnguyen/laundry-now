import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Lấy danh sách địa chỉ của customer
export async function GET() {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const customerProfile = await prisma.customerProfile.findUnique({
			where: { userId: session.user.id },
			include: {
				addresses: {
					orderBy: { createdAt: 'desc' },
				},
			},
		});

		if (!customerProfile) {
			return NextResponse.json(
				{ error: 'Customer profile not found' },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			addresses: customerProfile.addresses.map((address) => ({
				id: address.id,
				province: address.province,
				district: address.district,
				ward: address.ward,
				street: address.street,
				fullAddress: `${address.street}, ${address.ward}, ${address.district}, ${address.province}`,
				createdAt: address.createdAt,
				updatedAt: address.updatedAt,
			})),
		});
	} catch (error) {
		console.error('Error getting addresses:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

// POST - Tạo địa chỉ mới
export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { province, district, ward, street } = body;

		if (!province || !district || !ward || !street) {
			return NextResponse.json(
				{ error: 'All address fields are required' },
				{ status: 400 },
			);
		}

		// Kiểm tra customer profile có tồn tại không
		const customerProfile = await prisma.customerProfile.findUnique({
			where: { userId: session.user.id },
		});

		if (!customerProfile) {
			return NextResponse.json(
				{ error: 'Customer profile not found' },
				{ status: 404 },
			);
		}

		const address = await prisma.address.create({
			data: {
				province,
				district,
				ward,
				street,
				customerProfileId: customerProfile.id,
			},
		});

		return NextResponse.json({ address });
	} catch (error) {
		console.error('Error creating address:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
