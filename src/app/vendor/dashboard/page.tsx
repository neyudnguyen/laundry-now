'use client';

import {
	AlertCircle,
	Bell,
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	MessageSquare,
	Package,
	ShoppingBag,
	TrendingUp,
	Users,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

export default function VendorDashboard() {
	// Mock data for vendor dashboard (in real app, this would come from API)
	const dashboardStats = {
		totalOrders: 127,
		activeOrders: 8,
		monthlyRevenue: 15750000, // VND
		monthlyCommission: 315000, // 2% of revenue
		completedOrders: 119,
		pendingComplaints: 2,
	};

	const recentOrders = [
		{
			id: 'VN001',
			customerPhone: '0901234567',
			status: 'Chờ tiếp nhận',
			items: ['Áo sơ mi x5', 'Quần tây x3'],
			createdAt: '2025-09-18',
			estimatedCompletion: '2025-09-20',
			total: 250000,
			commission: 5000,
		},
		{
			id: 'VN002',
			customerPhone: '0987654321',
			status: 'Đang giặt',
			items: ['Váy dạ hội x2', 'Áo khoác x1'],
			createdAt: '2025-09-17',
			estimatedCompletion: '2025-09-19',
			total: 450000,
			commission: 9000,
		},
		{
			id: 'VN003',
			customerPhone: '0912345678',
			status: 'Đã giao',
			items: ['Chăn ga gối x2 bộ', 'Rèm cửa x1'],
			createdAt: '2025-09-15',
			estimatedCompletion: '2025-09-17',
			total: 350000,
			commission: 7000,
		},
		{
			id: 'VN004',
			customerPhone: '0923456789',
			status: 'Hoàn tất',
			items: ['Đồ công sở x10 món'],
			createdAt: '2025-09-14',
			estimatedCompletion: '2025-09-16',
			total: 500000,
			commission: 10000,
		},
	];

	const notifications = [
		{
			id: '1',
			message: 'Bạn có đơn hàng mới #VN001 từ khách hàng 0901234567',
			time: '15 phút trước',
			type: 'new_order',
		},
		{
			id: '2',
			message: 'Đơn hàng #VN004 đã được khách hàng xác nhận hoàn tất',
			time: '2 giờ trước',
			type: 'completed',
		},
		{
			id: '3',
			message: 'Bạn đã nhận được thanh toán 350.000đ cho đơn hàng #VN003',
			time: '5 giờ trước',
			type: 'payment',
		},
		{
			id: '4',
			message: 'Khách hàng 0987654321 gửi khiếu nại cho đơn hàng #VN002',
			time: '1 ngày trước',
			type: 'complaint',
		},
	];

	const monthlyStats = [
		{ month: 'T1', revenue: 12500000, orders: 95 },
		{ month: 'T2', revenue: 14200000, orders: 108 },
		{ month: 'T3', revenue: 13800000, orders: 102 },
		{ month: 'T4', revenue: 15750000, orders: 127 },
	];

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'Chờ tiếp nhận':
				return <Badge variant="secondary">{status}</Badge>;
			case 'Đã tiếp nhận':
				return <Badge variant="default">{status}</Badge>;
			case 'Đang giặt':
				return <Badge variant="default">{status}</Badge>;
			case 'Đã giao':
				return <Badge variant="secondary">{status}</Badge>;
			case 'Chờ thanh toán':
				return <Badge variant="destructive">{status}</Badge>;
			case 'Hoàn tất':
				return <Badge variant="secondary">{status}</Badge>;
			case 'Đơn hủy':
				return <Badge variant="outline">{status}</Badge>;
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case 'new_order':
				return <Package className="h-4 w-4" />;
			case 'completed':
				return <CheckCircle className="h-4 w-4" />;
			case 'payment':
				return <DollarSign className="h-4 w-4" />;
			case 'complaint':
				return <MessageSquare className="h-4 w-4" />;
			default:
				return <Bell className="h-4 w-4" />;
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
			{/* Welcome Message */}
			<Card className="bg-primary text-primary-foreground">
				<CardContent className="p-6">
					<h1 className="text-2xl font-bold mb-2">
						Chào mừng đến với Dashboard Nhà cung cấp!
					</h1>
					<p className="opacity-90">
						Quản lý đơn hàng, theo dõi doanh thu và phát triển cửa hàng của bạn.
					</p>
				</CardContent>
			</Card>

			{/* Dashboard Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
						<ShoppingBag className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{dashboardStats.totalOrders}
						</div>
						<p className="text-xs text-muted-foreground">Tất cả thời gian</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{dashboardStats.activeOrders}
						</div>
						<p className="text-xs text-muted-foreground">Đơn hàng đang xử lý</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Doanh thu tháng
						</CardTitle>
						<TrendingUp className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(dashboardStats.monthlyRevenue)}
						</div>
						<p className="text-xs text-muted-foreground">Tháng 9/2025</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Hoa hồng (2%)</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(dashboardStats.monthlyCommission)}
						</div>
						<p className="text-xs text-muted-foreground">Từ doanh thu tháng</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Hoàn tất</CardTitle>
						<CheckCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{dashboardStats.completedOrders}
						</div>
						<p className="text-xs text-muted-foreground">Đơn hàng hoàn tất</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Khiếu nại</CardTitle>
						<AlertCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{dashboardStats.pendingComplaints}
						</div>
						<p className="text-xs text-muted-foreground">Cần xử lý</p>
					</CardContent>
				</Card>
			</div>

			{/* Recent Orders and Notifications */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Recent Orders */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ShoppingBag className="h-5 w-5" />
							Đơn hàng gần đây
						</CardTitle>
						<CardDescription>4 đơn hàng mới nhất cần theo dõi</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{recentOrders.map((order) => (
							<div
								key={order.id}
								className="flex items-start justify-between p-4 border rounded-lg"
							>
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<span className="font-medium">#{order.id}</span>
										{getStatusBadge(order.status)}
									</div>
									<div className="text-sm text-muted-foreground">
										<div>KH: {order.customerPhone}</div>
										<div>{order.items.join(', ')}</div>
									</div>
									<div className="flex items-center gap-4 text-xs text-muted-foreground">
										<span className="flex items-center gap-1">
											<Calendar className="h-3 w-3" />
											{order.createdAt}
										</span>
										<span className="flex items-center gap-1">
											<Clock className="h-3 w-3" />
											Dự kiến: {order.estimatedCompletion}
										</span>
									</div>
								</div>
								<div className="text-right">
									<div className="font-semibold">
										{formatCurrency(order.total)}
									</div>
									<div className="text-sm text-muted-foreground">
										HH: {formatCurrency(order.commission)}
									</div>
									<Button variant="outline" size="sm" className="mt-2">
										Xử lý
									</Button>
								</div>
							</div>
						))}
						<Button variant="outline" className="w-full">
							Xem tất cả đơn hàng
						</Button>
					</CardContent>
				</Card>

				{/* Notifications */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Bell className="h-5 w-5" />
							Thông báo
						</CardTitle>
						<CardDescription>
							Cập nhật mới nhất về hoạt động cửa hàng
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{notifications.map((notification) => (
							<div key={notification.id} className="p-4 border rounded-lg">
								<div className="flex items-start gap-3">
									{getNotificationIcon(notification.type)}
									<div className="flex-1">
										<p className="text-sm">{notification.message}</p>
										<p className="text-xs text-muted-foreground mt-1">
											{notification.time}
										</p>
									</div>
								</div>
							</div>
						))}
						<Button variant="outline" className="w-full">
							Xem tất cả thông báo
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Monthly Performance */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						Hiệu suất theo tháng
					</CardTitle>
					<CardDescription>
						Doanh thu và số lượng đơn hàng 4 tháng gần đây
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{monthlyStats.map((stat) => (
							<div
								key={stat.month}
								className="text-center p-4 border rounded-lg"
							>
								<div className="text-lg font-bold">{stat.month}</div>
								<div className="text-sm font-medium">
									{formatCurrency(stat.revenue)}
								</div>
								<div className="text-xs text-muted-foreground">
									{stat.orders} đơn hàng
								</div>
								<div className="text-xs text-muted-foreground">
									HH: {formatCurrency(stat.revenue * 0.02)}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Thao tác nhanh</CardTitle>
					<CardDescription>
						Các hành động quản lý cửa hàng thường dùng
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-4">
						<Button className="flex items-center gap-2">
							<Package className="h-4 w-4" />
							Xử lý đơn hàng mới
						</Button>
						<Button variant="outline" className="flex items-center gap-2">
							<TrendingUp className="h-4 w-4" />
							Xem báo cáo doanh thu
						</Button>
						<Button variant="outline" className="flex items-center gap-2">
							<MessageSquare className="h-4 w-4" />
							Trả lời khiếu nại
						</Button>
						<Button variant="outline" className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							Quản lý khách hàng
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
