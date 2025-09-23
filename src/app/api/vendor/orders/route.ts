import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Verify user is a vendor
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			include: { vendorProfile: true },
		});

		if (!user || user.role !== 'VENDOR' || !user.vendorProfile) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		// Get orders for this vendor
		const orders = await prisma.order.findMany({
			where: {
				vendorId: user.vendorProfile.id,
			},
			include: {
				customer: {
					include: {
						user: {
							select: {
								phone: true,
							},
						},
					},
				},
				items: true,
				review: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		return NextResponse.json({ orders });
	} catch (error) {
		console.error('Error fetching vendor orders:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
