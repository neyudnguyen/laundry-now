'use client';

import {
	AlertCircle,
	CheckCircle,
	Clock,
	DollarSign,
	Package,
	Store,
	TrendingUp,
	Users,
	Wallet,
	X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DashboardStats {
	totalVendors: number;
	totalCustomers: number;
	pendingComplaints: number;
	systemMoney: number;
	adminCommission: number;
	totalOrdersThisMonth: number;
	monthlyRevenue: number;
	month: number;
	year: number;
}

interface Complaint {
	id: string;
	title: string;
	description: string;
	status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';
	createdAt: string;
	resolution?: string;
	customer: {
		id: string;
		fullName: string;
		user: {
			email: string;
		};
	};
	vendor: {
		id: string;
		shopName: string;
		user: {
			email: string;
		};
	};
	order: {
		id: string;
		servicePrice: number;
		deliveryFee: number;
	};
}

const statusConfig = {
	PENDING: {
		label: 'Chờ xử lý',
		color: 'bg-yellow-500',
		icon: Clock,
	},
	IN_REVIEW: {
		label: 'Đang xem xét',
		color: 'bg-blue-500',
		icon: AlertCircle,
	},
	RESOLVED: {
		label: 'Đã giải quyết',
		color: 'bg-green-500',
		icon: CheckCircle,
	},
	REJECTED: {
		label: 'Từ chối',
		color: 'bg-red-500',
		icon: X,
	},
};

export default function AdminDashboard() {
	const [complaints, setComplaints] = useState<Complaint[]>([]);
	const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [selectedTab, setSelectedTab] = useState('all');

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			const [dashboardResponse, complaintsResponse] = await Promise.all([
				fetch('/api/admin/dashboard'),
				fetch('/api/admin/complaints'),
			]);

			if (dashboardResponse.ok && complaintsResponse.ok) {
				const [dashboardData, complaintsData] = await Promise.all([
					dashboardResponse.json(),
					complaintsResponse.json(),
				]);
				setDashboardStats(dashboardData);
				setComplaints(complaintsData);
			} else {
				throw new Error('Failed to fetch dashboard data');
			}
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
			toast.error('Không thể tải dữ liệu dashboard');
		} finally {
			setLoading(false);
		}
	};

	const fetchComplaints = async () => {
		try {
			const response = await fetch('/api/admin/complaints');
			if (response.ok) {
				const data = await response.json();
				setComplaints(data);
			} else {
				throw new Error('Failed to fetch complaints');
			}
		} catch (error) {
			console.error('Error fetching complaints:', error);
			toast.error('Không thể tải danh sách khiếu nại');
		}
	};

	const handleComplaintAction = async (
		complaintId: string,
		action: 'RESOLVED' | 'REJECTED',
	) => {
		try {
			const response = await fetch(`/api/admin/complaints/${complaintId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ status: action }),
			});

			if (response.ok) {
				await fetchComplaints(); // Refresh complaints only
				toast.success(
					`Khiếu nại đã được ${action === 'RESOLVED' ? 'giải quyết' : 'từ chối'}`,
				);
			} else {
				throw new Error('Failed to update complaint');
			}
		} catch (error) {
			console.error('Error updating complaint:', error);
			toast.error('Không thể cập nhật khiếu nại');
		}
	};

	const filterComplaints = (status?: string) => {
		if (!status || status === 'all') return complaints;
		return complaints.filter((complaint) => complaint.status === status);
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	const getComplaintCounts = () => {
		return {
			all: complaints.length,
			PENDING: complaints.filter((c) => c.status === 'PENDING').length,
			IN_REVIEW: complaints.filter((c) => c.status === 'IN_REVIEW').length,
			RESOLVED: complaints.filter((c) => c.status === 'RESOLVED').length,
			REJECTED: complaints.filter((c) => c.status === 'REJECTED').length,
		};
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold">Dashboard Admin</h1>
					<p className="text-muted-foreground">
						Tổng quan hệ thống và quản lý khiếu nại
					</p>
				</div>

				{/* Loading skeleton */}
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					{[...Array(4)].map((_, i) => (
						<Card key={i}>
							<CardHeader className="pb-2">
								<div className="h-4 bg-muted animate-pulse rounded w-24" />
							</CardHeader>
							<CardContent>
								<div className="h-8 bg-muted animate-pulse rounded mb-2" />
								<div className="h-3 bg-muted animate-pulse rounded w-20" />
							</CardContent>
						</Card>
					))}
				</div>

				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{[...Array(3)].map((_, i) => (
						<Card key={i}>
							<CardHeader className="pb-2">
								<div className="h-4 bg-muted animate-pulse rounded w-32" />
							</CardHeader>
							<CardContent>
								<div className="h-8 bg-muted animate-pulse rounded mb-2" />
								<div className="h-3 bg-muted animate-pulse rounded w-24" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	const counts = getComplaintCounts();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Dashboard Admin</h1>
				<p className="text-muted-foreground">
					Tổng quan hệ thống và quản lý khiếu nại
				</p>
			</div>{' '}
			{/* Main Stats Cards */}
			{dashboardStats && (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Tổng số Vendor
							</CardTitle>
							<Store className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{dashboardStats.totalVendors}
							</div>
							<p className="text-xs text-muted-foreground">Vendors hoạt động</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Tổng số Customer
							</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{dashboardStats.totalCustomers}
							</div>
							<p className="text-xs text-muted-foreground">
								Khách hàng đăng ký
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Khiếu nại cần xử lý
							</CardTitle>
							<AlertCircle className="h-4 w-4 text-orange-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{dashboardStats.pendingComplaints}
							</div>
							<p className="text-xs text-muted-foreground">
								Chờ admin giải quyết
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Tiền trong hệ thống
							</CardTitle>
							<Wallet className="h-4 w-4 text-green-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{formatCurrency(dashboardStats.systemMoney)}
							</div>
							<p className="text-xs text-muted-foreground">
								Chưa thanh toán cho vendor
							</p>
						</CardContent>
					</Card>
				</div>
			)}
			{/* Monthly Stats */}
			{dashboardStats && (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Hoa hồng tháng {dashboardStats.month}/{dashboardStats.year}
							</CardTitle>
							<DollarSign className="h-4 w-4 text-primary" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-primary">
								+{formatCurrency(dashboardStats.adminCommission)}
							</div>
							<p className="text-xs text-muted-foreground">
								2% từ doanh thu {formatCurrency(dashboardStats.monthlyRevenue)}
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Đơn hàng tháng này
							</CardTitle>
							<Package className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{dashboardStats.totalOrdersThisMonth}
							</div>
							<p className="text-xs text-muted-foreground">
								Đơn hàng hoàn thành
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Doanh thu tháng này
							</CardTitle>
							<TrendingUp className="h-4 w-4 text-green-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{formatCurrency(dashboardStats.monthlyRevenue)}
							</div>
							<p className="text-xs text-muted-foreground">
								Tổng doanh thu các vendor
							</p>
						</CardContent>
					</Card>
				</div>
			)}
			{/* System Money Explanation */}
			{dashboardStats && dashboardStats.systemMoney > 0 && (
				<Card className="border-blue-200 bg-blue-50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-blue-800">
							<Wallet className="h-5 w-5" />
							Thông tin tiền trong hệ thống
						</CardTitle>
					</CardHeader>
					<CardContent className="text-blue-700">
						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<p className="text-sm mb-2">
									<strong>Tiền admin đang nắm giữ:</strong>{' '}
									{formatCurrency(dashboardStats.systemMoney)}
								</p>
								<p className="text-xs text-blue-600">
									• Từ các đơn hàng QR Code đã thanh toán
									<br />
									• Sẽ được trả cho vendor khi tạo bill hàng tháng
									<br />• Không bao gồm tiền từ bill đã tạo
								</p>
							</div>
							<div className="text-xs text-blue-600 bg-blue-100 p-3 rounded">
								<strong>Lưu ý:</strong> Số tiền này giảm khi admin tạo bill
								thanh toán cho vendor. Admin nhận hoa hồng 2% và trả phần còn
								lại cho vendor.
							</div>
						</div>
					</CardContent>
				</Card>
			)}
			{/* Complaint Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Tổng khiếu nại
						</CardTitle>
						<AlertCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{counts.all}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
						<Clock className="h-4 w-4 text-yellow-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{counts.PENDING}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Đang xem xét</CardTitle>
						<AlertCircle className="h-4 w-4 text-blue-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{counts.IN_REVIEW}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Đã giải quyết</CardTitle>
						<CheckCircle className="h-4 w-4 text-green-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{counts.RESOLVED}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Từ chối</CardTitle>
						<X className="h-4 w-4 text-red-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{counts.REJECTED}</div>
					</CardContent>
				</Card>
			</div>
			{/* Complaints Table */}
			<Card>
				<CardHeader>
					<CardTitle>Danh sách khiếu nại</CardTitle>
					<CardDescription>
						Xem và quản lý tất cả khiếu nại từ khách hàng
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs value={selectedTab} onValueChange={setSelectedTab}>
						<TabsList className="grid w-full grid-cols-5">
							<TabsTrigger value="all">Tất cả ({counts.all})</TabsTrigger>
							<TabsTrigger value="PENDING">
								Chờ xử lý ({counts.PENDING})
							</TabsTrigger>
							<TabsTrigger value="IN_REVIEW">
								Đang xem xét ({counts.IN_REVIEW})
							</TabsTrigger>
							<TabsTrigger value="RESOLVED">
								Đã giải quyết ({counts.RESOLVED})
							</TabsTrigger>
							<TabsTrigger value="REJECTED">
								Từ chối ({counts.REJECTED})
							</TabsTrigger>
						</TabsList>

						<div className="mt-6">
							{filterComplaints(selectedTab).length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									Không có khiếu nại nào
								</div>
							) : (
								<div className="space-y-4">
									{filterComplaints(selectedTab).map((complaint) => {
										const config = statusConfig[complaint.status];
										const Icon = config.icon;

										return (
											<Card key={complaint.id} className="p-6">
												<div className="flex items-start justify-between">
													<div className="space-y-2 flex-1">
														<div className="flex items-center gap-2">
															<h3 className="font-semibold">
																{complaint.title}
															</h3>
															<Badge
																variant="secondary"
																className="flex items-center gap-1"
															>
																<Icon className="h-3 w-3" />
																{config.label}
															</Badge>
														</div>
														<p className="text-sm text-muted-foreground">
															{complaint.description}
														</p>
														{complaint.resolution && (
															<div className="bg-muted p-3 rounded-md">
																<p className="text-sm font-medium">
																	Phản hồi từ vendor:
																</p>
																<p className="text-sm">
																	{complaint.resolution}
																</p>
															</div>
														)}
														<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
															<div>
																<span className="font-medium">Khách hàng:</span>{' '}
																{complaint.customer.fullName}
															</div>
															<div>
																<span className="font-medium">Vendor:</span>{' '}
																{complaint.vendor.shopName}
															</div>
															<div>
																<span className="font-medium">Đơn hàng:</span>{' '}
																{(
																	complaint.order.servicePrice +
																	complaint.order.deliveryFee
																).toLocaleString()}
																đ
															</div>
														</div>
														<div className="text-xs text-muted-foreground">
															Tạo lúc:{' '}
															{new Date(complaint.createdAt).toLocaleString(
																'vi-VN',
															)}
														</div>
													</div>

													{complaint.status === 'IN_REVIEW' && (
														<div className="flex gap-2 ml-4">
															<Button
																size="sm"
																variant="outline"
																className="text-green-600 hover:text-green-700"
																onClick={() =>
																	handleComplaintAction(
																		complaint.id,
																		'RESOLVED',
																	)
																}
															>
																<CheckCircle className="h-4 w-4 mr-1" />
																Giải quyết
															</Button>
															<Button
																size="sm"
																variant="outline"
																className="text-red-600 hover:text-red-700"
																onClick={() =>
																	handleComplaintAction(
																		complaint.id,
																		'REJECTED',
																	)
																}
															>
																<X className="h-4 w-4 mr-1" />
																Từ chối
															</Button>
														</div>
													)}
												</div>
											</Card>
										);
									})}
								</div>
							)}
						</div>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
