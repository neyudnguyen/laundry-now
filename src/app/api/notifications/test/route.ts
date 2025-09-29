import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import {
	createNotification,
	createOrderNotification,
} from '@/lib/notifications';

// This is a development endpoint for testing notifications
// Remove or secure this endpoint in production
export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session || !session.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { type, message, orderNumber, amount, reason } = await request.json();

		let notification;

		if (type === 'custom' && message) {
			// Create custom notification
			notification = await createNotification({
				userId: session.user.id,
				message,
			});
		} else if (type && orderNumber) {
			// Create order notification
			const validOrderTypes = [
				'confirmed',
				'picked_up',
				'in_washing',
				'payment_required',
				'completed',
				'cancelled',
			];

			if (!validOrderTypes.includes(type)) {
				return NextResponse.json(
					{ error: 'Invalid order notification type' },
					{ status: 400 },
				);
			}

			notification = await createOrderNotification(
				session.user.id,
				orderNumber,
				type as
					| 'confirmed'
					| 'picked_up'
					| 'in_washing'
					| 'payment_required'
					| 'completed'
					| 'cancelled',
				{ amount, reason },
			);
		} else {
			return NextResponse.json(
				{ error: 'Invalid notification data' },
				{ status: 400 },
			);
		}

		return NextResponse.json(notification, { status: 201 });
	} catch (error) {
		console.error('Error creating test notification:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
