import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session || session.user.role !== 'CUSTOMER') {
			return NextResponse.json(
				{ error: 'Không có quyền truy cập' },
				{ status: 401 },
			);
		}

		const { currentPassword, newPassword } = await request.json();

		if (!currentPassword || !newPassword) {
			return NextResponse.json(
				{ error: 'Vui lòng nhập đầy đủ thông tin' },
				{ status: 400 },
			);
		}

		if (newPassword.length < 6) {
			return NextResponse.json(
				{ error: 'Mật khẩu mới phải có ít nhất 6 ký tự' },
				{ status: 400 },
			);
		}

		// Get current user
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
		});

		if (!user) {
			return NextResponse.json(
				{ error: 'Không tìm thấy tài khoản' },
				{ status: 404 },
			);
		}

		// Check if current password is correct
		const isCurrentPasswordValid = await bcrypt.compare(
			currentPassword,
			user.password,
		);

		if (!isCurrentPasswordValid) {
			return NextResponse.json(
				{ error: 'Mật khẩu hiện tại không đúng' },
				{ status: 400 },
			);
		}

		// Hash new password
		const saltRounds = 12;
		const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

		// Update password
		await prisma.user.update({
			where: { id: session.user.id },
			data: { password: hashedNewPassword },
		});

		return NextResponse.json({ message: 'Đổi mật khẩu thành công' });
	} catch (error) {
		console.error('Error changing customer password:', error);
		return NextResponse.json(
			{ error: 'Có lỗi xảy ra khi đổi mật khẩu' },
			{ status: 500 },
		);
	}
}
