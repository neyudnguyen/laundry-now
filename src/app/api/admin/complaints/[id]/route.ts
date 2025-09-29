import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		// Check authentication and admin role
		const session = await auth();
		if (!session?.user || session.user.role !== 'ADMIN') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { status } = await request.json();
		const { id } = await params;

		// Validate status
		if (!['RESOLVED', 'REJECTED'].includes(status)) {
			return NextResponse.json(
				{ error: 'Invalid status. Only RESOLVED or REJECTED are allowed.' },
				{ status: 400 },
			);
		}

		// Update complaint status
		const updatedComplaint = await prisma.complaint.update({
			where: { id },
			data: { status },
			include: {
				customer: {
					select: {
						id: true,
						fullName: true,
						user: {
							select: {
								email: true,
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
								email: true,
							},
						},
					},
				},
				order: {
					select: {
						id: true,
						servicePrice: true,
						deliveryFee: true,
					},
				},
			},
		});

		// TODO: Send notification to customer about complaint resolution
		// await createNotification({
		//   userId: updatedComplaint.customer.user.id,
		//   type: 'COMPLAINT_RESOLVED',
		//   message: `Khiếu nại "${updatedComplaint.title}" đã được ${status === 'RESOLVED' ? 'giải quyết' : 'từ chối'}`,
		//   relatedId: updatedComplaint.id,
		// });

		return NextResponse.json(updatedComplaint);
	} catch (error) {
		console.error('Error updating complaint:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
