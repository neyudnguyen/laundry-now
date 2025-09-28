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
		const { bankName, bankNumber, bankHolder } = body;

		// Validate required fields
		if (!bankName || !bankNumber || !bankHolder) {
			return NextResponse.json(
				{ error: 'Tất cả thông tin ngân hàng là bắt buộc' },
				{ status: 400 },
			);
		}

		// Validate bank number format
		if (!/^\d{8,20}$/.test(bankNumber)) {
			return NextResponse.json(
				{ error: 'Số tài khoản không hợp lệ' },
				{ status: 400 },
			);
		}

		// Update vendor profile with banking information
		const updatedVendorProfile = await prisma.vendorProfile.upsert({
			where: { userId: session.user.id },
			update: {
				bankName: bankName.trim(),
				bankNumber: bankNumber.trim(),
				bankHolder: bankHolder.trim().toUpperCase(),
			},
			create: {
				userId: session.user.id,
				shopName: 'Cửa hàng của tôi', // Default shop name
				bankName: bankName.trim(),
				bankNumber: bankNumber.trim(),
				bankHolder: bankHolder.trim().toUpperCase(),
			},
			include: {
				address: true,
				images: true,
			},
		});

		return NextResponse.json({
			message: 'Cập nhật thông tin ngân hàng thành công',
			vendorProfile: updatedVendorProfile,
		});
	} catch (error) {
		console.error('Error updating banking info:', error);
		return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
	}
}
