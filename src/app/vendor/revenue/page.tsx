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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
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
	const [selectedMonth, setSelectedMonth] = useState<string>('');
	const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();

	// Generate month options from January 2025 to current month
	const generateMonthOptions = () => {
		const options = [];
		const currentDate = new Date();
		const currentYear = currentDate.getFullYear();
		const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11

		// Start from January of current year
		for (let month = 1; month <= currentMonth; month++) {
			const value = `${month}-${currentYear}`;
			const label = `Tháng ${month}/${currentYear}`;
			options.push({ value, label });
		}

		// If we're in a different year than 2025, add previous years
		if (currentYear > 2025) {
			for (let year = 2025; year < currentYear; year++) {
				for (let month = 1; month <= 12; month++) {
					const value = `${month}-${year}`;
					const label = `Tháng ${month}/${year}`;
					options.unshift({ value, label }); // Add to beginning
				}
			}
		}

		return options.reverse(); // Latest first
	};

	const monthOptions = generateMonthOptions();

	// Set default to current month
	useEffect(() => {
		if (monthOptions.length > 0 && !selectedMonth) {
			setSelectedMonth(monthOptions[0].value);
		}
	}, [monthOptions, selectedMonth]);

	// Fetch revenue data when month changes
	useEffect(() => {
		if (selectedMonth) {
			fetchRevenueData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedMonth]);

	const fetchRevenueData = async () => {
		if (!selectedMonth) return;

		setIsLoading(true);
		try {
			const [month, year] = selectedMonth.split('-');
			const response = await fetch(
				`/api/vendor/revenue?month=${month}&year=${year}`,
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
					Theo dõi doanh thu theo tháng và hoa hồng lợi nhuận (2%).
				</p>
			</div>

			{/* Month Selector */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Chọn tháng thống kê
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Select value={selectedMonth} onValueChange={setSelectedMonth}>
						<SelectTrigger className="w-full md:w-64">
							<SelectValue placeholder="Chọn tháng..." />
						</SelectTrigger>
						<SelectContent>
							{monthOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
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
									Tổng hoa hồng (2%)
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
								<strong>Hoa hồng COD (2%):</strong>{' '}
								{formatCurrency(revenueStats.totalCODRevenue)} × 2% ={' '}
								{formatCurrency(revenueStats.codCommission)}
							</div>
							<div>
								<strong>Hoa hồng QR Code (2%):</strong>{' '}
								{formatCurrency(revenueStats.totalQRCodeRevenue)} × 2% ={' '}
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
