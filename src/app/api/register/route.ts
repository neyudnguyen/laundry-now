import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const {
			phone,
			password,
			role,
			// Customer fields
			fullName,
			// Vendor fields
			shopName,
		} = body;

		// Validate required fields
		if (!phone || !password || !role) {
			return NextResponse.json(
				{ error: 'Số điện thoại, mật khẩu và loại tài khoản là bắt buộc' },
				{ status: 400 },
			);
		}

		// Validate role-specific required fields
		if (role === UserRole.CUSTOMER && !fullName) {
			return NextResponse.json(
				{ error: 'Họ và tên là bắt buộc' },
				{ status: 400 },
			);
		}

		if (role === UserRole.VENDOR && !shopName) {
			return NextResponse.json(
				{ error: 'Tên cửa hàng là bắt buộc cho nhà cung cấp dịch vụ' },
				{ status: 400 },
			);
		}

		// Validate phone format (basic validation)
		const phoneRegex = /^[0-9]{10,15}$/;
		if (!phoneRegex.test(phone)) {
			return NextResponse.json(
				{ error: 'Định dạng số điện thoại không hợp lệ' },
				{ status: 400 },
			);
		}

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { phone },
		});

		if (existingUser) {
			return NextResponse.json(
				{ error: 'Người dùng với số điện thoại này đã tồn tại' },
				{ status: 400 },
			);
		}

		// Hash password
		const saltRounds = 12;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Create user and profile in a transaction
		const result = await prisma.$transaction(async (tx) => {
			// Create user
			const user = await tx.user.create({
				data: {
					phone,
					password: hashedPassword,
					email: null, // Will be updated later if needed
					role: role as UserRole,
				},
			});

			if (role === UserRole.CUSTOMER) {
				// Create customer profile
				const customerProfile = await tx.customerProfile.create({
					data: {
						fullName,
						userId: user.id,
					},
				});

				return { user, profile: customerProfile };
			} else {
				// Create vendor profile
				const vendorProfile = await tx.vendorProfile.create({
					data: {
						shopName,
						userId: user.id,
						addressId: null, // Will be set later when address is added
					},
				});

				return { user, profile: vendorProfile };
			}
		});

		return NextResponse.json(
			{
				message: 'Đăng ký thành công',
				userId: result.user.id,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error('Registration error:', error);

		return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 });
	}
}
