'use client';

import {
	Banknote,
	Calendar,
	CreditCard,
	DollarSign,
	Package,
	Percent,
	TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface RevenueStats {
	month: number;
	year: number;
	totalCODRevenue: number;
	totalQRCodeRevenue: number;
	totalQRCodeDeliveryFee: number;
	codCommission: number;
	qrcodeCommission: number;
	totalCommission: number;
	totalAmountToReceive: number;
	ordersCount: {
		cod: number;
		qrcode: number;
		total: number;
	};
}

export default function VendorRevenue() {
	const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();

	// Get current month and year
	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
	const currentYear = currentDate.getFullYear();
	const currentMonthLabel = `Tháng ${currentMonth}/${currentYear}`;

	// Fetch revenue data for current month on component mount
	useEffect(() => {
		fetchRevenueData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchRevenueData = async () => {
		setIsLoading(true);
		try {
			const response = await fetch(
				`/api/vendor/revenue?month=${currentMonth}&year=${currentYear}`,
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Có lỗi xảy ra');
			}

			const data = await response.json();
			setRevenueStats(data);
		} catch (error) {
			console.error('Error fetching revenue data:', error);
			toast.error(
				error instanceof Error
					? error.message
					: 'Không thể tải dữ liệu doanh thu',
			);
		} finally {
			setIsLoading(false);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Thống kê doanh thu</h1>
				<p className="text-muted-foreground">
					Theo dõi doanh thu theo tháng và hoa hồng lợi nhuận (10%).
				</p>
			</div>

			{/* Current Month Display */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Thống kê tháng hiện tại
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-lg font-semibold text-primary">
						{currentMonthLabel}
					</div>
					<p className="text-sm text-muted-foreground mt-1">
						Dữ liệu doanh thu được cập nhật theo tháng hiện tại
					</p>
				</CardContent>
			</Card>

			{/* Loading State */}
			{isLoading && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{[...Array(6)].map((_, i) => (
						<Card key={i}>
							<CardHeader className="pb-2">
								<div className="h-4 bg-muted animate-pulse rounded" />
							</CardHeader>
							<CardContent>
								<div className="h-8 bg-muted animate-pulse rounded mb-2" />
								<div className="h-3 bg-muted animate-pulse rounded w-20" />
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Revenue Stats */}
			{!isLoading && revenueStats && (
				<div className="space-y-6">
					{/* Summary Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{/* Total COD Revenue */}
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Doanh thu COD
								</CardTitle>
								<Banknote className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{formatCurrency(revenueStats.totalCODRevenue)}
								</div>
								<p className="text-xs text-muted-foreground">
									{revenueStats.ordersCount.cod} đơn hàng
								</p>
							</CardContent>
						</Card>

						{/* Total QR Code Revenue */}
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Doanh thu QR Code
								</CardTitle>
								<CreditCard className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{formatCurrency(revenueStats.totalQRCodeRevenue)}
								</div>
								<p className="text-xs text-muted-foreground">
									{revenueStats.ordersCount.qrcode} đơn hàng
								</p>
							</CardContent>
						</Card>

						{/* Total Commission */}
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Phí nền tảng (10%)
								</CardTitle>
								<Percent className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-destructive">
									-{formatCurrency(revenueStats.totalCommission)}
								</div>
								<p className="text-xs text-muted-foreground">
									COD: {formatCurrency(revenueStats.codCommission)} + QR:{' '}
									{formatCurrency(revenueStats.qrcodeCommission)}
								</p>
							</CardContent>
						</Card>

						{/* Total Amount to Receive */}
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Số tiền sẽ nhận
								</CardTitle>
								<TrendingUp className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-primary">
									{formatCurrency(revenueStats.totalAmountToReceive)}
								</div>
								<p className="text-xs text-muted-foreground">
									Từ admin thanh toán
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Detailed Breakdown */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Revenue Breakdown */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<DollarSign className="h-5 w-5" />
									Chi tiết doanh thu
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-sm">Doanh thu COD:</span>
									<span className="font-medium">
										{formatCurrency(revenueStats.totalCODRevenue)}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm">Doanh thu QR Code:</span>
									<span className="font-medium">
										{formatCurrency(revenueStats.totalQRCodeRevenue)}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm">Phí giao hàng QR:</span>
									<span className="font-medium">
										{formatCurrency(revenueStats.totalQRCodeDeliveryFee)}
									</span>
								</div>
								<div className="border-t pt-2">
									<div className="flex justify-between items-center font-medium">
										<span>Tổng doanh thu:</span>
										<span>
											{formatCurrency(
												revenueStats.totalCODRevenue +
													revenueStats.totalQRCodeRevenue,
											)}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Orders Summary */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Package className="h-5 w-5" />
									Tổng quan đơn hàng
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-sm">Đơn hàng COD:</span>
									<span className="font-medium">
										{revenueStats.ordersCount.cod} đơn
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-sm">Đơn hàng QR Code:</span>
									<span className="font-medium">
										{revenueStats.ordersCount.qrcode} đơn
									</span>
								</div>
								<div className="border-t pt-2">
									<div className="flex justify-between items-center font-medium">
										<span>Tổng đơn hàng:</span>
										<span>{revenueStats.ordersCount.total} đơn</span>
									</div>
								</div>
								<div className="text-xs text-muted-foreground mt-2">
									Chỉ tính các đơn hàng đã thanh toán thành công
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Calculation Formula */}
					<Card>
						<CardHeader>
							<CardTitle>Công thức tính toán</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<div>
								<strong>Hoa hồng COD (10%):</strong>{' '}
								{formatCurrency(revenueStats.totalCODRevenue)} × 10% ={' '}
								{formatCurrency(revenueStats.codCommission)}
							</div>
							<div>
								<strong>Hoa hồng QR Code (10%):</strong>{' '}
								{formatCurrency(revenueStats.totalQRCodeRevenue)} × 10% ={' '}
								{formatCurrency(revenueStats.qrcodeCommission)}
							</div>
							<div className="border-t pt-3">
								<strong>Số tiền sẽ nhận từ admin:</strong>
								<div className="ml-4 space-y-1 text-muted-foreground">
									<div>
										= Doanh thu QR Code - Hoa hồng COD - Hoa hồng QR Code + Phí
										giao hàng QR
									</div>
									<div>
										= {formatCurrency(revenueStats.totalQRCodeRevenue)} -{' '}
										{formatCurrency(revenueStats.codCommission)} -{' '}
										{formatCurrency(revenueStats.qrcodeCommission)} +{' '}
										{formatCurrency(revenueStats.totalQRCodeDeliveryFee)}
									</div>
									<div className="font-medium text-primary">
										= {formatCurrency(revenueStats.totalAmountToReceive)}
									</div>
								</div>
							</div>
							<div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
								<strong>Lưu ý:</strong> Đơn COD bạn đã nhận tiền mặt trực tiếp,
								chỉ cần trả hoa hồng. Đơn QR Code được khách thanh toán qua hệ
								thống, admin sẽ chuyển khoản số tiền còn lại sau khi trừ hoa
								hồng.
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* No Data State */}
			{!isLoading && revenueStats && revenueStats.ordersCount.total === 0 && (
				<Card>
					<CardContent className="flex items-center justify-center py-12">
						<div className="text-center">
							<Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-muted-foreground">
								Không có đơn hàng nào trong tháng này
							</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
