import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;

		const vendor = await prisma.vendorProfile.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						phone: true,
						email: true,
					},
				},
				address: true,
				images: true,
				vendorServiceFees: {
					orderBy: {
						fee: 'asc',
					},
				},
			},
		});

		if (!vendor) {
			return NextResponse.json(
				{ error: 'Không tìm thấy cửa hàng' },
				{ status: 404 },
			);
		}

		const formattedVendor = {
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
			images: vendor.images.map((img) => ({
				id: img.id,
				url: img.url,
			})),
			services: vendor.vendorServiceFees.map((service) => ({
				id: service.id,
				name: service.name,
				fee: service.fee,
			})),
		};

		return NextResponse.json(formattedVendor);
	} catch (error) {
		console.error('Error fetching vendor detail:', error);
		return NextResponse.json(
			{ error: 'Không thể tải thông tin cửa hàng' },
			{ status: 500 },
		);
	}
}
