import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		const session = await auth();

		if (!session?.user?.role || session.user.role !== 'ADMIN') {
			return NextResponse.json(
				{ error: 'Không có quyền truy cập' },
				{ status: 403 },
			);
		}

		// Lấy danh sách nhà cung cấp với thông tin cơ bản
		const vendors = await prisma.user.findMany({
			where: {
				role: 'VENDOR',
			},
			include: {
				vendorProfile: {
					include: {
						address: true,
					},
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		// Chuyển đổi dữ liệu để phù hợp với interface frontend
		const formattedVendors = vendors
			.map((user) => {
				const profile = user.vendorProfile;
				if (!profile) return null;

				return {
					id: profile.id, // Use vendor profile ID for bills
					name: profile.shopName,
					email: user.email,
					phone: user.phone,
					shopName: profile.shopName,
					address: profile.address
						? {
								province: profile.address.province,
								district: profile.address.district,
								ward: profile.address.ward,
								street: profile.address.street,
							}
						: null,
					createdAt: user.createdAt.toISOString(),
				};
			})
			.filter(Boolean);

		return NextResponse.json({ vendors: formattedVendors });
	} catch (error) {
		console.error('Error fetching vendors:', error);
		return NextResponse.json(
			{ error: 'Lỗi server khi lấy danh sách nhà cung cấp' },
			{ status: 500 },
		);
	}
}
