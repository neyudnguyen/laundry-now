'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/ui/star-rating';

import { Order } from './OrderHistoryTable';

interface OrderDetailDialogProps {
	order: Order;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

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

const getPickupTypeText = (type: Order['pickupType']) => {
	switch (type) {
		case 'HOME':
			return 'Đón tại nhà';
		case 'STORE':
			return 'Đón tại cửa hàng';
		default:
			return type;
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

export function OrderDetailDialog({
	order,
	open,
	onOpenChange,
}: OrderDetailDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Chi tiết đơn hàng #{order.id.slice(-8)}</DialogTitle>
				</DialogHeader>

				<div className="space-y-4">
					{/* Thông tin cơ bản */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Thông tin đơn hàng</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">Trạng thái:</span>
								<Badge variant="outline">{getStatusText(order.status)}</Badge>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">Thanh toán:</span>
								<div className="flex items-center gap-2">
									<Badge
										variant={
											order.paymentStatus === 'COMPLETED'
												? 'default'
												: 'secondary'
										}
									>
										{getPaymentStatusText(order.paymentStatus)}
									</Badge>
									<span className="text-xs text-muted-foreground">
										({getPaymentMethodText(order.paymentMethod)})
									</span>
								</div>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">Hình thức đón:</span>
								<span className="text-sm">
									{getPickupTypeText(order.pickupType)}
								</span>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">Ngày tạo:</span>
								<span className="text-sm">{formatDate(order.createdAt)}</span>
							</div>

							{order.notes && (
								<div className="flex justify-between items-start">
									<span className="text-sm font-medium">Ghi chú:</span>
									<span className="text-sm text-right max-w-xs">
										{order.notes}
									</span>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Thông tin cửa hàng */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Thông tin cửa hàng</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">Tên cửa hàng:</span>
								<span className="text-sm">{order.vendor.shopName}</span>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">Số điện thoại:</span>
								<span className="text-sm">{order.vendor.user.phone}</span>
							</div>

							{order.vendor.address && (
								<div className="flex justify-between items-start">
									<span className="text-sm font-medium">Địa chỉ:</span>
									<span className="text-sm text-right max-w-xs">
										{order.vendor.address.street}, {order.vendor.address.ward},{' '}
										{order.vendor.address.district},{' '}
										{order.vendor.address.province}
									</span>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Danh sách dịch vụ */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Danh sách dịch vụ</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{order.items.map((item) => (
									<div
										key={item.id}
										className="flex justify-between items-center p-3 border rounded-lg"
									>
										<div className="flex-1">
											<p className="font-medium">{item.name}</p>
											<p className="text-sm text-muted-foreground">
												{item.quantity} kg × {formatCurrency(item.unitPrice)}
											</p>
										</div>
										<div className="text-right">
											<p className="font-medium">
												{formatCurrency(item.quantity * item.unitPrice)}
											</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Tính toán chi phí */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Chi phí</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm">Tiền dịch vụ:</span>
								<span className="text-sm">
									{formatCurrency(order.servicePrice)}
								</span>
							</div>

							<div className="flex justify-between items-center">
								<span className="text-sm">Phí giao hàng:</span>
								<span className="text-sm">
									{formatCurrency(order.deliveryFee)}
								</span>
							</div>

							<Separator />

							<div className="flex justify-between items-center">
								<span className="font-medium">Tổng cộng:</span>
								<span className="font-bold text-lg">
									{formatCurrency(order.servicePrice + order.deliveryFee)}
								</span>
							</div>
						</CardContent>
					</Card>

					{/* Đánh giá (nếu có) */}
					{order.review && (
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Đánh giá của bạn</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-sm font-medium">Điểm đánh giá:</span>
									<StarRating value={order.review.rating} readonly size="sm" />
								</div>

								{order.review.comment && (
									<div className="space-y-2">
										<span className="text-sm font-medium">Nhận xét:</span>
										<p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
											{order.review.comment}
										</p>
									</div>
								)}

								<div className="flex justify-between items-center">
									<span className="text-sm font-medium">Ngày đánh giá:</span>
									<span className="text-sm">
										{formatDate(order.review.createdAt)}
									</span>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
