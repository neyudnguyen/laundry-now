'use client';

import {
	CreditCard,
	Home,
	MapPin,
	Plus,
	Store,
	Trash2,
	Wallet,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

interface VendorService {
	id: string;
	name: string;
	fee: number;
}

interface VendorAddress {
	province: string;
	district: string;
	ward: string;
	street: string;
	fullAddress: string;
}

interface Vendor {
	id: string;
	shopName: string;
	phone: string;
	email: string | null;
	address: VendorAddress | null;
	images: { id: string; url: string }[];
	services: VendorService[];
}

interface OrderItem {
	serviceId: string;
	serviceName: string;
	unitPrice: number;
	quantity: number;
}

const CustomerOrdersPage = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const vendorId = searchParams.get('vendorId');

	const [vendor, setVendor] = useState<Vendor | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	// Form states
	const [pickupType, setPickupType] = useState<'HOME' | 'STORE'>('STORE');
	const [paymentMethod, setPaymentMethod] = useState<'COD' | 'QRCODE'>('COD');
	const [notes, setNotes] = useState('');
	const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

	useEffect(() => {
		const load = async () => {
			if (!vendorId) return;

			try {
				const response = await fetch(`/api/vendors/${vendorId}`);
				if (response.ok) {
					const vendorData = await response.json();
					setVendor(vendorData);
				} else {
					toast.error('Không thể tải thông tin cửa hàng');
				}
			} catch (error) {
				console.error('Error loading vendor:', error);
				toast.error('Có lỗi xảy ra khi tải thông tin cửa hàng');
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [vendorId]);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

	const addOrderItem = (service: VendorService) => {
		const existingItem = orderItems.find(
			(item) => item.serviceId === service.id,
		);
		if (existingItem) {
			setOrderItems((items) =>
				items.map((item) =>
					item.serviceId === service.id
						? { ...item, quantity: item.quantity + 1 }
						: item,
				),
			);
		} else {
			setOrderItems((items) => [
				...items,
				{
					serviceId: service.id,
					serviceName: service.name,
					unitPrice: service.fee,
					quantity: 1,
				},
			]);
		}
	};

	const updateOrderItemQuantity = (serviceId: string, quantity: number) => {
		if (quantity <= 0) {
			setOrderItems((items) =>
				items.filter((item) => item.serviceId !== serviceId),
			);
		} else {
			setOrderItems((items) =>
				items.map((item) =>
					item.serviceId === serviceId ? { ...item, quantity } : item,
				),
			);
		}
	};

	const removeOrderItem = (serviceId: string) => {
		setOrderItems((items) =>
			items.filter((item) => item.serviceId !== serviceId),
		);
	};

	const calculateServicePrice = () => {
		return orderItems.reduce(
			(total, item) => total + item.unitPrice * item.quantity,
			0,
		);
	};

	const deliveryFee = pickupType === 'HOME' ? 20000 : 0;
	const totalPrice = calculateServicePrice() + deliveryFee;

	const handleSubmitOrder = async () => {
		if (!vendor) return;

		setSubmitting(true);

		try {
			const response = await fetch('/api/customer/orders', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					vendorId: vendor.id,
					pickupType,
					paymentMethod,
					notes,
					items: orderItems.map((item) => ({
						serviceId: item.serviceId,
						quantity: item.quantity,
					})),
				}),
			});

			const data = await response.json();

			if (response.ok) {
				toast.success('Tạo đơn hàng thành công!');
				router.push('/customer/order-history');
			} else {
				toast.error(data.error || 'Không thể tạo đơn hàng');
			}
		} catch (error) {
			console.error('Error creating order:', error);
			toast.error('Có lỗi xảy ra khi tạo đơn hàng');
		} finally {
			setSubmitting(false);
		}
	};

	// Show message if no vendorId
	if (!vendorId) {
		return (
			<div className="max-w-2xl mx-auto space-y-6">
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Store className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium mb-2">Chưa chọn cửa hàng</h3>
						<p className="text-muted-foreground text-center mb-4">
							Bạn cần chọn cửa hàng giặt ủi trước khi tạo đơn hàng.
						</p>
						<Link href="/customer/marketplace">
							<Button>Chọn cửa hàng</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="flex h-[400px] items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
					<p className="mt-2 text-sm text-muted-foreground">Đang tải...</p>
				</div>
			</div>
		);
	}

	if (!vendor) {
		return (
			<div className="max-w-2xl mx-auto space-y-6">
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<h3 className="text-lg font-medium mb-2">
							Không tìm thấy cửa hàng
						</h3>
						<p className="text-muted-foreground text-center mb-4">
							Cửa hàng bạn chọn không tồn tại hoặc đã bị xóa.
						</p>
						<Link href="/customer/marketplace">
							<Button>Quay lại tìm cửa hàng</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Tạo đơn hàng</h1>
				<p className="text-muted-foreground">
					Điền thông tin đơn hàng và chọn dịch vụ phù hợp
				</p>
			</div>

			{/* Vendor Info - Full Width */}
			<Card>
				<CardHeader>
					<CardTitle>Thông tin cửa hàng</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-start gap-4">
						{vendor.images.length > 0 ? (
							<div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
								<Image
									src={vendor.images[0].url}
									alt={vendor.shopName}
									fill
									className="object-cover"
									unoptimized
								/>
							</div>
						) : (
							<Avatar className="h-16 w-16">
								<AvatarFallback className="text-lg">
									{vendor.shopName.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
						)}
						<div className="flex-1">
							<h3 className="font-semibold text-lg">{vendor.shopName}</h3>
							<p className="text-sm text-muted-foreground">{vendor.phone}</p>
							{vendor.address && (
								<div className="flex items-start gap-1 mt-1">
									<MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
									<p className="text-sm text-muted-foreground">
										{vendor.address.fullAddress}
									</p>
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			<div className="grid lg:grid-cols-2 gap-6">
				{/* Left Column - Services */}
				<div className="space-y-6">
					{/* Services */}
					<Card>
						<CardHeader>
							<CardTitle>Chọn dịch vụ (không bắt buộc)</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<p className="text-sm text-muted-foreground mb-3">
								Bạn có thể chọn dịch vụ để ước tính giá, hoặc để trống và cửa
								hàng sẽ tính toán sau khi nhận đồ.
							</p>
							{vendor.services.length > 0 ? (
								vendor.services.map((service) => (
									<div
										key={service.id}
										className="flex items-center justify-between p-3 border rounded-lg"
									>
										<div className="flex-1">
											<p className="font-medium">{service.name}</p>
											<p className="text-sm text-muted-foreground">
												{formatCurrency(service.fee)}/kg
											</p>
										</div>
										<Button size="sm" onClick={() => addOrderItem(service)}>
											<Plus className="h-4 w-4 mr-1" />
											Thêm
										</Button>
									</div>
								))
							) : (
								<p className="text-muted-foreground text-center py-4">
									Cửa hàng chưa có dịch vụ nào
								</p>
							)}
						</CardContent>
					</Card>

					{/* Selected Services */}
					<Card>
						<CardHeader>
							<CardTitle>Dịch vụ đã chọn</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{orderItems.length > 0 ? (
								orderItems.map((item) => (
									<div
										key={item.serviceId}
										className="flex items-center justify-between p-3 border rounded-lg"
									>
										<div className="flex-1">
											<p className="font-medium">{item.serviceName}</p>
											<p className="text-sm text-muted-foreground">
												{formatCurrency(item.unitPrice)}/kg
											</p>
										</div>
										<div className="flex items-center gap-2">
											<Input
												type="number"
												min="1"
												value={item.quantity}
												onChange={(e) =>
													updateOrderItemQuantity(
														item.serviceId,
														parseInt(e.target.value) || 0,
													)
												}
												className="w-16 text-center"
											/>
											<span className="text-sm text-muted-foreground">kg</span>
											<Button
												size="sm"
												variant="destructive"
												onClick={() => removeOrderItem(item.serviceId)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))
							) : (
								<p className="text-muted-foreground text-center py-4">
									Chưa chọn dịch vụ nào
								</p>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Order Form */}
				<div className="space-y-6">
					{/* Order Options */}
					<Card>
						<CardHeader>
							<CardTitle>Tùy chọn đơn hàng</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{/* Pickup Type */}
							<div>
								<Label className="text-base font-medium">
									Cách thức nhận đồ
								</Label>
								<div className="grid grid-cols-2 gap-3 mt-2">
									<Button
										type="button"
										variant={pickupType === 'STORE' ? 'default' : 'outline'}
										className="flex items-center gap-2 h-auto p-3"
										onClick={() => setPickupType('STORE')}
									>
										<Store className="h-4 w-4" />
										<span>Nhận tại cửa hàng</span>
									</Button>
									<Button
										type="button"
										variant={pickupType === 'HOME' ? 'default' : 'outline'}
										className="flex items-center gap-2 h-auto p-3"
										onClick={() => setPickupType('HOME')}
									>
										<Home className="h-4 w-4" />
										<span>Giao tận nhà</span>
									</Button>
								</div>
							</div>

							{/* Payment Method */}
							<div>
								<Label className="text-base font-medium">
									Phương thức thanh toán
								</Label>
								<div className="grid grid-cols-2 gap-3 mt-2">
									<Button
										type="button"
										variant={paymentMethod === 'COD' ? 'default' : 'outline'}
										className="flex items-center gap-2 h-auto p-3"
										onClick={() => setPaymentMethod('COD')}
									>
										<Wallet className="h-4 w-4" />
										<span>Tiền mặt</span>
									</Button>
									<Button
										type="button"
										variant={paymentMethod === 'QRCODE' ? 'default' : 'outline'}
										className="flex items-center gap-2 h-auto p-3"
										onClick={() => setPaymentMethod('QRCODE')}
									>
										<CreditCard className="h-4 w-4" />
										<span>Chuyển khoản</span>
									</Button>
								</div>
							</div>

							{/* Notes */}
							<div>
								<Label htmlFor="notes" className="text-base font-medium">
									Ghi chú (không bắt buộc)
								</Label>
								<Textarea
									id="notes"
									placeholder="Ghi chú cho cửa hàng..."
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									className="mt-2"
									rows={3}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Order Summary */}
					<Card>
						<CardHeader>
							<CardTitle>Tổng kết đơn hàng</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{orderItems.length > 0 ? (
								<>
									<div className="flex justify-between">
										<span>Tiền dịch vụ:</span>
										<span>{formatCurrency(calculateServicePrice())}</span>
									</div>
									<div className="flex justify-between">
										<span>Phí giao hàng:</span>
										<span>{formatCurrency(deliveryFee)}</span>
									</div>
									{pickupType === 'HOME' && (
										<p className="text-xs text-muted-foreground">
											* Phí giao hàng có thể thay đổi tùy theo cửa hàng quyết
											định sau khi giặt xong
										</p>
									)}
									<Separator />
									<div className="flex justify-between font-semibold text-lg">
										<span>Tổng cộng (ước tính):</span>
										<span>{formatCurrency(totalPrice)}</span>
									</div>
									<p className="text-xs text-muted-foreground">
										* Đây là giá ước tính. Giá cuối cùng sẽ được tính theo khối
										lượng thực tế khi cửa hàng cân đồ.
									</p>
								</>
							) : (
								<>
									<div className="flex justify-between">
										<span>Phí giao hàng:</span>
										<span>{formatCurrency(deliveryFee)}</span>
									</div>
									{pickupType === 'HOME' && (
										<p className="text-xs text-muted-foreground">
											* Phí giao hàng có thể thay đổi tùy theo cửa hàng quyết
											định sau khi giặt xong
										</p>
									)}
									<Separator />
									<div className="text-center py-4">
										<p className="text-muted-foreground">
											Chưa chọn dịch vụ nào
										</p>
										<p className="text-sm text-muted-foreground">
											Cửa hàng sẽ tính toán chi phí sau khi nhận đồ
										</p>
									</div>
								</>
							)}
							<Button
								className="w-full mt-4"
								onClick={handleSubmitOrder}
								disabled={submitting}
							>
								{submitting ? 'Đang tạo đơn...' : 'Tạo đơn hàng'}
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default CustomerOrdersPage;
