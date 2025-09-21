'use client';

import { Eye, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import OrderDetailDialog from '@/components/vendor/OrderDetailDialog';
import { useToast } from '@/hooks';

interface OrderItem {
	id: string;
	name: string;
	quantity: number;
	unitPrice: number;
}

interface Order {
	id: string;
	status: string;
	paymentStatus: string;
	paymentMethod: string;
	pickupType: string;
	servicePrice: number;
	deliveryFee: number;
	notes?: string;
	createdAt: string;
	customer: {
		fullName: string;
		user: {
			phone: string;
		};
	};
	items: OrderItem[];
}

const statusLabels = {
	PENDING: 'Chờ tiếp nhận',
	ACCEPTED: 'Đã tiếp nhận',
	IN_PROGRESS: 'Đang giặt',
	NEED_PAYMENT: 'Cần thanh toán',
	COMPLETED: 'Hoàn tất',
	CANCELLED: 'Đã hủy',
};

const statusVariants = {
	PENDING: 'secondary',
	ACCEPTED: 'default',
	IN_PROGRESS: 'outline',
	NEED_PAYMENT: 'destructive',
	COMPLETED: 'default',
	CANCELLED: 'secondary',
} as const;

const paymentMethodLabels = {
	COD: 'Thanh toán khi nhận',
	QRCODE: 'Quét mã QR',
};

const pickupTypeLabels = {
	HOME: 'Đón tại nhà',
	STORE: 'Đón tại cửa hàng',
};

export default function VendorOrders() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [showOrderDetail, setShowOrderDetail] = useState(false);
	const { toast } = useToast();

	const fetchOrders = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch('/api/vendor/orders');

			if (!response.ok) {
				throw new Error('Failed to fetch orders');
			}

			const data = await response.json();
			setOrders(data.orders);
		} catch (error) {
			console.error('Error fetching orders:', error);
			toast.error('Không thể tải danh sách đơn hàng');
		} finally {
			setLoading(false);
		}
	}, [toast]);

	useEffect(() => {
		fetchOrders();
	}, [fetchOrders]);

	const getTotalAmount = (order: Order) => {
		return order.servicePrice + order.deliveryFee;
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString('vi-VN', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold">Đơn hàng</h1>
					<p className="text-muted-foreground">
						Đang tải danh sách đơn hàng...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold">Đơn hàng</h1>
					<p className="text-muted-foreground">
						Quản lý và theo dõi tất cả đơn hàng từ khách hàng
					</p>
				</div>
				<Button onClick={fetchOrders} variant="outline" size="sm">
					<RefreshCw className="w-4 h-4 mr-2" />
					Làm mới
				</Button>
			</div>

			{orders.length === 0 ? (
				<Card>
					<CardContent className="py-12">
						<div className="text-center">
							<p className="text-muted-foreground">Chưa có đơn hàng nào</p>
						</div>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle>Danh sách đơn hàng ({orders.length})</CardTitle>
					</CardHeader>
					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Thời gian</TableHead>
									<TableHead>Khách hàng</TableHead>
									<TableHead>Trạng thái</TableHead>
									<TableHead>Loại thanh toán</TableHead>
									<TableHead>Loại đón</TableHead>
									<TableHead>Tổng tiền</TableHead>
									<TableHead>Thao tác</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{orders.map((order) => (
									<TableRow key={order.id}>
										<TableCell>{formatDateTime(order.createdAt)}</TableCell>
										<TableCell>
											<div>
												<div className="font-medium">
													{order.customer.fullName}
												</div>
												<div className="text-sm text-muted-foreground">
													{order.customer.user.phone}
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge
												variant={
													statusVariants[
														order.status as keyof typeof statusVariants
													]
												}
											>
												{
													statusLabels[
														order.status as keyof typeof statusLabels
													]
												}
											</Badge>
										</TableCell>
										<TableCell>
											{
												paymentMethodLabels[
													order.paymentMethod as keyof typeof paymentMethodLabels
												]
											}
										</TableCell>
										<TableCell>
											{
												pickupTypeLabels[
													order.pickupType as keyof typeof pickupTypeLabels
												]
											}
										</TableCell>
										<TableCell className="font-medium">
											{formatCurrency(getTotalAmount(order))}
										</TableCell>
										<TableCell>
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setSelectedOrder(order);
													setShowOrderDetail(true);
												}}
											>
												<Eye className="w-4 h-4 mr-2" />
												Xem chi tiết
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}

			<OrderDetailDialog
				order={selectedOrder}
				isOpen={showOrderDetail}
				onClose={() => {
					setShowOrderDetail(false);
					setSelectedOrder(null);
				}}
				onOrderUpdate={fetchOrders}
			/>
		</div>
	);
}
