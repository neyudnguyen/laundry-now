import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT - Cập nhật địa chỉ
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { province, district, ward, street } = body;
		const { id } = await params;

		if (!province || !district || !ward || !street) {
			return NextResponse.json(
				{ error: 'All address fields are required' },
				{ status: 400 },
			);
		}

		// Kiểm tra địa chỉ có thuộc về customer này không
		const customerProfile = await prisma.customerProfile.findUnique({
			where: { userId: session.user.id },
			include: {
				addresses: {
					where: { id: id },
				},
			},
		});

		if (!customerProfile || customerProfile.addresses.length === 0) {
			return NextResponse.json({ error: 'Address not found' }, { status: 404 });
		}

		const updatedAddress = await prisma.address.update({
			where: { id: id },
			data: {
				province,
				district,
				ward,
				street,
			},
		});

		return NextResponse.json({ address: updatedAddress });
	} catch (error) {
		console.error('Error updating address:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

// DELETE - Xóa địa chỉ
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;

		// Kiểm tra địa chỉ có thuộc về customer này không
		const customerProfile = await prisma.customerProfile.findUnique({
			where: { userId: session.user.id },
			include: {
				addresses: {
					where: { id: id },
				},
			},
		});

		if (!customerProfile || customerProfile.addresses.length === 0) {
			return NextResponse.json({ error: 'Address not found' }, { status: 404 });
		}

		await prisma.address.delete({
			where: { id: id },
		});

		return NextResponse.json({ message: 'Address deleted successfully' });
	} catch (error) {
		console.error('Error deleting address:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
