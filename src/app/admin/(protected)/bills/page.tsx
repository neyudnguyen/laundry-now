'use client';

import {
	Banknote,
	Calendar,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	Clock,
	CreditCard,
	DollarSign,
	Edit,
	FileText,
	Package,
	Percent,
	TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
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
	name: string;
	email: string;
}

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
	status: 'PENDING' | 'PAID';
	createdAt: string;
	updatedAt: string;
	vendor: VendorInfo;
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

interface VendorsResponse {
	vendors: VendorInfo[];
}

export default function AdminBills() {
	const [billsData, setBillsData] = useState<BillsResponse | null>(null);
	const [vendors, setVendors] = useState<VendorInfo[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedYear, setSelectedYear] = useState<string>('all');
	const [selectedMonth, setSelectedMonth] = useState<string>('all');
	const [selectedVendor, setSelectedVendor] = useState<string>('all');
	const [selectedStatus, setSelectedStatus] = useState<string>('all');
	const [editingBill, setEditingBill] = useState<BillItem | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);
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

	// Status options
	const statusOptions = [
		{ value: 'all', label: 'Tất cả trạng thái' },
		{ value: 'PENDING', label: 'Chờ thanh toán' },
		{ value: 'PAID', label: 'Đã thanh toán' },
	];

	// Fetch vendors on component mount
	useEffect(() => {
		const fetchVendors = async () => {
			try {
				const response = await fetch('/api/admin/vendors');
				if (!response.ok) {
					throw new Error('Không thể tải danh sách nhà cung cấp');
				}
				const data: VendorsResponse = await response.json();
				setVendors(data.vendors);
			} catch (error) {
				console.error('Error fetching vendors:', error);
				toast.error('Không thể tải danh sách nhà cung cấp');
			}
		};

		fetchVendors();
	}, [toast]);

	// Reset page when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [selectedYear, selectedMonth, selectedVendor, selectedStatus]);

	// Fetch bills data when page or filters change
	useEffect(() => {
		fetchBillsData(currentPage);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		currentPage,
		selectedYear,
		selectedMonth,
		selectedVendor,
		selectedStatus,
	]);

	const fetchBillsData = async (page: number) => {
		setIsLoading(true);
		try {
			let url = `/api/admin/bills?page=${page}&limit=10`;

			// Add filters if selected
			if (selectedYear !== 'all' && selectedMonth !== 'all') {
				url += `&year=${selectedYear}&month=${selectedMonth}`;
			}
			if (selectedVendor !== 'all') {
				url += `&vendorId=${selectedVendor}`;
			}
			if (selectedStatus !== 'all') {
				url += `&status=${selectedStatus}`;
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

	const updateBillStatus = async (
		billId: string,
		newStatus: 'PENDING' | 'PAID',
	) => {
		setIsUpdating(true);
		try {
			const response = await fetch(`/api/admin/bills/${billId}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ status: newStatus }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Có lỗi xảy ra');
			}

			// Refresh bills data
			await fetchBillsData(currentPage);

			setEditingBill(null);
			toast.success(
				`Đã cập nhật trạng thái hóa đơn thành "${newStatus === 'PENDING' ? 'Chờ thanh toán' : 'Đã thanh toán'}"`,
			);
		} catch (error) {
			console.error('Error updating bill status:', error);
			toast.error(
				error instanceof Error
					? error.message
					: 'Không thể cập nhật trạng thái hóa đơn',
			);
		} finally {
			setIsUpdating(false);
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

	const formatDateTime = (dateString: string) => {
		return new Date(dateString).toLocaleString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const getStatusBadge = (status: 'PENDING' | 'PAID') => {
		if (status === 'PAID') {
			return (
				<Badge
					variant="default"
					className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
				>
					<CheckCircle className="h-3 w-3 mr-1" />
					Đã thanh toán
				</Badge>
			);
		}
		return (
			<Badge
				variant="secondary"
				className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
			>
				<Clock className="h-3 w-3 mr-1" />
				Chờ thanh toán
			</Badge>
		);
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Quản lý hóa đơn</h1>
				<p className="text-muted-foreground">
					Quản lý và cập nhật trạng thái thanh toán các hóa đơn của nhà cung
					cấp.
				</p>
			</div>

			{/* Filters */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
				{/* Year Selector */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							Năm
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
							Tháng
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

				{/* Vendor Selector */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<Package className="h-4 w-4" />
							Nhà cung cấp
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Select value={selectedVendor} onValueChange={setSelectedVendor}>
							<SelectTrigger>
								<SelectValue placeholder="Chọn nhà cung cấp..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tất cả nhà cung cấp</SelectItem>
								{vendors.map((vendor) => (
									<SelectItem key={vendor.id} value={vendor.id}>
										{vendor.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</CardContent>
				</Card>

				{/* Status Selector */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base flex items-center gap-2">
							<CheckCircle className="h-4 w-4" />
							Trạng thái
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Select value={selectedStatus} onValueChange={setSelectedStatus}>
							<SelectTrigger>
								<SelectValue placeholder="Chọn trạng thái..." />
							</SelectTrigger>
							<SelectContent>
								{statusOptions.map((option) => (
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
								setSelectedVendor('all');
								setSelectedStatus('all');
							}}
							className="w-full"
						>
							Xóa bộ lọc
						</Button>
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
								<div className="flex items-center justify-between">
									<CardTitle className="flex items-center gap-2">
										<FileText className="h-5 w-5" />
										Hóa đơn {bill.monthLabel} - {bill.vendor.name}
									</CardTitle>
									<div className="flex items-center gap-3">
										{getStatusBadge(bill.status)}
										<Dialog
											open={editingBill?.id === bill.id}
											onOpenChange={(open) => {
												if (!open) setEditingBill(null);
											}}
										>
											<DialogTrigger asChild>
												<Button
													variant="outline"
													size="sm"
													onClick={() => setEditingBill(bill)}
												>
													<Edit className="h-4 w-4 mr-2" />
													Cập nhật trạng thái
												</Button>
											</DialogTrigger>
											<DialogContent className="max-w-md">
												<DialogHeader>
													<DialogTitle>Cập nhật trạng thái hóa đơn</DialogTitle>
												</DialogHeader>
												<div className="space-y-4">
													<div className="space-y-2">
														<p className="text-sm">
															<strong>Hóa đơn:</strong> {bill.monthLabel}
														</p>
														<p className="text-sm">
															<strong>Nhà cung cấp:</strong> {bill.vendor.name}
														</p>
														<p className="text-sm">
															<strong>Số tiền:</strong>{' '}
															{formatCurrency(bill.totalAmountToReceive)}
														</p>
														<p className="text-sm">
															<strong>Trạng thái hiện tại:</strong>{' '}
															{bill.status === 'PENDING'
																? 'Chờ thanh toán'
																: 'Đã thanh toán'}
														</p>
													</div>
													<div className="flex gap-2">
														<Button
															variant="outline"
															className="flex-1"
															onClick={() =>
																updateBillStatus(bill.id, 'PENDING')
															}
															disabled={isUpdating || bill.status === 'PENDING'}
														>
															<Clock className="h-4 w-4 mr-2" />
															Chờ thanh toán
														</Button>
														<Button
															className="flex-1"
															onClick={() => updateBillStatus(bill.id, 'PAID')}
															disabled={isUpdating || bill.status === 'PAID'}
														>
															<CheckCircle className="h-4 w-4 mr-2" />
															Đã thanh toán
														</Button>
													</div>
												</div>
											</DialogContent>
										</Dialog>
									</div>
								</div>
								<div className="text-sm text-muted-foreground">
									Cập nhật lần cuối: {formatDateTime(bill.updatedAt)}
								</div>
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
											{formatCurrency(bill.totalCommission)}
										</div>
									</div>

									{/* Amount to Pay */}
									<div className="p-4 bg-muted/50 rounded-lg">
										<div className="flex items-center gap-2 mb-2">
											<TrendingUp className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm font-medium">
												Số tiền cần trả
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
													{formatCurrency(bill.totalCODCompleted)}
												</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-sm">Hoa hồng QR Code (10%):</span>
												<span className="font-medium text-destructive">
													{formatCurrency(bill.totalQRCODECompleted)}
												</span>
											</div>
											<div className="border-t pt-2">
												<div className="flex justify-between items-center font-medium">
													<span>Tổng hoa hồng:</span>
													<span className="text-destructive">
														{formatCurrency(bill.totalCommission)}
													</span>
												</div>
											</div>
											<div className="border-t pt-2">
												<div className="flex justify-between items-center font-medium">
													<span>Số tiền cần trả:</span>
													<span className="text-primary">
														{formatCurrency(bill.totalAmountToReceive)}
													</span>
												</div>
											</div>
										</CardContent>
									</Card>
								</div>

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
								Không tìm thấy hóa đơn nào
							</h3>
							<p className="text-muted-foreground">
								Thử thay đổi bộ lọc hoặc tạo hóa đơn mới.
							</p>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
