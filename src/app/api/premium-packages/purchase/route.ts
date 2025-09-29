import { NextRequest, NextResponse } from 'next/server';

import payOS from '@/lib/payos';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
	try {
		const { vendorId, packageId } = await request.json();

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
		const orderCode =
			Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);

		// Tạo VendorPremiumPackage với status PENDING
		const vendorPremiumPackage = await prisma.vendorPremiumPackage.create({
			data: {
				vendorId,
				packageId,
				status: 'PENDING',
				orderCode,
			},
		});

		// Tạo PayOS payment link
		const paymentData = {
			orderCode,
			amount: premiumPackage.price,
			description: `Nâng cấp ${premiumPackage.name} - ${vendor.shopName}`,
			returnUrl: `${process.env.NEXT_PUBLIC_URL}/vendor/dashboard?payment=success&type=premium`,
			cancelUrl: `${process.env.NEXT_PUBLIC_URL}/vendor/dashboard?payment=cancel&type=premium`,
		};

		const paymentLinkResponse = await payOS.paymentRequests.create(paymentData);

		return NextResponse.json({
			success: true,
			data: {
				paymentLink: paymentLinkResponse.checkoutUrl,
				orderCode,
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
