'use client';

import { Eye, RefreshCw, Star } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrderDetailDialog from '@/components/vendor/OrderDetailDialog';
import { useToast } from '@/hooks';

// Định nghĩa các status và nhãn tiếng Việt
const statusTabs = [
	{ value: 'ALL', label: 'Tất cả' },
	{ value: 'PENDING_CONFIRMATION', label: 'Chờ xác nhận' },
	{ value: 'CONFIRMED', label: 'Đã xác nhận' },
	{ value: 'PICKED_UP', label: 'Đã lấy đồ' },
	{ value: 'IN_WASHING', label: 'Đang giặt' },
	{ value: 'PAYMENT_REQUIRED', label: 'Cần thanh toán' },
	{ value: 'COMPLETED', label: 'Hoàn tất' },
	{ value: 'CANCELLED', label: 'Đã hủy' },
];

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
	review?: {
		id: string;
		rating: number;
		comment: string | null;
		createdAt: string;
	} | null;
}

const statusLabels = {
	PENDING_CONFIRMATION: 'Chờ xác nhận',
	CONFIRMED: 'Đã xác nhận',
	PICKED_UP: 'Đã lấy đồ',
	IN_WASHING: 'Đang giặt',
	PAYMENT_REQUIRED: 'Cần thanh toán',
	COMPLETED: 'Hoàn tất',
	CANCELLED: 'Đã hủy',
};

const statusVariants = {
	PENDING_CONFIRMATION: 'secondary',
	CONFIRMED: 'default',
	PICKED_UP: 'default',
	IN_WASHING: 'outline',
	PAYMENT_REQUIRED: 'destructive',
	COMPLETED: 'default',
	CANCELLED: 'secondary',
} as const;

const paymentMethodLabels = {
	COD: 'Tiền mặt',
	QRCODE: 'Quét mã QR',
};

const pickupTypeLabels = {
	HOME: 'Giao tại nhà',
	STORE: 'Giao tại cửa hàng',
};

export default function VendorOrders() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [showOrderDetail, setShowOrderDetail] = useState(false);
	const { toast } = useToast();

	// Tính số lượng đơn hàng cho mỗi status
	const tabsWithCount = useMemo(() => {
		return statusTabs.map((tab) => ({
			...tab,
			count:
				tab.value === 'ALL'
					? orders.length
					: orders.filter((order) => order.status === tab.value).length,
		}));
	}, [orders]);

	// Lọc đơn hàng theo status
	const getOrdersByStatus = (status: string) => {
		if (status === 'ALL') return orders;
		return orders.filter((order) => order.status === status);
	};

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

	// Component bảng đơn hàng riêng để tái sử dụng
	const OrderTable = ({ orders: orderList }: { orders: Order[] }) => {
		if (orderList.length === 0) {
			return (
				<Card>
					<CardContent className="py-12">
						<div className="text-center">
							<p className="text-muted-foreground">Không có đơn hàng nào</p>
						</div>
					</CardContent>
				</Card>
			);
		}

		return (
			<Card>
				<CardHeader>
					<CardTitle>Danh sách đơn hàng ({orderList.length})</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Thời gian</TableHead>
								<TableHead>Khách hàng</TableHead>
								<TableHead>Trạng thái</TableHead>
								<TableHead>Loại thanh toán</TableHead>
								<TableHead>Giao hàng</TableHead>
								<TableHead>Đánh giá</TableHead>
								<TableHead>Tổng tiền</TableHead>
								<TableHead>Thao tác</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{orderList.map((order) => (
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
											{statusLabels[order.status as keyof typeof statusLabels]}
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
									<TableCell>
										{order.review ? (
											<div className="flex items-center gap-2">
												<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
												<span className="text-sm">{order.review.rating}/5</span>
											</div>
										) : order.status === 'COMPLETED' ? (
											<span className="text-xs text-muted-foreground">
												Chưa đánh giá
											</span>
										) : (
											<span className="text-xs text-muted-foreground">-</span>
										)}
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
		);
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

			<Tabs defaultValue="ALL" className="w-full">
				<div className="overflow-x-auto mb-6">
					<TabsList className="grid w-full min-w-max grid-cols-8 lg:grid-cols-8 h-auto">
						{tabsWithCount.map((tab) => (
							<TabsTrigger
								key={tab.value}
								value={tab.value}
								className="flex flex-col items-center gap-1 h-auto py-3 px-2 text-xs lg:text-sm whitespace-nowrap min-h-[60px] lg:min-h-[70px]"
							>
								<span className="truncate max-w-[80px] lg:max-w-none leading-tight">
									{tab.label}
								</span>
								<Badge
									variant="secondary"
									className="text-xs min-w-[20px] shrink-0"
								>
									{tab.count}
								</Badge>
							</TabsTrigger>
						))}
					</TabsList>
				</div>

				{tabsWithCount.map((tab) => (
					<TabsContent key={tab.value} value={tab.value} className="mt-6">
						<OrderTable orders={getOrdersByStatus(tab.value)} />
					</TabsContent>
				))}
			</Tabs>

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
