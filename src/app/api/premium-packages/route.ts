import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		const premiumPackages = await prisma.premiumPackage.findMany({
			where: {
				isActive: true,
			},
			orderBy: {
				type: 'asc', // MONTHLY trước, YEARLY sau
			},
		});

		// Transform data để phù hợp với frontend
		const transformedPackages = premiumPackages.map((pkg) => ({
			id: pkg.id,
			name: pkg.name,
			type: pkg.type,
			price: pkg.price,
			duration: pkg.duration,
			description: pkg.description,
			features: getFeaturesByType(pkg.type),
			popular: pkg.type === 'YEARLY', // Gói năm là popular
		}));

		return NextResponse.json({
			success: true,
			data: transformedPackages,
		});
	} catch (error) {
		console.error('Error fetching premium packages:', error);
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to fetch premium packages',
			},
			{ status: 500 },
		);
	}
}

// Helper function để lấy features theo loại gói
function getFeaturesByType(type: string): string[] {
	const baseFeatures = [
		'Ưu tiên hiển thị trong top 10 cửa hàng',
		'Tăng khả năng tiếp cận khách hàng',
		'Hỗ trợ khách hàng ưu tiên',
		'Báo cáo doanh thu cơ bản',
	];

	const premiumFeatures = [
		'Ưu tiên hiển thị trong top 10 cửa hàng',
		'Tăng khả năng tiếp cận khách hàng',
		'Hỗ trợ khách hàng ưu tiên 24/7',
		'Phân tích doanh thu chi tiết',
		'Tiết kiệm 40% so với gói tháng',
		'Công cụ marketing nâng cao',
		'Tư vấn kinh doanh chuyên sâu',
	];

	return type === 'MONTHLY' ? baseFeatures : premiumFeatures;
}
