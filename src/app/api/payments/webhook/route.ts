import { NextRequest, NextResponse } from 'next/server';

import payOS from '@/lib/payos';
import type { WebhookRequest } from '@/lib/payos';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
	try {
		const body: WebhookRequest = await request.json();

		// Xác minh webhook signature
		const webhookData = await payOS.webhooks.verify(body);

		if (!webhookData) {
			return NextResponse.json(
				{ error: 'Invalid webhook signature' },
				{ status: 400 },
			);
		}

		// Lấy thông tin từ webhook payload
		const { code, desc, data } = body;
		const { orderCode } = data;
		const orderCodeNumber = parseInt(orderCode.toString());

		// Kiểm tra xem đây là thanh toán cho order hay premium package
		// Cách 1: Tìm trong orders trước
		const order = await prisma.order.findUnique({
			where: { orderCode: orderCodeNumber },
			include: {
				customer: {
					include: {
						user: true,
					},
				},
				vendor: {
					include: {
						user: true,
					},
				},
			},
		});

		if (order) {
			// Xử lý thanh toán cho customer order
			return await handleCustomerOrderPayment(order, code, desc);
		}

		// Cách 2: Tìm trong vendor premium packages
		const vendorPremiumPackage = await prisma.vendorPremiumPackage.findUnique({
			where: { orderCode: orderCodeNumber },
			include: {
				vendor: {
					include: {
						user: true,
					},
				},
				package: true,
			},
		});

		if (vendorPremiumPackage) {
			// Xử lý thanh toán cho premium package
			return await handlePremiumPackagePayment(
				vendorPremiumPackage,
				code,
				desc,
			);
		}

		// Không tìm thấy order nào
		console.error(
			`No order or premium package found for orderCode: ${orderCode}`,
		);
		return NextResponse.json({ error: 'Order not found' }, { status: 404 });
	} catch (error) {
		console.error('Webhook processing error:', error);
		return NextResponse.json(
			{ error: 'Webhook processing failed' },
			{ status: 500 },
		);
	}
}

// Xử lý thanh toán cho customer order (logic cũ)
async function handleCustomerOrderPayment(
	order: any,
	code: string,
	desc: string,
) {
	if (code === '00' && desc === 'success') {
		// Cập nhật order thành COMPLETED
		await prisma.$transaction([
			prisma.order.update({
				where: { id: order.id },
				data: {
					paymentStatus: 'COMPLETED',
					status: 'COMPLETED',
				},
			}),
			prisma.notification.create({
				data: {
					message: `Đơn hàng ${order.id} đã được thanh toán thành công!`,
					userId: order.customer.userId,
				},
			}),
			prisma.notification.create({
				data: {
					message: `Đơn hàng ${order.id} đã được khách hàng thanh toán thành công!`,
					userId: order.vendor.userId,
				},
			}),
		]);

		console.log(`Customer order payment successful for order ${order.id}`);
	} else {
		console.log(
			`Customer order payment failed/cancelled for order ${order.id}: ${desc}`,
		);
	}

	return NextResponse.json({ success: true });
}

// Xử lý thanh toán cho premium package (logic mới)
async function handlePremiumPackagePayment(
	vendorPremiumPackage: any,
	code: string,
	desc: string,
) {
	if (code === '00' && desc === 'success') {
		// Thanh toán Premium thành công
		const now = new Date();
		const endDate = new Date(
			now.getTime() +
				vendorPremiumPackage.package.duration * 24 * 60 * 60 * 1000,
		);

		await prisma.$transaction([
			// Cập nhật VendorPremiumPackage
			prisma.vendorPremiumPackage.update({
				where: { id: vendorPremiumPackage.id },
				data: {
					status: 'ACTIVE',
					startDate: now,
					endDate,
				},
			}),

			// Kích hoạt Premium cho vendor
			prisma.vendorProfile.update({
				where: { id: vendorPremiumPackage.vendorId },
				data: { isPremium: true },
			}),

			// Gửi thông báo cho vendor
			prisma.notification.create({
				data: {
					message: `Chúc mừng! Gói ${vendorPremiumPackage.package.name} đã được kích hoạt thành công. Cửa hàng của bạn giờ đây sẽ được ưu tiên hiển thị!`,
					userId: vendorPremiumPackage.vendor.userId,
				},
			}),
		]);

		console.log(
			`Premium package activated for vendor ${vendorPremiumPackage.vendor.shopName}`,
		);
	} else {
		// Thanh toán Premium thất bại
		await prisma.vendorPremiumPackage.update({
			where: { id: vendorPremiumPackage.id },
			data: { status: 'EXPIRED' },
		});

		console.log(
			`Premium package payment failed for vendor ${vendorPremiumPackage.vendor.shopName}: ${desc}`,
		);
	}

	return NextResponse.json({ success: true });
}

// Disable body parsing for webhook
export const config = {
	api: {
		bodyParser: false,
	},
};
