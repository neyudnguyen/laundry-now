import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
	try {
		const session = await auth();

		if (!session || !session.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '20');
		const unreadOnly = searchParams.get('unreadOnly') === 'true';

		const skip = (page - 1) * limit;

		const where = {
			userId: session.user.id,
			...(unreadOnly && { isRead: false }),
		};

		// Get notifications with pagination
		const [notifications, totalCount] = await Promise.all([
			prisma.notification.findMany({
				where,
				orderBy: {
					createdAt: 'desc',
				},
				skip,
				take: limit,
			}),
			prisma.notification.count({ where }),
		]);

		const totalPages = Math.ceil(totalCount / limit);

		return NextResponse.json({
			notifications,
			pagination: {
				page,
				limit,
				totalCount,
				totalPages,
				hasNext: page < totalPages,
				hasPrev: page > 1,
			},
		});
	} catch (error) {
		console.error('Error fetching notifications:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session || !session.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { message, userId } = await request.json();

		if (!message) {
			return NextResponse.json(
				{ error: 'Message is required' },
				{ status: 400 },
			);
		}

		// For now, we'll only allow creating notifications for the current user
		// In the future, you might want to add admin permissions to create notifications for other users
		const targetUserId = userId || session.user.id;

		const notification = await prisma.notification.create({
			data: {
				message,
				userId: targetUserId,
			},
		});

		return NextResponse.json(notification, { status: 201 });
	} catch (error) {
		console.error('Error creating notification:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
