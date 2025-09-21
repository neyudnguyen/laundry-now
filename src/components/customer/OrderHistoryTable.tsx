'use client';

import { useState } from 'react';

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

import { OrderDetailDialog } from './OrderDetailDialog';

export interface OrderItem {
	id: string;
	name: string;
	quantity: number;
	unitPrice: number;
}

export interface Order {
	id: string;
	status:
		| 'PENDING'
		| 'ACCEPTED'
		| 'IN_PROGRESS'
		| 'NEED_PAYMENT'
		| 'COMPLETED'
		| 'CANCELLED';
	paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
	paymentMethod: 'COD' | 'QRCODE';
	pickupType: 'HOME' | 'STORE';
	servicePrice: number;
	deliveryFee: number;
	notes?: string;
	createdAt: string;
	items: OrderItem[];
	vendor: {
		shopName: string;
		user: {
			phone: string;
		};
		address?: {
			province: string;
			district: string;
			ward: string;
			street: string;
		};
	};
}

interface OrderHistoryTableProps {
	orders: Order[];
}

const getStatusBadgeVariant = (status: Order['status']) => {
	switch (status) {
		case 'PENDING':
			return 'secondary';
		case 'ACCEPTED':
			return 'default';
		case 'IN_PROGRESS':
			return 'default';
		case 'NEED_PAYMENT':
			return 'destructive';
		case 'COMPLETED':
			return 'default';
		case 'CANCELLED':
			return 'secondary';
		default:
			return 'secondary';
	}
};

const getStatusText = (status: Order['status']) => {
	switch (status) {
		case 'PENDING':
			return 'Chờ tiếp nhận';
		case 'ACCEPTED':
			return 'Đã tiếp nhận';
		case 'IN_PROGRESS':
			return 'Đang giặt';
		case 'NEED_PAYMENT':
			return 'Cần thanh toán';
		case 'COMPLETED':
			return 'Hoàn tất';
		case 'CANCELLED':
			return 'Đã hủy';
		default:
			return status;
	}
};

const getPaymentStatusText = (status: Order['paymentStatus']) => {
	switch (status) {
		case 'PENDING':
			return 'Chờ thanh toán';
		case 'COMPLETED':
			return 'Đã thanh toán';
		case 'FAILED':
			return 'Thất bại';
		default:
			return status;
	}
};

const getPaymentMethodText = (method: Order['paymentMethod']) => {
	switch (method) {
		case 'COD':
			return 'Tiền mặt';
		case 'QRCODE':
			return 'QR Code';
		default:
			return method;
	}
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
		hour: '2-digit',
		minute: '2-digit',
	});
};

export function OrderHistoryTable({ orders }: OrderHistoryTableProps) {
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

	if (orders.length === 0) {
		return (
			<Card>
				<CardContent className="flex items-center justify-center py-12">
					<p className="text-muted-foreground">Bạn chưa có đơn hàng nào.</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>Lịch sử đơn hàng</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Mã đơn hàng</TableHead>
								<TableHead>Cửa hàng</TableHead>
								<TableHead>Trạng thái</TableHead>
								<TableHead>Thanh toán</TableHead>
								<TableHead>Tổng tiền</TableHead>
								<TableHead>Ngày tạo</TableHead>
								<TableHead>Hành động</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{orders.map((order) => (
								<TableRow key={order.id}>
									<TableCell className="font-medium">
										#{order.id.slice(-8)}
									</TableCell>
									<TableCell>{order.vendor.shopName}</TableCell>
									<TableCell>
										<Badge variant={getStatusBadgeVariant(order.status)}>
											{getStatusText(order.status)}
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex flex-col gap-1">
											<Badge
												variant={
													order.paymentStatus === 'COMPLETED'
														? 'default'
														: 'secondary'
												}
												className="w-fit"
											>
												{getPaymentStatusText(order.paymentStatus)}
											</Badge>
											<span className="text-xs text-muted-foreground">
												{getPaymentMethodText(order.paymentMethod)}
											</span>
										</div>
									</TableCell>
									<TableCell className="font-medium">
										{formatCurrency(order.servicePrice + order.deliveryFee)}
									</TableCell>
									<TableCell>{formatDate(order.createdAt)}</TableCell>
									<TableCell>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setSelectedOrder(order)}
										>
											Xem chi tiết
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{selectedOrder && (
				<OrderDetailDialog
					order={selectedOrder}
					open={!!selectedOrder}
					onOpenChange={(open: boolean) => !open && setSelectedOrder(null)}
				/>
			)}
		</>
	);
}
