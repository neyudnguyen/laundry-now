'use client';

import { useEffect, useState } from 'react';

import {
	Order,
	OrderHistoryTable,
} from '@/components/customer/OrderHistoryTable';
import { Card, CardContent } from '@/components/ui/card';

const CustomerOrderHistoryPage = () => {
	const [orders, setOrders] = useState<Order[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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
		<div className="container mx-auto py-8">
			<div className="mb-6">
				<h1 className="text-2xl font-bold">Lịch sử đơn hàng</h1>
				<p className="text-muted-foreground">
					Xem lại tất cả các đơn hàng bạn đã đặt
				</p>
			</div>

			<OrderHistoryTable orders={orders} />
		</div>
	);
};

export default CustomerOrderHistoryPage;
