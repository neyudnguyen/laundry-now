'use client';

import { Check, Edit, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { StarRating } from '@/components/ui/star-rating';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks';

interface OrderItem {
	id: string;
	name: string;
	quantity: number;
	unitPrice: number;
}

interface VendorServiceFee {
	id: string;
	name: string;
	fee: number;
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

interface OrderDetailDialogProps {
	order: Order | null;
	isOpen: boolean;
	onClose: () => void;
	onOrderUpdate: () => void;
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

const statusActions = {
	PENDING_CONFIRMATION: [
		{ action: 'CONFIRMED', label: 'Xác nhận đơn', variant: 'default' as const },
		{ action: 'CANCELLED', label: 'Hủy đơn', variant: 'destructive' as const },
	],
	CONFIRMED: [
		{
			action: 'PICKED_UP',
			label: 'Đã lấy đồ',
			variant: 'default' as const,
		},
	],
	PICKED_UP: [
		{
			action: 'IN_WASHING',
			label: 'Bắt đầu giặt',
			variant: 'default' as const,
		},
	],
	IN_WASHING: [
		{
			action: 'PAYMENT_REQUIRED',
			label: 'Yêu cầu thanh toán',
			variant: 'default' as const,
		},
	],
	PAYMENT_REQUIRED: [
		{
			action: 'COMPLETED',
			label: 'Hoàn tất đơn hàng',
			variant: 'default' as const,
		},
	],
};

export default function OrderDetailDialog({
	order,
	isOpen,
	onClose,
	onOrderUpdate,
}: OrderDetailDialogProps) {
	const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
	const [editingItem, setEditingItem] = useState<OrderItem | null>(null);
	const [vendorServices, setVendorServices] = useState<VendorServiceFee[]>([]);
	const [newItem, setNewItem] = useState({
		serviceId: '',
		quantity: 0.1,
		unitPrice: 0,
	});
	const [showNewItemForm, setShowNewItemForm] = useState(false);
	const [updating, setUpdating] = useState(false);
	const [addingItem, setAddingItem] = useState(false);
	const [updatingItem, setUpdatingItem] = useState(false);
	const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
	const [orderSettings, setOrderSettings] = useState({
		paymentMethod: '',
		pickupType: '',
		deliveryFee: 0,
		notes: '',
	});
	const { toast } = useToast();

	// Fetch vendor services once when component mounts
	useEffect(() => {
		const fetchVendorServices = async () => {
			try {
				const response = await fetch('/api/vendor/services');
				if (response.ok) {
					const data = await response.json();
					setVendorServices(data.services);
				}
			} catch (error) {
				console.error('Error fetching vendor services:', error);
			}
		};

		fetchVendorServices();
	}, []);

	// Update states when order changes
	useEffect(() => {
		if (order) {
			setOrderItems(order.items);
			setOrderSettings({
				paymentMethod: order.paymentMethod,
				pickupType: order.pickupType,
				deliveryFee: order.deliveryFee,
				notes: order.notes || '',
			});
		}
	}, [order]);

	const updateOrderStatus = async (newStatus: string) => {
		if (!order) return;

		try {
			setUpdating(true);
			const response = await fetch(`/api/vendor/orders/${order.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to update order');
			}

			toast.success('Cập nhật trạng thái thành công');
			onOrderUpdate();
			onClose();
		} catch (error) {
			console.error('Error updating order status:', error);
			toast.error(
				error instanceof Error
					? error.message
					: 'Không thể cập nhật trạng thái',
			);
		} finally {
			setUpdating(false);
		}
	};

	const updateOrderSettings = async () => {
		if (!order) return;

		try {
			setUpdating(true);
			const response = await fetch(`/api/vendor/orders/${order.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					paymentMethod: orderSettings.paymentMethod,
					pickupType: orderSettings.pickupType,
					deliveryFee: orderSettings.deliveryFee,
					notes: orderSettings.notes,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to update order settings');
			}

			toast.success('Cập nhật thông tin đơn hàng thành công');
		} catch (error) {
			console.error('Error updating order settings:', error);
			toast.error('Không thể cập nhật thông tin đơn hàng');
		} finally {
			setUpdating(false);
		}
	};

	const addOrderItem = async () => {
		if (!order || !newItem.serviceId || newItem.quantity <= 0) {
			toast.error('Vui lòng chọn dịch vụ và nhập số kg hợp lệ');
			return;
		}

		// Tìm service được chọn để lấy tên và giá
		const selectedService = vendorServices.find(
			(s) => s.id === newItem.serviceId,
		);
		if (!selectedService) {
			toast.error('Dịch vụ không hợp lệ');
			return;
		}

		// Validate quantity (1 decimal place)
		const roundedQuantity = Math.round(newItem.quantity * 10) / 10;
		if (roundedQuantity !== newItem.quantity) {
			toast.error('Số kg chỉ được phép 1 chữ số thập phân (ví dụ: 0.5, 1.2)');
			return;
		}

		try {
			setAddingItem(true);
			const response = await fetch(`/api/vendor/orders/${order.id}/items`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: selectedService.name,
					quantity: roundedQuantity,
					unitPrice: selectedService.fee,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to add item');
			}

			const data = await response.json();
			setOrderItems([...orderItems, data.item]);
			setNewItem({ serviceId: '', quantity: 0.1, unitPrice: 0 });
			setShowNewItemForm(false);
			toast.success('Thêm dịch vụ thành công');
		} catch (error) {
			console.error('Error adding order item:', error);
			toast.error('Không thể thêm dịch vụ');
		} finally {
			setAddingItem(false);
		}
	};

	const updateOrderItem = async () => {
		if (!order || !editingItem) return;

		try {
			setUpdatingItem(true);
			const response = await fetch(
				`/api/vendor/orders/${order.id}/items/${editingItem.id}`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						name: editingItem.name,
						quantity: editingItem.quantity,
						unitPrice: editingItem.unitPrice,
					}),
				},
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to update item');
			}

			const data = await response.json();
			setOrderItems(
				orderItems.map((item) =>
					item.id === editingItem.id ? data.item : item,
				),
			);
			setEditingItem(null);
			toast.success('Cập nhật dịch vụ thành công');
		} catch (error) {
			console.error('Error updating order item:', error);
			toast.error('Không thể cập nhật dịch vụ');
		} finally {
			setUpdatingItem(false);
		}
	};

	const deleteOrderItem = async (itemId: string) => {
		if (!order) return;

		try {
			setDeletingItemId(itemId);
			const response = await fetch(
				`/api/vendor/orders/${order.id}/items/${itemId}`,
				{
					method: 'DELETE',
				},
			);

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to delete item');
			}

			setOrderItems(orderItems.filter((item) => item.id !== itemId));
			toast.success('Xóa dịch vụ thành công');
		} catch (error) {
			console.error('Error deleting order item:', error);
			toast.error('Không thể xóa dịch vụ');
		} finally {
			setDeletingItemId(null);
		}
	};

	if (!order) return null;

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	const getTotalAmount = () => {
		const serviceTotal = orderItems.reduce(
			(total, item) => total + item.quantity * item.unitPrice,
			0,
		);
		return serviceTotal + orderSettings.deliveryFee;
	};

	const canEditItems = order.status === 'PICKED_UP';
	const canViewItems = order.status === 'COMPLETED' || orderItems.length > 0;
	const canEditDeliveryFee =
		order.status === 'PICKED_UP' && order.pickupType === 'HOME';
	const availableActions =
		statusActions[order.status as keyof typeof statusActions] || [];

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Chi tiết đơn hàng #{order.id.slice(-8)}</DialogTitle>
				</DialogHeader>

				<div className="space-y-6">
					{/* Order Info */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label>Khách hàng</Label>
							<div className="mt-1">
								<div className="font-medium">{order.customer.fullName}</div>
								<div className="text-sm text-muted-foreground">
									{order.customer.user.phone}
								</div>
							</div>
						</div>
						<div>
							<Label>Trạng thái</Label>
							<div className="mt-1">
								<Badge>
									{statusLabels[order.status as keyof typeof statusLabels]}
								</Badge>
							</div>
						</div>
					</div>

					{/* Delivery Fee Settings - Only for PICKED_UP status with HOME delivery */}
					{canEditDeliveryFee && (
						<div className="space-y-4 border-t pt-4">
							<h3 className="font-medium">Cài đặt phí giao hàng</h3>
							<div className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
									<Label htmlFor="deliveryFee" className="text-sm font-medium">
										Phí giao hàng (VND)
									</Label>
									<Input
										type="number"
										min="0"
										placeholder="0"
										value={orderSettings.deliveryFee}
										onChange={(e) =>
											setOrderSettings({
												...orderSettings,
												deliveryFee: parseInt(e.target.value) || 0,
											})
										}
									/>
								</div>
							</div>
							<div className="flex justify-start pt-2">
								<Button onClick={updateOrderSettings} disabled={updating}>
									{updating ? 'Đang cập nhật...' : 'Cập nhật phí giao hàng'}
								</Button>
							</div>
						</div>
					)}

					{/* Order Items */}
					{canEditItems && (
						<div className="space-y-4 border-t pt-4">
							<div className="flex items-center justify-between">
								<h3 className="font-medium">Dịch vụ đã chọn</h3>
								<Button
									onClick={() => setShowNewItemForm(true)}
									size="sm"
									disabled={showNewItemForm || addingItem}
								>
									<Plus className="w-4 h-4 mr-2" />
									Thêm dịch vụ
								</Button>
							</div>

							{showNewItemForm && (
								<div className="space-y-4 p-4 border rounded-lg bg-muted/50">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label className="text-sm font-medium">Dịch vụ</Label>
											<Select
												value={newItem.serviceId}
												onValueChange={(value) => {
													const service = vendorServices.find(
														(s) => s.id === value,
													);
													setNewItem({
														serviceId: value,
														quantity: newItem.quantity,
														unitPrice: service?.fee || 0,
													});
												}}
											>
												<SelectTrigger>
													<SelectValue placeholder="Chọn dịch vụ" />
												</SelectTrigger>
												<SelectContent>
													{vendorServices.map((service) => (
														<SelectItem key={service.id} value={service.id}>
															{service.name} -{' '}
															{new Intl.NumberFormat('vi-VN', {
																style: 'currency',
																currency: 'VND',
															}).format(service.fee)}
															/kg
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label className="text-sm font-medium">
												Số lượng (kg)
											</Label>
											<Input
												type="number"
												placeholder="0.1-999.9"
												value={newItem.quantity}
												step="0.1"
												min="0.1"
												max="999.9"
												onChange={(e) => {
													const value = parseFloat(e.target.value);
													const roundedValue = Math.round(value * 10) / 10;
													setNewItem({
														...newItem,
														quantity: roundedValue || 0.1,
													});
												}}
											/>
										</div>
									</div>

									{newItem.serviceId && (
										<div className="p-2 bg-background border rounded text-sm">
											<span className="font-medium">Thành tiền: </span>
											<span className="text-primary font-semibold">
												{new Intl.NumberFormat('vi-VN', {
													style: 'currency',
													currency: 'VND',
												}).format(newItem.quantity * newItem.unitPrice)}
											</span>
										</div>
									)}

									<div className="flex gap-2 justify-end">
										<Button
											onClick={addOrderItem}
											size="sm"
											disabled={addingItem}
										>
											<Check className="w-4 h-4 mr-1" />
											{addingItem ? 'Đang thêm...' : 'Thêm'}
										</Button>
										<Button
											onClick={() => {
												setShowNewItemForm(false);
												setNewItem({
													serviceId: '',
													quantity: 0.1,
													unitPrice: 0,
												});
											}}
											variant="outline"
											size="sm"
											disabled={addingItem}
										>
											<X className="w-4 h-4 mr-1" />
											Hủy
										</Button>
									</div>
								</div>
							)}

							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Dịch vụ</TableHead>
										<TableHead>Số lượng (kg)</TableHead>
										<TableHead>Đơn giá</TableHead>
										<TableHead>Thành tiền</TableHead>
										<TableHead>Thao tác</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{orderItems.map((item) => (
										<TableRow key={item.id}>
											{editingItem?.id === item.id ? (
												<>
													<TableCell>
														<Input
															value={editingItem.name}
															onChange={(e) =>
																setEditingItem({
																	...editingItem,
																	name: e.target.value,
																})
															}
														/>
													</TableCell>
													<TableCell>
														<Input
															type="number"
															value={editingItem.quantity}
															step="0.1"
															min="0.1"
															max="999.9"
															onChange={(e) => {
																const value = parseFloat(e.target.value);
																const roundedValue =
																	Math.round(value * 10) / 10;
																setEditingItem({
																	...editingItem,
																	quantity: roundedValue || 0.1,
																});
															}}
														/>
													</TableCell>
													<TableCell>
														<Input
															type="number"
															value={editingItem.unitPrice}
															onChange={(e) =>
																setEditingItem({
																	...editingItem,
																	unitPrice: parseInt(e.target.value) || 0,
																})
															}
														/>
													</TableCell>
													<TableCell>
														{formatCurrency(
															editingItem.quantity * editingItem.unitPrice,
														)}
													</TableCell>
													<TableCell>
														<div className="flex gap-1">
															<Button
																onClick={updateOrderItem}
																size="sm"
																disabled={updatingItem}
															>
																<Check className="w-4 h-4" />
															</Button>
															<Button
																onClick={() => setEditingItem(null)}
																variant="outline"
																size="sm"
																disabled={updatingItem}
															>
																<X className="w-4 h-4" />
															</Button>
														</div>
													</TableCell>
												</>
											) : (
												<>
													<TableCell>{item.name}</TableCell>
													<TableCell>{item.quantity}</TableCell>
													<TableCell>
														{formatCurrency(item.unitPrice)}
													</TableCell>
													<TableCell>
														{formatCurrency(item.quantity * item.unitPrice)}
													</TableCell>
													<TableCell>
														<div className="flex gap-1">
															<Button
																onClick={() => setEditingItem(item)}
																variant="outline"
																size="sm"
																disabled={
																	deletingItemId === item.id ||
																	addingItem ||
																	updatingItem
																}
															>
																<Edit className="w-4 h-4" />
															</Button>
															<Button
																onClick={() => deleteOrderItem(item.id)}
																variant="outline"
																size="sm"
																disabled={
																	deletingItemId === item.id ||
																	addingItem ||
																	updatingItem
																}
															>
																<Trash2 className="w-4 h-4" />
															</Button>
														</div>
													</TableCell>
												</>
											)}
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}

					{/* Order Items - View Only (for COMPLETED and other statuses with items) */}
					{!canEditItems && canViewItems && (
						<div className="space-y-4 border-t pt-4">
							<h3 className="font-medium">Dịch vụ đã thực hiện</h3>
							{orderItems.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Dịch vụ</TableHead>
											<TableHead>Số lượng (kg)</TableHead>
											<TableHead>Đơn giá</TableHead>
											<TableHead>Thành tiền</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{orderItems.map((item) => (
											<TableRow key={item.id}>
												<TableCell>{item.name}</TableCell>
												<TableCell>{item.quantity}</TableCell>
												<TableCell>{formatCurrency(item.unitPrice)}</TableCell>
												<TableCell>
													{formatCurrency(item.quantity * item.unitPrice)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<div className="text-center py-8 text-muted-foreground">
									<p>Chưa có dịch vụ nào được thêm</p>
								</div>
							)}
						</div>
					)}

					{/* Order Summary */}
					<div className="border-t pt-4">
						<h3 className="font-medium mb-2">Tổng kết đơn hàng</h3>
						<div className="space-y-2">
							<div className="flex justify-between">
								<span>Tiền dịch vụ:</span>
								<span>
									{formatCurrency(
										orderItems.reduce(
											(total, item) => total + item.quantity * item.unitPrice,
											0,
										),
									)}
								</span>
							</div>
							<div className="flex justify-between">
								<span>Phí giao hàng:</span>
								<span>{formatCurrency(orderSettings.deliveryFee)}</span>
							</div>
							<div className="flex justify-between font-medium text-lg border-t pt-2">
								<span>Tổng cộng:</span>
								<span>{formatCurrency(getTotalAmount())}</span>
							</div>
						</div>
					</div>

					{/* Customer Review */}
					{order?.review && (
						<div className="border-t pt-4">
							<h3 className="font-medium mb-4">Đánh giá từ khách hàng</h3>
							<div className="bg-muted/50 rounded-lg p-4 space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">Điểm đánh giá:</span>
									<StarRating value={order.review.rating} readonly size="sm" />
								</div>

								{order.review.comment && (
									<div className="space-y-2">
										<span className="text-sm font-medium">Nhận xét:</span>
										<p className="text-sm text-muted-foreground bg-background p-3 rounded border">
											{order.review.comment}
										</p>
									</div>
								)}

								<div className="flex items-center justify-between text-xs text-muted-foreground">
									<span>Đánh giá lúc:</span>
									<span>
										{new Date(order.review.createdAt).toLocaleDateString(
											'vi-VN',
											{
												day: '2-digit',
												month: '2-digit',
												year: 'numeric',
												hour: '2-digit',
												minute: '2-digit',
											},
										)}
									</span>
								</div>
							</div>
						</div>
					)}

					{/* Action Buttons */}
					{availableActions.length > 0 && (
						<div className="border-t pt-4">
							<div className="flex gap-2">
								{availableActions.map((action) => (
									<Button
										key={action.action}
										onClick={() => updateOrderStatus(action.action)}
										variant={action.variant}
										disabled={
											updating ||
											(action.action === 'COMPLETED' &&
												order.paymentMethod === 'QRCODE' &&
												order.paymentStatus !== 'COMPLETED')
										}
									>
										{action.label}
									</Button>
								))}
							</div>
							{order.status === 'PAYMENT_REQUIRED' &&
								order.paymentMethod === 'QRCODE' && (
									<div className="mt-2">
										<Button variant="outline" disabled>
											Quét QR
										</Button>
									</div>
								)}
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
