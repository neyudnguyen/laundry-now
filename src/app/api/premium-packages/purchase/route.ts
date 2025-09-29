import { NextRequest, NextResponse } from 'next/server';

import payOS from '@/lib/payos';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
	try {
		console.log('Premium purchase API called');

		// Parse JSON với error handling
		let body;
		try {
			const requestText = await request.text();
			console.log('Request body text:', requestText);

			if (!requestText.trim()) {
				return NextResponse.json(
					{ success: false, error: 'Empty request body' },
					{ status: 400 },
				);
			}

			body = JSON.parse(requestText);
			console.log('Parsed body:', body);
		} catch (parseError) {
			console.error('JSON parse error:', parseError);
			return NextResponse.json(
				{ success: false, error: 'Invalid JSON body' },
				{ status: 400 },
			);
		}

		const { vendorId, packageId } = body;
		console.log('vendorId:', vendorId, 'packageId:', packageId);

		if (!vendorId || !packageId) {
			return NextResponse.json(
				{ success: false, error: 'Missing vendorId or packageId' },
				{ status: 400 },
			);
		}

		// Kiểm tra vendor tồn tại
		const vendor = await prisma.vendorProfile.findUnique({
			where: { id: vendorId },
			include: { user: true },
		});

		if (!vendor) {
			return NextResponse.json(
				{ success: false, error: 'Vendor not found' },
				{ status: 404 },
			);
		}

		// Kiểm tra package tồn tại
		const premiumPackage = await prisma.premiumPackage.findUnique({
			where: { id: packageId, isActive: true },
		});

		if (!premiumPackage) {
			return NextResponse.json(
				{ success: false, error: 'Package not found or inactive' },
				{ status: 404 },
			);
		}

		// Tạo orderCode unique cho premium package
		// Sử dụng timestamp + random để tránh trùng với customer orders
		const orderCodeNumber =
			Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);

		// Tạo VendorPremiumPackage với status PENDING
		const vendorPremiumPackage = await prisma.vendorPremiumPackage.create({
			data: {
				vendorId,
				packageId,
				status: 'PENDING',
				orderCode: orderCodeNumber.toString(),
			},
		});

		// Tạo PayOS payment link
		const shortDescription =
			premiumPackage.type === 'MONTHLY'
				? 'Gói Premium 1 tháng'
				: 'Gói Premium 1 năm';

		const paymentData = {
			orderCode: orderCodeNumber,
			amount: premiumPackage.price,
			description: shortDescription.substring(0, 25), // Đảm bảo <= 25 ký tự
			returnUrl: `${process.env.NEXT_PUBLIC_URL}/vendor/dashboard?payment=success&type=premium`,
			cancelUrl: `${process.env.NEXT_PUBLIC_URL}/vendor/dashboard?payment=cancel&type=premium`,
		};

		const paymentLinkResponse = await payOS.paymentRequests.create(paymentData);

		return NextResponse.json({
			success: true,
			data: {
				paymentLink: paymentLinkResponse.checkoutUrl,
				orderCode: orderCodeNumber,
				vendorPremiumPackageId: vendorPremiumPackage.id,
			},
		});
	} catch (error) {
		console.error('Error creating premium purchase:', error);
		return NextResponse.json(
			{ success: false, error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
