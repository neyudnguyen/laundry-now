import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPremiumPackages() {
	try {
		console.log('🌱 Bắt đầu seed dữ liệu gói premium...');

		// Xóa dữ liệu cũ nếu có
		await prisma.premiumPackage.deleteMany();
		console.log('🗑️  Đã xóa dữ liệu gói premium cũ');

		// Tạo các gói premium
		const premiumPackages = [
			{
				name: 'Gói Premium 1 tháng',
				type: 'MONTHLY',
				price: 100000, // 100k VND
				duration: 30, // 30 ngày
				description:
					'Gói premium 1 tháng với các lợi ích:\n• Ưu tiên hiển thị trong top 10 cửa hàng\n• Tăng khả năng tiếp cận khách hàng\n• Hỗ trợ khách hàng ưu tiên',
				isActive: true,
			},
			{
				name: 'Gói Premium 1 năm',
				type: 'YEARLY',
				price: 600000, // 600k VND
				duration: 365, // 365 ngày
				description:
					'Gói premium 1 năm với các lợi ích:\n• Ưu tiên hiển thị trong top 10 cửa hàng\n• Tăng khả năng tiếp cận khách hàng\n• Hỗ trợ khách hàng ưu tiên\n• Tiết kiệm 40% so với gói tháng\n• Phân tích doanh thu chi tiết',
				isActive: true,
			},
		];

		// Insert dữ liệu
		for (const packageData of premiumPackages) {
			const createdPackage = await prisma.premiumPackage.create({
				data: packageData,
			});
			console.log(
				`✅ Đã tạo gói: ${createdPackage.name} - ${createdPackage.price.toLocaleString('vi-VN')}đ`,
			);
		}

		console.log('\n🎉 Seed dữ liệu gói premium thành công!');
		console.log('📊 Thống kê:');

		const totalPackages = await prisma.premiumPackage.count();
		console.log(`   • Tổng số gói premium: ${totalPackages}`);

		const monthlyPackage = await prisma.premiumPackage.findFirst({
			where: { type: 'MONTHLY' },
		});
		const yearlyPackage = await prisma.premiumPackage.findFirst({
			where: { type: 'YEARLY' },
		});

		console.log(
			`   • Gói tháng: ${monthlyPackage?.price.toLocaleString('vi-VN')}đ`,
		);
		console.log(
			`   • Gói năm: ${yearlyPackage?.price.toLocaleString('vi-VN')}đ`,
		);
	} catch (error) {
		console.error('❌ Lỗi khi seed dữ liệu:', error);
	} finally {
		await prisma.$disconnect();
	}
}

// Chạy script nếu được gọi trực tiếp
if (import.meta.url === `file://${process.argv[1]}`) {
	seedPremiumPackages();
}

export { seedPremiumPackages };
