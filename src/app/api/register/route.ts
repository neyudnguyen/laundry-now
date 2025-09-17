import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { phone, password, fullName } = body;

		// Validate required fields
		if (!phone || !password || !fullName) {
			return NextResponse.json(
				{ error: 'Phone, password, and full name are required' },
				{ status: 400 },
			);
		}

		// Validate phone format (basic validation)
		const phoneRegex = /^[0-9]{10,15}$/;
		if (!phoneRegex.test(phone)) {
			return NextResponse.json(
				{ error: 'Invalid phone number format' },
				{ status: 400 },
			);
		}

		// Check if user already exists
		const existingUser = await prisma.user.findUnique({
			where: { phone },
		});

		if (existingUser) {
			return NextResponse.json(
				{ error: 'User with this phone number already exists' },
				{ status: 400 },
			);
		}

		// Hash password
		const saltRounds = 12;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Create user and customer profile in a transaction
		const result = await prisma.$transaction(async (tx) => {
			// Create user
			const user = await tx.user.create({
				data: {
					phone,
					password: hashedPassword,
					role: 'CUSTOMER',
				},
			});

			// Create customer profile
			const customerProfile = await tx.customerProfile.create({
				data: {
					fullName,
					userId: user.id,
				},
			});

			return { user, customerProfile };
		});

		return NextResponse.json(
			{
				message: 'User registered successfully',
				userId: result.user.id,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error('Registration error:', error);

		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
