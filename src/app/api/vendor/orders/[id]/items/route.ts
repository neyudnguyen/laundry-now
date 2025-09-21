import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET order items
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id: orderId } = await params;

		// Verify order ownership
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			include: {
				vendor: {
					include: {
						user: true,
					},
				},
				items: true,
			},
		});

		if (!order) {
			return NextResponse.json({ error: 'Order not found' }, { status: 404 });
		}

		if (order.vendor.user.id !== session.user.id) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		return NextResponse.json({ items: order.items });
	} catch (error) {
		console.error('Error fetching order items:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

// POST new order item
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id: orderId } = await params;
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

		// Validate quantity decimal places (only 1 decimal place allowed)
		const roundedQuantity = Math.round(quantity * 10) / 10;
		if (Math.abs(roundedQuantity - quantity) > 0.001) {
			return NextResponse.json(
				{ error: 'Quantity can only have 1 decimal place (e.g., 0.5, 1.2)' },
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

		// Only allow adding items when order status is ACCEPTED
		if (order.status !== 'ACCEPTED') {
			return NextResponse.json(
				{ error: 'Can only add items when order status is ACCEPTED' },
				{ status: 400 },
			);
		}

		// Create order item
		const orderItem = await prisma.orderItem.create({
			data: {
				name,
				quantity: roundedQuantity,
				unitPrice,
				orderId,
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
		console.error('Error creating order item:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
