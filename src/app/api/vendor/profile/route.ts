import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		const session = await auth();

		if (!session?.user?.id || session.user.role !== 'VENDOR') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			include: {
				vendorProfile: {
					include: {
						address: true,
						images: true,
					},
				},
			},
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		return NextResponse.json({ user });
	} catch (error) {
		console.error('Error fetching vendor profile:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id || session.user.role !== 'VENDOR') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { shopName, phone, email } = body;

		// Update user basic info
		const updatedUser = await prisma.user.update({
			where: { id: session.user.id },
			data: {
				phone: phone,
				email: email || null,
			},
		});

		// Update or create vendor profile
		const vendorProfile = await prisma.vendorProfile.upsert({
			where: { userId: session.user.id },
			update: {
				shopName: shopName,
			},
			create: {
				userId: session.user.id,
				shopName: shopName,
			},
			include: {
				address: true,
				images: true,
			},
		});

		return NextResponse.json({
			user: {
				...updatedUser,
				vendorProfile,
			},
		});
	} catch (error) {
		console.error('Error updating vendor profile:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
