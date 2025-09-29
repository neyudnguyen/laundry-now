import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET(
	request: NextRequest,
	{ params }: { params: { vendorId: string } },
) {
	try {
		const { vendorId } = params;

		if (!vendorId) {
			return NextResponse.json(
				{ success: false, error: 'Missing vendorId' },
				{ status: 400 },
			);
		}

		// Lấy gói premium hiện tại của vendor (status ACTIVE)
		const currentPremium = await prisma.vendorPremiumPackage.findFirst({
			where: {
				vendorId,
				status: 'ACTIVE',
			},
			include: {
				package: true,
			},
			orderBy: {
				endDate: 'desc', // Lấy gói mới nhất
			},
		});

		return NextResponse.json({
			success: true,
			currentPremium,
		});
	} catch (error) {
		console.error('Error fetching vendor premium:', error);
		return NextResponse.json(
			{ success: false, error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
