import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { NotificationMessages, createNotification } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { recipientId, message, orderId } = await request.json();

		if (!recipientId || !message) {
			return NextResponse.json(
				{ error: 'Thiếu thông tin bắt buộc' },
				{ status: 400 },
			);
		}

		// Get sender info
		const sender = await prisma.user.findUnique({
			where: { id: session.user.id },
			include: {
				customerProfile: true,
				vendorProfile: true,
			},
		});

		if (!sender) {
			return NextResponse.json(
				{ error: 'Không tìm thấy thông tin người gửi' },
				{ status: 404 },
			);
		}

		// Get recipient info
		const recipient = await prisma.user.findUnique({
			where: { id: recipientId },
			include: {
				customerProfile: true,
				vendorProfile: true,
			},
		});

		if (!recipient) {
			return NextResponse.json(
				{ error: 'Không tìm thấy người nhận' },
				{ status: 404 },
			);
		}

		// Determine sender name
		let senderName = '';
		if (sender.customerProfile) {
			senderName = sender.customerProfile.fullName;
		} else if (sender.vendorProfile) {
			senderName = sender.vendorProfile.shopName;
		} else {
			senderName = sender.phone;
		}

		// Create notification for recipient
		let notificationMessage = '';
		if (orderId) {
			notificationMessage = `Tin nhắn từ ${senderName} về đơn hàng #${orderId}: ${message}`;
		} else {
			notificationMessage = NotificationMessages.customerMessage(
				senderName,
				message,
			);
		}

		try {
			await createNotification({
				userId: recipientId,
				message: notificationMessage,
			});
		} catch (notificationError) {
			console.error('Error creating message notification:', notificationError);
		}

		return NextResponse.json({
			message: 'Tin nhắn đã được gửi thành công',
			messageData: {
				senderId: session.user.id,
				recipientId,
				message,
				orderId,
				senderName,
				createdAt: new Date(),
			},
		});
	} catch (error) {
		console.error('Error sending message:', error);
		return NextResponse.json({ error: 'Lỗi server nội bộ' }, { status: 500 });
	}
}
