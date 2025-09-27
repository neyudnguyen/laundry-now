import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { NotificationMessages, createNotification } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';

interface CreateComplaintRequest {
	orderId: string;
	title: string;
	description: string;
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: 'Bạn cần đăng nhập để tạo khiếu nại' },
				{ status: 401 },
			);
		}

		const body: CreateComplaintRequest = await request.json();
		const { orderId, title, description } = body;

		// Validate required fields
		if (!orderId || !title?.trim() || !description?.trim()) {
			return NextResponse.json(
				{ error: 'Tất cả các trường đều là bắt buộc' },
				{ status: 400 },
			);
		}

		// Get customer profile
		const customerProfile = await prisma.customerProfile.findUnique({
			where: { userId: session.user.id },
		});

		if (!customerProfile) {
			return NextResponse.json(
				{ error: 'Không tìm thấy thông tin khách hàng' },
				{ status: 404 },
			);
		}

		// Get order and verify it belongs to the customer
		const order = await prisma.order.findFirst({
			where: {
				id: orderId,
				customerId: customerProfile.id,
				status: 'COMPLETED', // Only allow complaints for completed orders
			},
			include: {
				vendor: {
					include: {
						user: true,
					},
				},
			},
		});

		if (!order) {
			return NextResponse.json(
				{
					error:
						'Không tìm thấy đơn hàng hoặc đơn hàng chưa hoàn tất. Chỉ có thể khiếu nại đơn hàng đã hoàn tất.',
				},
				{ status: 404 },
			);
		}

		// Check if complaint already exists for this order
		const existingComplaint = await prisma.complaint.findUnique({
			where: { orderId },
		});

		if (existingComplaint) {
			return NextResponse.json(
				{ error: 'Đã có khiếu nại cho đơn hàng này' },
				{ status: 400 },
			);
		}

		// Create complaint
		const complaint = await prisma.complaint.create({
			data: {
				title: title.trim(),
				description: description.trim(),
				orderId,
				customerId: customerProfile.id,
				vendorId: order.vendorId,
				status: 'PENDING',
			},
		});

		// Send notification to vendor
		await createNotification({
			userId: order.vendor.user.id,
			message: NotificationMessages.newComplaint(
				customerProfile.fullName,
				orderId.slice(-8),
			),
		});

		return NextResponse.json(
			{
				message: 'Khiếu nại đã được tạo thành công',
				complaint: {
					id: complaint.id,
					title: complaint.title,
					description: complaint.description,
					status: complaint.status,
					createdAt: complaint.createdAt,
				},
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error('Error creating complaint:', error);
		return NextResponse.json(
			{ error: 'Có lỗi xảy ra khi tạo khiếu nại' },
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: 'Bạn cần đăng nhập để xem danh sách khiếu nại' },
				{ status: 401 },
			);
		}

		// Get customer profile
		const customerProfile = await prisma.customerProfile.findUnique({
			where: { userId: session.user.id },
		});

		if (!customerProfile) {
			return NextResponse.json(
				{ error: 'Không tìm thấy thông tin khách hàng' },
				{ status: 404 },
			);
		}

		// Get complaints for the customer
		const complaints = await prisma.complaint.findMany({
			where: {
				customerId: customerProfile.id,
			},
			include: {
				order: {
					select: {
						id: true,
						createdAt: true,
						servicePrice: true,
						deliveryFee: true,
					},
				},
				vendor: {
					select: {
						shopName: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		return NextResponse.json({
			complaints: complaints.map((complaint) => ({
				id: complaint.id,
				title: complaint.title,
				description: complaint.description,
				status: complaint.status,
				resolution: complaint.resolution,
				createdAt: complaint.createdAt,
				updatedAt: complaint.updatedAt,
				order: {
					id: complaint.order.id,
					createdAt: complaint.order.createdAt,
					totalAmount:
						complaint.order.servicePrice + complaint.order.deliveryFee,
				},
				vendor: {
					shopName: complaint.vendor.shopName,
				},
			})),
		});
	} catch (error) {
		console.error('Error fetching complaints:', error);
		return NextResponse.json(
			{ error: 'Có lỗi xảy ra khi tải danh sách khiếu nại' },
			{ status: 500 },
		);
	}
}
