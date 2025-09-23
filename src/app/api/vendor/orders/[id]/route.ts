import {
	OrderStatus,
	PaymentMethod,
	PaymentStatus,
	PickupType,
} from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Verify user is a vendor
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			include: { vendorProfile: true },
		});

		if (!user || user.role !== 'VENDOR' || !user.vendorProfile) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const { id: orderId } = await params;
		const body = await request.json();

		// Get current order to check ownership and current status
		const currentOrder = await prisma.order.findUnique({
			where: { id: orderId },
			include: { items: true },
		});

		if (!currentOrder) {
			return NextResponse.json({ error: 'Order not found' }, { status: 404 });
		}

		if (currentOrder.vendorId !== user.vendorProfile.id) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		// Validate status transitions based on business logic
		const { status, paymentMethod, pickupType, deliveryFee, notes } = body;

		// Prevent editing CANCELLED or COMPLETED orders
		if (
			currentOrder.status === 'CANCELLED' ||
			currentOrder.status === 'COMPLETED'
		) {
			return NextResponse.json(
				{ error: 'Cannot modify cancelled or completed orders' },
				{ status: 400 },
			);
		}

		// Validate status transitions
		if (status) {
			const validTransitions: Record<string, string[]> = {
				PENDING_CONFIRMATION: ['CONFIRMED', 'CANCELLED'],
				CONFIRMED: ['PICKED_UP', 'CANCELLED'],
				PICKED_UP: ['IN_WASHING'],
				IN_WASHING: ['PAYMENT_REQUIRED'],
				PAYMENT_REQUIRED: ['COMPLETED'], // Only for COD, QRCODE auto-completes
			};

			const allowedNextStatuses = validTransitions[currentOrder.status];
			if (!allowedNextStatuses?.includes(status)) {
				return NextResponse.json(
					{
						error: `Cannot transition from ${currentOrder.status} to ${status}`,
					},
					{ status: 400 },
				);
			}

			// For QRCODE payment method, vendor cannot manually set to COMPLETED
			if (
				status === 'COMPLETED' &&
				currentOrder.paymentMethod === 'QRCODE' &&
				currentOrder.paymentStatus !== 'COMPLETED'
			) {
				return NextResponse.json(
					{
						error:
							'Cannot complete QRCODE orders until payment is confirmed by system',
					},
					{ status: 400 },
				);
			}
		}

		// Validate delivery fee updates - allow only for PICKED_UP with HOME delivery or PAYMENT_REQUIRED
		if (deliveryFee !== undefined) {
			if (
				currentOrder.status !== 'PICKED_UP' &&
				currentOrder.status !== 'PAYMENT_REQUIRED'
			) {
				return NextResponse.json(
					{
						error:
							'Can only update delivery fee when order status is PICKED_UP or PAYMENT_REQUIRED',
					},
					{ status: 400 },
				);
			}

			// For PICKED_UP status, only allow if pickup type is HOME
			if (
				currentOrder.status === 'PICKED_UP' &&
				currentOrder.pickupType !== 'HOME'
			) {
				return NextResponse.json(
					{
						error:
							'Can only update delivery fee for home delivery orders when status is PICKED_UP',
					},
					{ status: 400 },
				);
			}
		}

		// Calculate service price from order items
		let servicePrice = currentOrder.servicePrice;
		if (currentOrder.items.length > 0) {
			servicePrice = currentOrder.items.reduce(
				(total, item) => total + item.quantity * item.unitPrice,
				0,
			);
		}

		// Update order
		const updateData: {
			status?: OrderStatus;
			paymentMethod?: PaymentMethod;
			pickupType?: PickupType;
			deliveryFee?: number;
			notes?: string;
			servicePrice: number;
			paymentStatus?: PaymentStatus;
		} = {
			...(status && { status }),
			...(paymentMethod && { paymentMethod }),
			...(pickupType && { pickupType }),
			...(deliveryFee !== undefined && { deliveryFee }),
			...(notes !== undefined && { notes }),
			servicePrice,
		};

		// If completing COD order, also update payment status
		if (status === 'COMPLETED' && currentOrder.paymentMethod === 'COD') {
			updateData.paymentStatus = 'COMPLETED';
		}

		const updatedOrder = await prisma.order.update({
			where: { id: orderId },
			data: updateData,
			include: {
				customer: {
					include: {
						user: {
							select: {
								phone: true,
							},
						},
					},
				},
				items: true,
			},
		});

		return NextResponse.json({ order: updatedOrder });
	} catch (error) {
		console.error('Error updating order:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
