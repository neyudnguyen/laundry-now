import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const session = await auth();

		if (!session || !session.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;
		const notificationId = id;
		const { isRead } = await request.json();

		// Check if notification belongs to the current user
		const notification = await prisma.notification.findFirst({
			where: {
				id: notificationId,
				userId: session.user.id,
			},
		});

		if (!notification) {
			return NextResponse.json(
				{ error: 'Notification not found' },
				{ status: 404 },
			);
		}

		// Update notification
		const updatedNotification = await prisma.notification.update({
			where: {
				id: notificationId,
			},
			data: {
				isRead: isRead ?? true,
			},
		});

		return NextResponse.json(updatedNotification);
	} catch (error) {
		console.error('Error updating notification:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const session = await auth();

		if (!session || !session.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;
		const notificationId = id;

		// Check if notification belongs to the current user
		const notification = await prisma.notification.findFirst({
			where: {
				id: notificationId,
				userId: session.user.id,
			},
		});

		if (!notification) {
			return NextResponse.json(
				{ error: 'Notification not found' },
				{ status: 404 },
			);
		}

		// Delete notification
		await prisma.notification.delete({
			where: {
				id: notificationId,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting notification:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
