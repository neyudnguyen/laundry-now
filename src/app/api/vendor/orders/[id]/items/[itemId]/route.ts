import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT update order item
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string; itemId: string }> },
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id: orderId, itemId } = await params;
		const body = await request.json();
		const { name, quantity, unitPrice } = body;

		// Validate input
		if (!name || !quantity || !unitPrice) {
			return NextResponse.json(
				{ error: 'Name, quantity, and unitPrice are required' },
				{ status: 400 },
			);
		}

		if (quantity <= 0 || unitPrice <= 0) {
			return NextResponse.json(
				{ error: 'Quantity and unitPrice must be positive' },
				{ status: 400 },
			);
		}

		// Verify order ownership and status
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				vendor: {
					include: {
						user: true,
					},
				},
			},
		});

		if (!order) {
			return NextResponse.json({ error: 'Order not found' }, { status: 404 });
		}

		if (order.vendor.user.id !== session.user.id) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		// Only allow editing items when order status is ACCEPTED
		if (order.status !== 'ACCEPTED') {
			return NextResponse.json(
				{ error: 'Can only edit items when order status is ACCEPTED' },
				{ status: 400 },
			);
		}

		// Update order item
		const orderItem = await prisma.orderItem.update({
			where: {
				id: itemId,
				orderId: orderId, // Ensure item belongs to this order
			},
			data: {
				name,
				quantity,
				unitPrice,
			},
		});

		// Update order service price
		const allItems = await prisma.orderItem.findMany({
			where: { orderId },
		});

		const totalServicePrice = allItems.reduce(
			(total, item) => total + item.quantity * item.unitPrice,
			0,
		);

		await prisma.order.update({
			where: { id: orderId },
			data: { servicePrice: totalServicePrice },
		});

		return NextResponse.json({ item: orderItem });
	} catch (error) {
		console.error('Error updating order item:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

// DELETE order item
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string; itemId: string }> },
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id: orderId, itemId } = await params;

		// Verify order ownership and status
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				vendor: {
					include: {
						user: true,
					},
				},
			},
		});

		if (!order) {
			return NextResponse.json({ error: 'Order not found' }, { status: 404 });
		}

		if (order.vendor.user.id !== session.user.id) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		// Only allow deleting items when order status is ACCEPTED
		if (order.status !== 'ACCEPTED') {
			return NextResponse.json(
				{ error: 'Can only delete items when order status is ACCEPTED' },
				{ status: 400 },
			);
		}

		// Delete order item
		await prisma.orderItem.delete({
			where: {
				id: itemId,
				orderId: orderId, // Ensure item belongs to this order
			},
		});

		// Update order service price
		const allItems = await prisma.orderItem.findMany({
			where: { orderId },
		});

		const totalServicePrice = allItems.reduce(
			(total, item) => total + item.quantity * item.unitPrice,
			0,
		);

		await prisma.order.update({
			where: { id: orderId },
			data: { servicePrice: totalServicePrice },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting order item:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
