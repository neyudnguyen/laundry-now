'use client';

import { useEffect, useMemo, useState } from 'react';

import {
	Order,
	OrderHistoryTable,
} from '@/components/customer/OrderHistoryTable';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const CustomerOrderHistoryPage = () => {
	const [orders, setOrders] = useState<Order[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				setIsLoading(true);
				const response = await fetch('/api/customer/orders');

				if (!response.ok) {
					throw new Error('Không thể tải danh sách đơn hàng');
				}

				const data = await response.json();
				setOrders(data.orders || []);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
			} finally {
				setIsLoading(false);
			}
		};

		fetchOrders();
	}, []);

	if (isLoading) {
		return (
			<div className="container mx-auto py-8">
				<Card>
					<CardContent className="flex items-center justify-center py-12">
						<p>Đang tải danh sách đơn hàng...</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto py-8">
				<Card>
					<CardContent className="flex items-center justify-center py-12">
						<p className="text-destructive">{error}</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 space-y-6">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Lịch sử đơn hàng</h1>
				<p className="text-muted-foreground">
					Xem lại tất cả các đơn hàng bạn đã đặt
				</p>
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
						<OrderHistoryTable orders={getOrdersByStatus(tab.value)} />
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
};

export default CustomerOrderHistoryPage;
