'use client';

import { QrCode } from 'lucide-react';
import { useEffect, useState } from 'react';

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

import { ComplaintDialog } from './ComplaintDialog';
import { OrderDetailDialog } from './OrderDetailDialog';
import PaymentDialog from './PaymentDialog';
import { ReviewDialog } from './ReviewDialog';

export interface OrderItem {
	id: string;
	name: string;
	quantity: number;
	unitPrice: number;
}

export interface Order {
	id: string;
	status:
		| 'PENDING_CONFIRMATION'
		| 'CONFIRMED'
		| 'PICKED_UP'
		| 'IN_WASHING'
		| 'PAYMENT_REQUIRED'
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
	review?: {
		id: string;
		rating: number;
		comment: string | null;
		createdAt: string;
	} | null;
	complaint?: {
		id: string;
		title: string;
		status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';
		createdAt: string;
	} | null;
}

interface OrderHistoryTableProps {
	orders: Order[];
}

const getStatusBadgeVariant = (status: Order['status']) => {
	switch (status) {
		case 'PENDING_CONFIRMATION':
			return 'secondary';
		case 'CONFIRMED':
			return 'default';
		case 'PICKED_UP':
			return 'default';
		case 'IN_WASHING':
			return 'default';
		case 'PAYMENT_REQUIRED':
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
		case 'PENDING_CONFIRMATION':
			return 'Chờ xác nhận';
		case 'CONFIRMED':
			return 'Đã xác nhận';
		case 'PICKED_UP':
			return 'Đã lấy đồ';
		case 'IN_WASHING':
			return 'Đang giặt';
		case 'PAYMENT_REQUIRED':
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
	const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
	const [complaintOrder, setComplaintOrder] = useState<Order | null>(null);
	const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
	const [orderList, setOrderList] = useState<Order[]>(orders);

	useEffect(() => {
		setOrderList(orders);
	}, [orders]);

	const handleReviewSubmitted = () => {
		// Refresh orders to update review status
		window.location.reload();
	};

	const handleComplaintSubmitted = () => {
		// Refresh orders to update complaint status
		window.location.reload();
	};

	const handlePaymentSuccess = () => {
		// Refresh orders to update payment status
		window.location.reload();
	};

	if (orderList.length === 0) {
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
							{orderList.map((order) => (
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
										<div className="flex flex-wrap gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() => setSelectedOrder(order)}
											>
												Xem chi tiết
											</Button>
											{order.status === 'PAYMENT_REQUIRED' &&
												order.paymentMethod === 'QRCODE' &&
												order.paymentStatus === 'PENDING' && (
													<Button
														variant="default"
														size="sm"
														onClick={() => setPaymentOrder(order)}
													>
														<QrCode className="h-4 w-4 mr-1" />
														Thanh toán
													</Button>
												)}
											{order.status === 'COMPLETED' && !order.review && (
												<Button
													variant="default"
													size="sm"
													onClick={() => setReviewOrder(order)}
												>
													Đánh giá
												</Button>
											)}
											{order.status === 'COMPLETED' && !order.complaint && (
												<Button
													variant="destructive"
													size="sm"
													onClick={() => setComplaintOrder(order)}
												>
													Khiếu nại
												</Button>
											)}
										</div>
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

			{reviewOrder && (
				<ReviewDialog
					orderId={reviewOrder.id}
					vendorName={reviewOrder.vendor.shopName}
					isOpen={!!reviewOrder}
					onClose={() => setReviewOrder(null)}
					onReviewSubmitted={handleReviewSubmitted}
				/>
			)}

			{complaintOrder && (
				<ComplaintDialog
					orderId={complaintOrder.id}
					vendorName={complaintOrder.vendor.shopName}
					isOpen={!!complaintOrder}
					onClose={() => setComplaintOrder(null)}
					onComplaintSubmitted={handleComplaintSubmitted}
				/>
			)}

			{paymentOrder && (
				<PaymentDialog
					isOpen={!!paymentOrder}
					onClose={() => setPaymentOrder(null)}
					orderId={paymentOrder.id}
					orderAmount={paymentOrder.servicePrice + paymentOrder.deliveryFee}
					onPaymentSuccess={handlePaymentSuccess}
				/>
			)}
		</>
	);
}
