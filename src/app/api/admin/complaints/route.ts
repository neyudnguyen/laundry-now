import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		// Check authentication and admin role
		const session = await auth();
		if (!session?.user || session.user.role !== 'ADMIN') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get all complaints with related data
		const complaints = await prisma.complaint.findMany({
			include: {
				customer: {
					select: {
						id: true,
						fullName: true,
						user: {
							select: {
								phone: true,
							},
						},
					},
				},
				vendor: {
					select: {
						id: true,
						shopName: true,
						user: {
							select: {
								id: true,
								phone: true,
							},
						},
					},
				},
				order: {
					select: {
						id: true,
						servicePrice: true,
						deliveryFee: true,
						createdAt: true,
						status: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		return NextResponse.json(complaints);
	} catch (error) {
		console.error('Error fetching complaints:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
