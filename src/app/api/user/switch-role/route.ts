import { UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { targetRole } = await request.json();

		// Validate target role
		if (!targetRole || !['CUSTOMER', 'VENDOR'].includes(targetRole)) {
			return NextResponse.json({ error: 'Role không hợp lệ' }, { status: 400 });
		}

		// Check if user is trying to switch to the same role
		if (session.user.role === targetRole) {
			return NextResponse.json(
				{ error: 'Bạn đã đang ở role này' },
				{ status: 400 },
			);
		}

		// Update user role
		await prisma.user.update({
			where: { id: session.user.id },
			data: { role: targetRole as UserRole },
		});

		// If switching to a role that doesn't have a profile, create one
		if (targetRole === 'CUSTOMER') {
			// Check if customer profile exists
			const existingProfile = await prisma.customerProfile.findUnique({
				where: { userId: session.user.id },
			});

			if (!existingProfile) {
				// Create default customer profile
				await prisma.customerProfile.create({
					data: {
						userId: session.user.id,
						fullName: session.user.phone || 'Khách hàng', // Default name
					},
				});
			}
		} else if (targetRole === 'VENDOR') {
			// Check if vendor profile exists
			const existingProfile = await prisma.vendorProfile.findUnique({
				where: { userId: session.user.id },
			});

			if (!existingProfile) {
				// Create default vendor profile
				await prisma.vendorProfile.create({
					data: {
						userId: session.user.id,
						shopName: 'Cửa hàng của tôi', // Default shop name
					},
				});
			}
		}

		return NextResponse.json({
			message: 'Chuyển đổi role thành công',
			newRole: targetRole,
		});
	} catch (error) {
		console.error('Error switching role:', error);
		return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
	}
}
