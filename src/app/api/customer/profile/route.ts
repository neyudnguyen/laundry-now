import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Lấy thông tin profile của customer
export async function GET() {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			include: {
				customerProfile: {
					include: {
						addresses: true,
					},
				},
			},
		});

		if (!user || user.role !== 'CUSTOMER') {
			return NextResponse.json(
				{ error: 'Customer not found' },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			user: {
				id: user.id,
				phone: user.phone,
				email: user.email,
				profile: user.customerProfile,
			},
		});
	} catch (error) {
		console.error('Error getting customer profile:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

// PUT - Cập nhật thông tin cơ bản của customer
export async function PUT(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { fullName, email, phone } = body;

		// Kiểm tra email/phone có bị trùng không
		if (email) {
			const existingUser = await prisma.user.findFirst({
				where: {
					email,
					NOT: { id: session.user.id },
				},
			});
			if (existingUser) {
				return NextResponse.json(
					{ error: 'Email already exists' },
					{ status: 400 },
				);
			}
		}

		if (phone) {
			const existingUser = await prisma.user.findFirst({
				where: {
					phone,
					NOT: { id: session.user.id },
				},
			});
			if (existingUser) {
				return NextResponse.json(
					{ error: 'Phone already exists' },
					{ status: 400 },
				);
			}
		}

		// Cập nhật thông tin user
		const updatedUser = await prisma.user.update({
			where: { id: session.user.id },
			data: {
				...(email && { email }),
				...(phone && { phone }),
			},
		});

		// Cập nhật hoặc tạo customer profile
		const customerProfile = await prisma.customerProfile.upsert({
			where: { userId: session.user.id },
			update: {
				...(fullName && { fullName }),
			},
			create: {
				userId: session.user.id,
				fullName: fullName || '',
			},
		});

		return NextResponse.json({
			user: updatedUser,
			profile: customerProfile,
		});
	} catch (error) {
		console.error('Error updating customer profile:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
