import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { NotificationMessages, createNotification } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';

interface OrderItem {
	serviceId: string;
	quantity: number; // in kg
}

interface CreateOrderRequest {
	vendorId: string;
	pickupType: 'HOME' | 'STORE';
	paymentMethod: 'COD' | 'QRCODE';
	notes?: string;
	homeAddress?: string;
	items: OrderItem[];
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: 'Bạn cần đăng nhập để tạo đơn hàng' },
				{ status: 401 },
			);
		}

		const body: CreateOrderRequest = await request.json();
		const { vendorId, pickupType, paymentMethod, notes, homeAddress, items } =
			body;

		// Validate required fields
		if (!vendorId) {
			return NextResponse.json(
				{ error: 'Vendor ID là bắt buộc' },
				{ status: 400 },
			);
		}

		// Validate home address for home delivery
		if (pickupType === 'HOME' && !homeAddress) {
			return NextResponse.json(
				{ error: 'Địa chỉ giao hàng là bắt buộc khi chọn giao tận nhà' },
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

		// Verify vendor exists
		const vendor = await prisma.vendorProfile.findUnique({
			where: { id: vendorId },
			include: {
				vendorServiceFees: true,
			},
		});

		if (!vendor) {
			return NextResponse.json(
				{ error: 'Không tìm thấy cửa hàng' },
				{ status: 404 },
			);
		}

		// Calculate total price from items
		let servicePrice = 0;
		const orderItems = [];

		// Only process items if they exist
		if (items && items.length > 0) {
			for (const item of items) {
				const service = vendor.vendorServiceFees.find(
					(s) => s.id === item.serviceId,
				);
				if (!service) {
					return NextResponse.json(
						{ error: `Không tìm thấy dịch vụ với ID: ${item.serviceId}` },
						{ status: 400 },
					);
				}

				const itemTotal = service.fee * item.quantity;
				servicePrice += itemTotal;

				orderItems.push({
					name: service.name,
					quantity: item.quantity,
					unitPrice: service.fee,
				});
			}
		}

		// Create order with or without items
		const orderData = {
			customerId: customerProfile.id,
			vendorId: vendorId,
			status: 'PENDING_CONFIRMATION' as const,
			paymentStatus: 'PENDING' as const,
			paymentMethod: paymentMethod,
			pickupType: pickupType,
			servicePrice: servicePrice,
			deliveryFee: 0, // Không tính phí giao hàng cố định
			notes: notes || '',
			homeAddress: homeAddress || null,
			...(orderItems.length > 0 && {
				items: {
					create: orderItems,
				},
			}),
		};

		const order = await prisma.order.create({
			data: orderData,
			include: {
				items: true,
				vendor: {
					include: {
						user: {
							select: {
								phone: true,
								email: true,
							},
						},
						address: true,
					},
				},
				customer: {
					include: {
						user: {
							select: {
								phone: true,
								email: true,
							},
						},
					},
				},
			},
		});

		// Create notifications for both customer and vendor
		try {
			// Notification for vendor about new order
			await createNotification({
				userId: order.vendor.userId,
				message: NotificationMessages.newOrder(
					order.id,
					order.customer.fullName,
				),
			});

			// Notification for customer confirming order creation
			await createNotification({
				userId: session.user.id,
				message: `Đơn hàng #${order.id} đã được tạo thành công và đang chờ xác nhận từ cửa hàng.`,
			});
		} catch (notificationError) {
			// Log error but don't fail the order creation
			console.error('Error creating notifications:', notificationError);
		}

		return NextResponse.json({
			message: 'Tạo đơn hàng thành công',
			order: {
				id: order.id,
				status: order.status,
				paymentStatus: order.paymentStatus,
				paymentMethod: order.paymentMethod,
				pickupType: order.pickupType,
				servicePrice: order.servicePrice,
				deliveryFee: order.deliveryFee,
				totalPrice: order.servicePrice + order.deliveryFee,
				notes: order.notes,
				items: order.items,
				vendor: {
					shopName: order.vendor.shopName,
					phone: order.vendor.user.phone,
				},
				createdAt: order.createdAt,
			},
		});
	} catch (error) {
		console.error('Error creating order:', error);
		return NextResponse.json(
			{ error: 'Không thể tạo đơn hàng' },
			{ status: 500 },
		);
	}
}

export async function GET() {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: 'Không có quyền truy cập' },
				{ status: 401 },
			);
		}

		// Lấy thông tin customer profile
		const customer = await prisma.customerProfile.findUnique({
			where: { userId: session.user.id },
		});

		if (!customer) {
			return NextResponse.json(
				{ error: 'Không tìm thấy thông tin khách hàng' },
				{ status: 404 },
			);
		}

		// Lấy danh sách orders với đầy đủ thông tin
		const orders = await prisma.order.findMany({
			where: {
				customerId: customer.id,
			},
			include: {
				items: true,
				vendor: {
					include: {
						user: {
							select: {
								phone: true,
							},
						},
						address: true,
					},
				},
				review: true,
				complaint: {
					select: {
						id: true,
						title: true,
						status: true,
						createdAt: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		// Transform orders to include vendor.id
		const transformedOrders = orders.map((order) => ({
			...order,
			vendor: {
				id: order.vendor.id,
				shopName: order.vendor.shopName,
				user: order.vendor.user,
				address: order.vendor.address,
			},
		}));

		return NextResponse.json({ orders: transformedOrders });
	} catch (error) {
		console.error('Error fetching customer orders:', error);
		return NextResponse.json(
			{ error: 'Có lỗi xảy ra khi lấy danh sách đơn hàng' },
			{ status: 500 },
		);
	}
}
