'use client';

import {
	Banknote,
	Calendar,
	ChevronLeft,
	ChevronRight,
	CreditCard,
	DollarSign,
	FileText,
	Package,
	Percent,
	TrendingUp,
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

interface BillItem {
	id: string;
	month: number;
	year: number;
	monthLabel: string;
	totalCOD: number;
	totalQRCODE: number;
	totalCODCompleted: number;
	totalQRCODECompleted: number;
	totalQRCODEDeliveryFee: number;
	totalCommission: number;
	totalAmountToReceive: number;
	createdAt: string;
	period: {
		startDate: string;
		endDate: string;
	};
}

interface PaginationInfo {
	page: number;
	limit: number;
	totalCount: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

interface BillsResponse {
	bills: BillItem[];
	pagination: PaginationInfo;
}

export default function VendorBills() {
	const [billsData, setBillsData] = useState<BillsResponse | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedYear, setSelectedYear] = useState<string>('all');
	const [selectedMonth, setSelectedMonth] = useState<string>('all');
	const { toast } = useToast();

	// Generate year options (from 2025 to current year)
	const generateYearOptions = () => {
		const currentYear = new Date().getFullYear();
		const years = [];
		for (let year = 2025; year <= currentYear; year++) {
			years.push({ value: year.toString(), label: `Năm ${year}` });
		}
		return years.reverse(); // Latest first
	};

	// Generate month options
	const generateMonthOptions = () => {
		const months = [];
		for (let month = 1; month <= 12; month++) {
			months.push({
				value: month.toString(),
				label: `Tháng ${month}`,
			});
		}
		return months;
	};

	const yearOptions = generateYearOptions();
	const monthOptions = generateMonthOptions();

	// Fetch bills data when page or filters change
	useEffect(() => {
		setCurrentPage(1); // Reset to first page when filters change
	}, [selectedYear, selectedMonth]);

	useEffect(() => {
		fetchBillsData(currentPage);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage, selectedYear, selectedMonth]);

	const fetchBillsData = async (page: number) => {
		setIsLoading(true);
		try {
			let url = `/api/vendor/bills?page=${page}&limit=10`;

			// Add filters if selected
			if (selectedYear !== 'all' && selectedMonth !== 'all') {
				url += `&year=${selectedYear}&month=${selectedMonth}`;
			}

			const response = await fetch(url);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Có lỗi xảy ra');
			}

			const data = await response.json();
			setBillsData(data);
		} catch (error) {
			console.error('Error fetching bills data:', error);
			toast.error(
				error instanceof Error
					? error.message
					: 'Không thể tải danh sách hóa đơn',
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Hóa đơn thanh toán</h1>
				<p className="text-muted-foreground">
					Danh sách các hóa đơn thanh toán được tạo bởi admin theo từng tháng.
				</p>
			</div>

			{/* Filters */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{/* Year Selector */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							Chọn năm
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Select value={selectedYear} onValueChange={setSelectedYear}>
							<SelectTrigger>
								<SelectValue placeholder="Chọn năm..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tất cả năm</SelectItem>
								{yearOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</CardContent>
				</Card>

				{/* Month Selector */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							Chọn tháng
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Select
							value={selectedMonth}
							onValueChange={setSelectedMonth}
							disabled={selectedYear === 'all'}
						>
							<SelectTrigger>
								<SelectValue placeholder="Chọn tháng..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tất cả tháng</SelectItem>
								{monthOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</CardContent>
				</Card>

				{/* Clear Filters */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Lọc dữ liệu</CardTitle>
					</CardHeader>
					<CardContent>
						<Button
							variant="outline"
							onClick={() => {
								setSelectedYear('all');
								setSelectedMonth('all');
							}}
							className="w-full"
						>
							Xóa bộ lọc
						</Button>
						<p className="text-xs text-muted-foreground mt-2">
							{selectedYear !== 'all' && selectedMonth !== 'all'
								? `Đang lọc: Tháng ${selectedMonth}/${selectedYear}`
								: 'Hiển thị tất cả hóa đơn'}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="grid grid-cols-1 gap-6">
					{[...Array(3)].map((_, i) => (
						<Card key={i}>
							<CardHeader className="pb-4">
								<div className="h-6 bg-muted animate-pulse rounded" />
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
										{[...Array(4)].map((_, j) => (
											<div key={j} className="space-y-2">
												<div className="h-4 bg-muted animate-pulse rounded" />
												<div className="h-6 bg-muted animate-pulse rounded" />
											</div>
										))}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Bills List */}
			{!isLoading && billsData && billsData.bills.length > 0 && (
				<div className="space-y-6">
					{billsData.bills.map((bill) => (
						<Card key={bill.id}>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FileText className="h-5 w-5" />
									Hóa đơn {bill.monthLabel}
								</CardTitle>
							</CardHeader>
							<CardContent>
								{/* Summary Cards */}
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
									{/* Total COD Revenue */}
									<div className="p-4 bg-muted/50 rounded-lg">
										<div className="flex items-center gap-2 mb-2">
											<Banknote className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm font-medium">Doanh thu COD</span>
										</div>
										<div className="text-lg font-bold">
											{formatCurrency(bill.totalCOD)}
										</div>
									</div>

									{/* Total QR Code Revenue */}
									<div className="p-4 bg-muted/50 rounded-lg">
										<div className="flex items-center gap-2 mb-2">
											<CreditCard className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm font-medium">
												Doanh thu QR Code
											</span>
										</div>
										<div className="text-lg font-bold">
											{formatCurrency(bill.totalQRCODE)}
										</div>
									</div>

									{/* Total Commission */}
									<div className="p-4 bg-muted/50 rounded-lg">
										<div className="flex items-center gap-2 mb-2">
											<Percent className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm font-medium">
												Tổng hoa hồng (10%)
											</span>
										</div>
										<div className="text-lg font-bold text-destructive">
											-{formatCurrency(bill.totalCommission)}
										</div>
									</div>

									{/* Amount to Receive */}
									<div className="p-4 bg-muted/50 rounded-lg">
										<div className="flex items-center gap-2 mb-2">
											<TrendingUp className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm font-medium">
												Số tiền nhận được
											</span>
										</div>
										<div className="text-lg font-bold text-primary">
											{formatCurrency(bill.totalAmountToReceive)}
										</div>
									</div>
								</div>

								{/* Detailed Breakdown */}
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
									{/* Revenue Details */}
									<Card>
										<CardHeader>
											<CardTitle className="text-base flex items-center gap-2">
												<DollarSign className="h-4 w-4" />
												Chi tiết doanh thu
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-3">
											<div className="flex justify-between items-center">
												<span className="text-sm">Doanh thu COD:</span>
												<span className="font-medium">
													{formatCurrency(bill.totalCOD)}
												</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-sm">Doanh thu QR Code:</span>
												<span className="font-medium">
													{formatCurrency(bill.totalQRCODE)}
												</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-sm">Phí giao hàng QR:</span>
												<span className="font-medium">
													{formatCurrency(bill.totalQRCODEDeliveryFee)}
												</span>
											</div>
											<div className="border-t pt-2">
												<div className="flex justify-between items-center font-medium">
													<span>Tổng doanh thu:</span>
													<span>
														{formatCurrency(bill.totalCOD + bill.totalQRCODE)}
													</span>
												</div>
											</div>
										</CardContent>
									</Card>

									{/* Commission Details */}
									<Card>
										<CardHeader>
											<CardTitle className="text-base flex items-center gap-2">
												<Package className="h-4 w-4" />
												Chi tiết hoa hồng
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-3">
											<div className="flex justify-between items-center">
												<span className="text-sm">Hoa hồng COD (10%):</span>
												<span className="font-medium text-destructive">
													-{formatCurrency(bill.totalCODCompleted)}
												</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-sm">Hoa hồng QR Code (10%):</span>
												<span className="font-medium text-destructive">
													-{formatCurrency(bill.totalQRCODECompleted)}
												</span>
											</div>
											<div className="border-t pt-2">
												<div className="flex justify-between items-center font-medium">
													<span>Tổng hoa hồng:</span>
													<span className="text-destructive">
														-{formatCurrency(bill.totalCommission)}
													</span>
												</div>
											</div>
											<div className="border-t pt-2">
												<div className="flex justify-between items-center font-medium">
													<span>Số tiền nhận được:</span>
													<span className="text-primary">
														{formatCurrency(bill.totalAmountToReceive)}
													</span>
												</div>
											</div>
										</CardContent>
									</Card>
								</div>

								{/* Calculation Formula */}
								<Card className="mt-6">
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<DollarSign className="h-5 w-5" />
											Công thức tính toán (Góc nhìn Vendor)
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3 text-sm">
										<div>
											<strong>Hoa hồng COD (10%):</strong>{' '}
											{formatCurrency(bill.totalCOD)} × 10% ={' '}
											{formatCurrency(bill.totalCODCompleted)}
										</div>
										<div>
											<strong>Hoa hồng QR Code (10%):</strong>{' '}
											{formatCurrency(bill.totalQRCODE)} × 10% ={' '}
											{formatCurrency(bill.totalQRCODECompleted)}
										</div>
										<div>
											<strong>Tổng hoa hồng phải trả:</strong>{' '}
											{formatCurrency(bill.totalCODCompleted)} +{' '}
											{formatCurrency(bill.totalQRCODECompleted)} ={' '}
											{formatCurrency(bill.totalCommission)}
										</div>
										<div className="border-t pt-3">
											<strong>Số tiền vendor sẽ nhận từ admin:</strong>
											<div className="ml-4 space-y-1 text-muted-foreground">
												<div>
													= Doanh thu QR Code - Hoa hồng COD - Hoa hồng QR Code
													+ Phí giao hàng QR
												</div>
												<div>
													= {formatCurrency(bill.totalQRCODE)} -{' '}
													{formatCurrency(bill.totalCODCompleted)} -{' '}
													{formatCurrency(bill.totalQRCODECompleted)} +{' '}
													{formatCurrency(bill.totalQRCODEDeliveryFee)}
												</div>
												<div className="font-medium text-primary">
													= {formatCurrency(bill.totalAmountToReceive)}
												</div>
											</div>
										</div>
										<div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
											<strong>Giải thích:</strong> Với đơn COD, bạn đã nhận tiền
											mặt trực tiếp từ khách nên chỉ cần trả hoa hồng 10% cho
											admin. Với đơn QR Code, khách đã thanh toán qua hệ thống,
											admin sẽ chuyển khoản cho bạn số tiền còn lại sau khi trừ
											hoa hồng. Phí giao hàng QR được cộng thêm vì đã tính vào
											giá khách thanh toán.
										</div>
									</CardContent>
								</Card>

								{/* Period Info */}
								<div className="mt-6 p-4 bg-muted/30 rounded-lg">
									<div className="flex items-center gap-2 mb-2">
										<Calendar className="h-4 w-4 text-muted-foreground" />
										<span className="text-sm font-medium">Kỳ thanh toán</span>
									</div>
									<p className="text-sm text-muted-foreground">
										Từ {formatDate(bill.period.startDate)} đến{' '}
										{formatDate(bill.period.endDate)}
									</p>
								</div>
							</CardContent>
						</Card>
					))}

					{/* Pagination */}
					{billsData.pagination.totalPages > 1 && (
						<Card>
							<CardContent className="py-4">
								<div className="flex items-center justify-between">
									<div className="text-sm text-muted-foreground">
										Hiển thị {billsData.bills.length} trên{' '}
										{billsData.pagination.totalCount} hóa đơn
									</div>
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												handlePageChange(billsData.pagination.page - 1)
											}
											disabled={!billsData.pagination.hasPrevPage}
										>
											<ChevronLeft className="h-4 w-4" />
											Trước
										</Button>
										<span className="text-sm">
											Trang {billsData.pagination.page} /{' '}
											{billsData.pagination.totalPages}
										</span>
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												handlePageChange(billsData.pagination.page + 1)
											}
											disabled={!billsData.pagination.hasNextPage}
										>
											Sau
											<ChevronRight className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			)}

			{/* No Data State */}
			{!isLoading && billsData && billsData.bills.length === 0 && (
				<Card>
					<CardContent className="flex items-center justify-center py-12">
						<div className="text-center">
							<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-medium mb-2">
								Chưa có hóa đơn thanh toán
							</h3>
							<p className="text-muted-foreground">
								Admin sẽ tạo hóa đơn thanh toán cho bạn vào cuối mỗi tháng.
							</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
