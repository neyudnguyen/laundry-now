import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
	try {
		const session = await auth();

		if (!session || !session.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Mark all notifications as read for the current user
		const updatedNotifications = await prisma.notification.updateMany({
			where: {
				userId: session.user.id,
				isRead: false,
			},
			data: {
				isRead: true,
			},
		});

		return NextResponse.json({
			success: true,
			updatedCount: updatedNotifications.count,
		});
	} catch (error) {
		console.error('Error marking all notifications as read:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
