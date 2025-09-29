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

		// Lấy danh sách khách hàng với thông tin cơ bản
		const customers = await prisma.user.findMany({
			where: {
				role: 'CUSTOMER',
			},
			include: {
				customerProfile: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		});

		// Chuyển đổi dữ liệu để phù hợp với interface frontend
		const formattedCustomers = customers
			.map((user) => {
				const profile = user.customerProfile;
				if (!profile) return null;

				return {
					id: user.id,
					phone: user.phone,
					email: user.email,
					fullName: profile.fullName,
					createdAt: user.createdAt.toISOString(),
				};
			})
			.filter(Boolean);

		return NextResponse.json(formattedCustomers);
	} catch (error) {
		console.error('Error fetching customers:', error);
		return NextResponse.json(
			{ error: 'Lỗi server khi lấy danh sách khách hàng' },
			{ status: 500 },
		);
	}
}
