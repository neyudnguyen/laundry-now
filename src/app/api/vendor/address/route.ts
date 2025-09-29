import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id || session.user.role !== 'VENDOR') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { province, district, ward, street } = body;

		// Get vendor profile
		const vendorProfile = await prisma.vendorProfile.findUnique({
			where: { userId: session.user.id },
			include: { address: true },
		});

		if (!vendorProfile) {
			return NextResponse.json(
				{ error: 'Vendor profile not found' },
				{ status: 404 },
			);
		}

		// Update or create address
		let address;
		if (vendorProfile.addressId) {
			// Update existing address
			address = await prisma.address.update({
				where: { id: vendorProfile.addressId },
				data: {
					province,
					district,
					ward,
					street,
				},
			});
		} else {
			// Create new address and link to vendor profile
			address = await prisma.address.create({
				data: {
					province,
					district,
					ward,
					street,
				},
			});

			// Update vendor profile with address ID
			await prisma.vendorProfile.update({
				where: { id: vendorProfile.id },
				data: { addressId: address.id },
			});
		}

		return NextResponse.json({ address });
	} catch (error) {
		console.error('Error updating vendor address:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
