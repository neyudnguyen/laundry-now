import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: 'Bạn cần đăng nhập để xem danh sách khiếu nại' },
				{ status: 401 },
			);
		}

		// Get vendor profile
		const vendorProfile = await prisma.vendorProfile.findUnique({
			where: { userId: session.user.id },
		});

		if (!vendorProfile) {
			return NextResponse.json(
				{ error: 'Không tìm thấy thông tin vendor' },
				{ status: 404 },
			);
		}

		// Get complaints for the vendor
		const complaints = await prisma.complaint.findMany({
			where: {
				vendorId: vendorProfile.id,
			},
			include: {
				order: {
					select: {
						id: true,
						createdAt: true,
						servicePrice: true,
						deliveryFee: true,
						status: true,
					},
				},
				customer: {
					select: {
						fullName: true,
						user: {
							select: {
								phone: true,
							},
						},
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
					status: complaint.order.status,
				},
				customer: {
					fullName: complaint.customer.fullName,
					phone: complaint.customer.user.phone,
				},
			})),
		});
	} catch (error) {
		console.error('Error fetching vendor complaints:', error);
		return NextResponse.json(
			{ error: 'Có lỗi xảy ra khi tải danh sách khiếu nại' },
			{ status: 500 },
		);
	}
}

interface UpdateComplaintRequest {
	complaintId: string;
	resolution: string;
}

export async function PATCH(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: 'Bạn cần đăng nhập để cập nhật khiếu nại' },
				{ status: 401 },
			);
		}

		const body: UpdateComplaintRequest = await request.json();
		const { complaintId, resolution } = body;

		// Validate required fields
		if (!complaintId || !resolution?.trim()) {
			return NextResponse.json(
				{ error: 'ID khiếu nại và phản hồi là bắt buộc' },
				{ status: 400 },
			);
		}

		// Get vendor profile
		const vendorProfile = await prisma.vendorProfile.findUnique({
			where: { userId: session.user.id },
		});

		if (!vendorProfile) {
			return NextResponse.json(
				{ error: 'Không tìm thấy thông tin vendor' },
				{ status: 404 },
			);
		}

		// Check if complaint exists and belongs to this vendor
		const existingComplaint = await prisma.complaint.findFirst({
			where: {
				id: complaintId,
				vendorId: vendorProfile.id,
			},
			include: {
				customer: {
					include: {
						user: true,
					},
				},
				order: true,
			},
		});

		if (!existingComplaint) {
			return NextResponse.json(
				{ error: 'Không tìm thấy khiếu nại' },
				{ status: 404 },
			);
		}

		// Update complaint - vendor can only update resolution and status becomes IN_REVIEW
		const updatedComplaint = await prisma.complaint.update({
			where: { id: complaintId },
			data: {
				status: 'IN_REVIEW',
				resolution: resolution.trim(),
			},
		});

		// Send notification to customer
		const notificationMessage = `Vendor đã phản hồi khiếu nại của bạn cho đơn hàng #${existingComplaint.order.id.slice(-8)}. Admin sẽ xem xét và giải quyết.`;

		await createNotification({
			userId: existingComplaint.customer.user.id,
			message: notificationMessage,
		});

		return NextResponse.json({
			message: 'Phản hồi khiếu nại thành công',
			complaint: {
				id: updatedComplaint.id,
				status: updatedComplaint.status,
				resolution: updatedComplaint.resolution,
				updatedAt: updatedComplaint.updatedAt,
			},
		});
	} catch (error) {
		console.error('Error updating complaint:', error);
		return NextResponse.json(
			{ error: 'Có lỗi xảy ra khi cập nhật khiếu nại' },
			{ status: 500 },
		);
	}
}
