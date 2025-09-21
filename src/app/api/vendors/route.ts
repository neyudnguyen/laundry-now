import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		const vendors = await prisma.vendorProfile.findMany({
			include: {
				user: {
					select: {
						phone: true,
						email: true,
					},
				},
				address: true,
				images: {
					take: 1,
				},
				vendorServiceFees: {
					take: 3,
					orderBy: {
						fee: 'asc',
					},
				},
			},
		});

		const formattedVendors = vendors.map((vendor) => ({
			id: vendor.id,
			shopName: vendor.shopName,
			phone: vendor.user.phone,
			email: vendor.user.email,
			address: vendor.address
				? {
						province: vendor.address.province,
						district: vendor.address.district,
						ward: vendor.address.ward,
						street: vendor.address.street,
						fullAddress: `${vendor.address.street}, ${vendor.address.ward}, ${vendor.address.district}, ${vendor.address.province}`,
					}
				: null,
			image: vendor.images[0]?.url || null,
			services: vendor.vendorServiceFees.map((service) => ({
				id: service.id,
				name: service.name,
				fee: service.fee,
			})),
		}));

		return NextResponse.json({
			vendors: formattedVendors,
			total: vendors.length,
		});
	} catch (error) {
		console.error('Error fetching vendors:', error);
		return NextResponse.json(
			{ error: 'Không thể tải danh sách cửa hàng' },
			{ status: 500 },
		);
	}
}
