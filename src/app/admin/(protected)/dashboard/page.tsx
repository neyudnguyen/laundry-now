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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

export default function AdminDashboard() {
	const [complaints, setComplaints] = useState<Complaint[]>([]);
	const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
		null,
	);
	const [loading, setLoading] = useState(true);

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
		</div>
	);
}
