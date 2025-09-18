'use client';

import {
	AlertCircle,
	Bell,
	Calendar,
	CheckCircle,
	Clock,
	ShoppingBag,
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

export default function CustomerDashboard() {
	// Mock data for dashboard (in real app, this would come from API)
	const dashboardStats = {
		activeOrders: 2,
		pendingPayment: 1,
		completedOrders: 15,
		totalSpent: 2450000, // VND
	};

	const recentOrders = [
		{
			id: '1',
			status: 'Đang giặt',
			items: ['Áo sơ mi x3', 'Quần tây x2'],
			createdAt: '2025-09-16',
			estimatedCompletion: '2025-09-18',
			total: 150000,
		},
		{
			id: '2',
			status: 'Chờ thanh toán',
			items: ['Váy dạ hội x1', 'Áo khoác x1'],
			createdAt: '2025-09-15',
			estimatedCompletion: '2025-09-17',
			total: 300000,
		},
		{
			id: '3',
			status: 'Hoàn tất',
			items: ['Chăn ga gối x1 bộ'],
			createdAt: '2025-09-10',
			estimatedCompletion: '2025-09-12',
			total: 200000,
		},
	];

	const notifications = [
		{
			id: '1',
			message: 'Đơn hàng #1 đã hoàn tất, sẵn sàng để giao!',
			time: '30 phút trước',
			type: 'success',
		},
		{
			id: '2',
			message: 'Đơn hàng #2 cần thanh toán trong 24h',
			time: '2 giờ trước',
			type: 'warning',
		},
		{
			id: '3',
			message: 'Chúc mừng! Bạn đã tích lũy được 100 điểm thưởng',
			time: '1 ngày trước',
			type: 'info',
		},
	];

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'Chờ tiếp nhận':
				return <Badge variant="secondary">{status}</Badge>;
			case 'Đã tiếp nhận':
				return <Badge variant="default">{status}</Badge>;
			case 'Đang giặt':
				return (
					<Badge variant="default" className="bg-blue-500">
						{status}
					</Badge>
				);
			case 'Đã giao':
				return (
					<Badge variant="default" className="bg-green-500">
						{status}
					</Badge>
				);
			case 'Chờ thanh toán':
				return <Badge variant="destructive">{status}</Badge>;
			case 'Hoàn tất':
				return (
					<Badge variant="default" className="bg-emerald-500">
						{status}
					</Badge>
				);
			case 'Đơn hàng hủy':
				return <Badge variant="outline">{status}</Badge>;
			default:
				return <Badge variant="secondary">{status}</Badge>;
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
			<div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
				<h1 className="text-2xl font-bold mb-2">Chào mừng trở lại!</h1>
				<p className="text-blue-100">
					Quản lý đơn giặt ủi của bạn một cách dễ dàng và hiệu quả.
				</p>
			</div>

			{/* Dashboard Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Đơn hàng đang xử lý
						</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{dashboardStats.activeOrders}
						</div>
						<p className="text-xs text-muted-foreground">Đang được xử lý</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Chờ thanh toán
						</CardTitle>
						<AlertCircle className="h-4 w-4 text-red-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">
							{dashboardStats.pendingPayment}
						</div>
						<p className="text-xs text-muted-foreground">Cần thanh toán ngay</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Đơn hàng hoàn tất
						</CardTitle>
						<CheckCircle className="h-4 w-4 text-green-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{dashboardStats.completedOrders}
						</div>
						<p className="text-xs text-muted-foreground">
							Tổng số đơn đã hoàn tất
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Tổng chi tiêu</CardTitle>
						<ShoppingBag className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{formatCurrency(dashboardStats.totalSpent)}
						</div>
						<p className="text-xs text-muted-foreground">Tất cả thời gian</p>
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
						<CardDescription>3 đơn hàng mới nhất của bạn</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{recentOrders.map((order) => (
							<div
								key={order.id}
								className="flex items-start justify-between p-4 border rounded-lg"
							>
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<span className="font-medium">Đơn hàng #{order.id}</span>
										{getStatusBadge(order.status)}
									</div>
									<div className="text-sm text-muted-foreground">
										{order.items.join(', ')}
									</div>
									<div className="flex items-center gap-4 text-xs text-muted-foreground">
										<span className="flex items-center gap-1">
											<Calendar className="h-3 w-3" />
											Tạo: {order.createdAt}
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
									<Button variant="outline" size="sm" className="mt-2">
										Xem chi tiết
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
							Cập nhật mới nhất về đơn hàng của bạn
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{notifications.map((notification) => (
							<div key={notification.id} className="p-4 border rounded-lg">
								<div className="flex items-start gap-3">
									<div
										className={`h-2 w-2 rounded-full mt-2 ${
											notification.type === 'success'
												? 'bg-green-500'
												: notification.type === 'warning'
													? 'bg-yellow-500'
													: 'bg-blue-500'
										}`}
									/>
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

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Thao tác nhanh</CardTitle>
					<CardDescription>Các hành động thường sử dụng</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-4">
						<Button className="flex items-center gap-2">
							<ShoppingBag className="h-4 w-4" />
							Tạo đơn hàng mới
						</Button>
						<Button variant="outline" className="flex items-center gap-2">
							<Clock className="h-4 w-4" />
							Theo dõi đơn hàng
						</Button>
						<Button variant="outline" className="flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							Đặt lịch thu gom
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
