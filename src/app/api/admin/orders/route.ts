import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		const session = await auth();

		if (!session?.user?.role || session.user.role !== 'ADMIN') {
			return NextResponse.json(
				{ error: 'Không có quyền truy cập' },
				{ status: 403 },
			);
		}

		// Get all orders
		const orders = await prisma.order.findMany({
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
