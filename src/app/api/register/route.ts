import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const {
			phone,
			password,
			email,
			role,
			// Customer fields
			fullName,
			// Vendor fields
			shopName,
			// Address fields
			province,
			district,
			ward,
			street,
		} = body;

		// Validate required fields
		if (!phone || !password || !role) {
			return NextResponse.json(
				{ error: 'Số điện thoại, mật khẩu và loại tài khoản là bắt buộc' },
				{ status: 400 },
			);
		}

		// Validate role-specific required fields
		if (role === 'CUSTOMER' && !fullName) {
			return NextResponse.json(
				{ error: 'Họ và tên là bắt buộc' },
				{ status: 400 },
			);
		}

		if (role === 'VENDOR') {
			if (!shopName || !email) {
				return NextResponse.json(
					{
						error: 'Tên cửa hàng và email là bắt buộc cho nhà cung cấp dịch vụ',
					},
					{ status: 400 },
				);
			}
		}

		// Validate address fields
		if (!province || !district || !ward || !street) {
			return NextResponse.json(
				{ error: 'Địa chỉ đầy đủ là bắt buộc' },
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

		// Validate email if provided
		if (email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				return NextResponse.json(
					{ error: 'Định dạng email không hợp lệ' },
					{ status: 400 },
				);
			}
		}

		// Check if user already exists
		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [{ phone }, ...(email ? [{ email }] : [])],
			},
		});

		if (existingUser) {
			if (existingUser.phone === phone) {
				return NextResponse.json(
					{ error: 'Người dùng với số điện thoại này đã tồn tại' },
					{ status: 400 },
				);
			}
			if (existingUser.email === email) {
				return NextResponse.json(
					{ error: 'Người dùng với email này đã tồn tại' },
					{ status: 400 },
				);
			}
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
					email: email || null,
					role: role as 'CUSTOMER' | 'VENDOR',
				},
			});

			if (role === 'CUSTOMER') {
				// Create customer profile
				const customerProfile = await tx.customerProfile.create({
					data: {
						fullName,
						userId: user.id,
					},
				});

				// Create address for customer
				await tx.address.create({
					data: {
						province,
						district,
						ward,
						street,
						customerProfileId: customerProfile.id,
					},
				});

				return { user, profile: customerProfile };
			} else {
				// Create address first for vendor
				const address = await tx.address.create({
					data: {
						province,
						district,
						ward,
						street,
					},
				});

				// Create vendor profile
				const vendorProfile = await tx.vendorProfile.create({
					data: {
						shopName,
						bankAccount: '', // Will be filled later
						userId: user.id,
						addressId: address.id,
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
