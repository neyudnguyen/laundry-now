'use client';

import {
	Banknote,
	Calendar,
	CreditCard,
	DollarSign,
	FileText,
	Package,
	Percent,
	Store,
	TrendingUp,
	Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface VendorInfo {
	id: string;
	shopName: string;
	phone: string;
	email: string;
}

interface VendorOption {
	id: string;
	shopName: string;
	phone: string;
}

interface RevenueStats {
	month: number;
	year: number;
	vendorInfo: VendorInfo | null;
	totalCODRevenue: number;
	totalQRCodeRevenue: number;
	totalQRCodeDeliveryFee: number;
	codCommission: number;
	qrcodeCommission: number;
	totalCommission: number;
	totalAmountToPay: number;
	ordersCount: {
		cod: number;
		qrcode: number;
		total: number;
	};
	vendorsList: VendorOption[];
	billExists: boolean;
	canCreateBill: boolean;
	nextAvailableDate: string;
}

export default function AdminRevenue() {
	const [selectedMonth, setSelectedMonth] = useState<string>('');
	const [selectedVendor, setSelectedVendor] = useState<string>('all');
	const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isCreatingBill, setIsCreatingBill] = useState(false);
	const { toast } = useToast();

	// Generate month options from January current year to current month
	const generateMonthOptions = () => {
		const options = [];
		const currentDate = new Date();
		const currentYear = currentDate.getFullYear();
		const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11

		// Generate months for current year
		for (let month = 1; month <= currentMonth; month++) {
			const value = `${month}-${currentYear}`;
			const label = `Tháng ${month}/${currentYear}`;
			options.push({ value, label });
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

	// Fetch revenue data when month or vendor changes
	useEffect(() => {
		if (selectedMonth) {
			fetchRevenueData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedMonth, selectedVendor]);

	const fetchRevenueData = async () => {
		if (!selectedMonth) return;

		setIsLoading(true);
		try {
			const [month, year] = selectedMonth.split('-');
			let url = `/api/admin/revenue?month=${month}&year=${year}`;

			if (selectedVendor && selectedVendor !== 'all') {
				url += `&vendorId=${selectedVendor}`;
			}

			const response = await fetch(url);

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

	const handleCreateBill = async () => {
		if (
			!selectedMonth ||
			!selectedVendor ||
			selectedVendor === 'all' ||
			!revenueStats
		) {
			toast.error('Vui lòng chọn tháng và vendor cụ thể trước khi tạo bill');
			return;
		}

		setIsCreatingBill(true);
		try {
			const [month, year] = selectedMonth.split('-');
			const response = await fetch('/api/admin/bills', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					month: parseInt(month),
					year: parseInt(year),
					vendorId: selectedVendor,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Có lỗi xảy ra khi tạo bill');
			}

			const data = await response.json();
			toast.success(`Bill đã được tạo cho ${data.bill.vendorName}`);
			// Refresh the data to update billExists status
			fetchRevenueData();
		} catch (error) {
			console.error('Error creating bill:', error);
			toast.error(
				error instanceof Error ? error.message : 'Không thể tạo bill',
			);
		} finally {
			setIsCreatingBill(false);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	const getBillCreationMessage = () => {
		if (!revenueStats) return 'Đang tải...';

		if (selectedVendor === 'all') {
			return 'Chỉ vendor cụ thể mới có thể tạo bill';
		}

		if (revenueStats.billExists) {
			return 'Bill cho vendor và tháng này đã được tạo';
		}

		if (!revenueStats.canCreateBill) {
			let nextDateStr = '';
			if (revenueStats.nextAvailableDate) {
				const nextDate = new Date(revenueStats.nextAvailableDate);
				if (!isNaN(nextDate.getTime())) {
					nextDateStr = nextDate.toLocaleDateString('vi-VN');
				} else {
					// Fallback if date is invalid
					nextDateStr = `1/${revenueStats.month + 1}/${revenueStats.year}`;
				}
			} else {
				// Fallback if nextAvailableDate is not provided
				nextDateStr = `1/${revenueStats.month + 1}/${revenueStats.year}`;
			}
			return `Chỉ có thể tạo bill sau khi tháng ${revenueStats.month}/${revenueStats.year} hoàn thành (từ ${nextDateStr})`;
		}

		return 'Sẵn sàng tạo bill cho vendor này';
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Thống kê doanh thu Admin</h1>
				<p className="text-muted-foreground">
					Theo dõi doanh thu của các vendor và tạo bill thanh toán.
				</p>
			</div>

			{/* Filters */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{/* Month Selector */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							Chọn tháng
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Select value={selectedMonth} onValueChange={setSelectedMonth}>
							<SelectTrigger>
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

				{/* Vendor Selector */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<Store className="h-4 w-4" />
							Chọn vendor
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Select value={selectedVendor} onValueChange={setSelectedVendor}>
							<SelectTrigger>
								<SelectValue placeholder="Tất cả vendors..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tất cả vendors</SelectItem>
								{revenueStats?.vendorsList.map((vendor) => (
									<SelectItem key={vendor.id} value={vendor.id}>
										{vendor.shopName} ({vendor.phone})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</CardContent>
				</Card>

				{/* Create Bill Button */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<FileText className="h-4 w-4" />
							Tạo bill thanh toán
							{revenueStats && !revenueStats.canCreateBill && (
								<div className="ml-auto">
									<div
										className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"
										title="Tháng chưa hoàn thành"
									/>
								</div>
							)}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Button
							onClick={handleCreateBill}
							disabled={
								!selectedVendor ||
								selectedVendor === 'all' ||
								isCreatingBill ||
								(revenueStats?.billExists && selectedVendor !== 'all') ||
								!revenueStats?.canCreateBill
							}
							className="w-full"
						>
							{isCreatingBill
								? 'Đang tạo...'
								: revenueStats?.billExists && selectedVendor !== 'all'
									? 'Bill đã tồn tại'
									: !revenueStats?.canCreateBill
										? 'Tháng chưa hoàn thành'
										: 'Tạo Bill'}
						</Button>
						<p className="text-xs text-muted-foreground mt-2">
							{getBillCreationMessage()}
						</p>
					</CardContent>
				</Card>
			</div>

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

			{/* Month Status Info */}
			{!isLoading && revenueStats && !revenueStats.canCreateBill && (
				<Card className="border-yellow-200 bg-yellow-50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-yellow-800">
							<Calendar className="h-5 w-5" />
							Thông báo về tháng {revenueStats.month}/{revenueStats.year}
						</CardTitle>
					</CardHeader>
					<CardContent className="text-yellow-700">
						<p className="mb-2">
							Tháng {revenueStats.month}/{revenueStats.year} vẫn đang trong quá
							trình diễn ra.
						</p>
						<p className="text-sm">
							<strong>
								Bills chỉ có thể được tạo sau khi tháng hoàn thành
							</strong>{' '}
							(từ ngày{' '}
							{revenueStats.nextAvailableDate
								? new Date(revenueStats.nextAvailableDate).toLocaleDateString(
										'vi-VN',
									)
								: '1/' + (revenueStats.month + 1) + '/' + revenueStats.year}
							). Điều này đảm bảo tính chính xác của dữ liệu doanh thu và tránh
							việc phải cập nhật bill nhiều lần.
						</p>
					</CardContent>
				</Card>
			)}

			{/* Revenue Stats */}
			{!isLoading && revenueStats && (
				<div className="space-y-6">
					{/* Vendor Info */}
					{revenueStats.vendorInfo && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Users className="h-5 w-5" />
									Thông tin Vendor
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<p className="text-sm text-muted-foreground">
											Tên cửa hàng
										</p>
										<p className="font-medium">
											{revenueStats.vendorInfo.shopName}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">
											Số điện thoại
										</p>
										<p className="font-medium">
											{revenueStats.vendorInfo.phone}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Email</p>
										<p className="font-medium">
											{revenueStats.vendorInfo.email || 'Chưa có'}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

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

						{/* Total Commission (Admin earns) */}
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Tổng hoa hồng (2%)
								</CardTitle>
								<Percent className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-primary">
									+{formatCurrency(revenueStats.totalCommission)}
								</div>
								<p className="text-xs text-muted-foreground">
									COD: {formatCurrency(revenueStats.codCommission)} + QR:{' '}
									{formatCurrency(revenueStats.qrcodeCommission)}
								</p>
							</CardContent>
						</Card>

						{/* Total Amount to Pay to Vendor */}
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									Số tiền cần trả vendor
								</CardTitle>
								<TrendingUp className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold text-destructive">
									-{formatCurrency(revenueStats.totalAmountToPay)}
								</div>
								<p className="text-xs text-muted-foreground">
									Admin thanh toán cho vendor
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

					{/* Admin Calculation Formula */}
					<Card>
						<CardHeader>
							<CardTitle>Công thức tính toán (Góc nhìn Admin)</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<div>
								<strong>Hoa hồng từ COD (2%):</strong>{' '}
								{formatCurrency(revenueStats.totalCODRevenue)} × 2% ={' '}
								{formatCurrency(revenueStats.codCommission)}
							</div>
							<div>
								<strong>Hoa hồng từ QR Code (2%):</strong>{' '}
								{formatCurrency(revenueStats.totalQRCodeRevenue)} × 2% ={' '}
								{formatCurrency(revenueStats.qrcodeCommission)}
							</div>
							<div>
								<strong>Tổng hoa hồng Admin nhận được:</strong>{' '}
								{formatCurrency(revenueStats.totalCommission)}
							</div>
							<div className="border-t pt-3">
								<strong>Số tiền Admin cần trả cho vendor:</strong>
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
									<div className="font-medium text-destructive">
										= {formatCurrency(revenueStats.totalAmountToPay)}
									</div>
								</div>
							</div>
							<div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
								<strong>Lưu ý:</strong> Admin nhận hoa hồng 2% từ tất cả đơn
								hàng. Đối với đơn COD, vendor đã nhận tiền mặt nên chỉ cần trả
								hoa hồng cho admin. Đối với đơn QR Code, admin đã nhận tiền từ
								khách và sẽ trả cho vendor sau khi trừ hoa hồng.
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
								{revenueStats.vendorInfo
									? ` cho ${revenueStats.vendorInfo.shopName}`
									: ''}
							</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
