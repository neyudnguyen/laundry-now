'use client';

import { Mail, MapPin, Phone, ShoppingCart, Store } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

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
	image: string | null;
	services: VendorService[];
}

interface VendorDetail extends Vendor {
	images: { id: string; url: string }[];
}

export default function VendorMarketplacePage() {
	const [vendors, setVendors] = useState<Vendor[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedVendor, setSelectedVendor] = useState<VendorDetail | null>(
		null,
	);
	const [loadingDetail, setLoadingDetail] = useState(false);

	const loadVendors = async () => {
		try {
			const response = await fetch('/api/vendors');
			if (response.ok) {
				const data = await response.json();
				setVendors(data.vendors);
			} else {
				console.error('Failed to load vendors');
			}
		} catch (error) {
			console.error('Error loading vendors:', error);
		} finally {
			setLoading(false);
		}
	};

	const loadVendorDetail = async (vendorId: string) => {
		setLoadingDetail(true);
		try {
			const response = await fetch(`/api/vendors/${vendorId}`);
			if (response.ok) {
				const vendor = await response.json();
				setSelectedVendor(vendor);
			} else {
				console.error('Failed to load vendor detail');
			}
		} catch (error) {
			console.error('Error loading vendor detail:', error);
		} finally {
			setLoadingDetail(false);
		}
	};

	useEffect(() => {
		loadVendors();
	}, []);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND',
		}).format(amount);
	};

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

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Tìm cửa hàng giặt ủi</h1>
				<p className="text-muted-foreground">
					Khám phá các cửa hàng giặt ủi gần bạn và chọn dịch vụ phù hợp
				</p>
			</div>

			{vendors.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Store className="h-12 w-12 text-muted-foreground mb-4" />
						<h3 className="text-lg font-medium mb-2">Chưa có cửa hàng nào</h3>
						<p className="text-muted-foreground text-center">
							Hiện tại chưa có cửa hàng giặt ủi nào trong hệ thống.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{vendors.map((vendor) => (
						<Card key={vendor.id} className="hover:shadow-md transition-shadow">
							<CardHeader className="pb-3">
								<div className="flex items-start gap-3">
									{vendor.image ? (
										<div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
											<Image
												src={vendor.image}
												alt={vendor.shopName}
												fill
												className="object-cover"
												unoptimized
											/>
										</div>
									) : (
										<Avatar className="h-16 w-16">
											<AvatarFallback>
												{vendor.shopName.charAt(0).toUpperCase()}
											</AvatarFallback>
										</Avatar>
									)}
									<div className="flex-1 min-w-0">
										<CardTitle className="text-lg line-clamp-1">
											{vendor.shopName}
										</CardTitle>
										{vendor.address && (
											<div className="flex items-start gap-1 mt-1">
												<MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
												<p className="text-xs text-muted-foreground line-clamp-2">
													{vendor.address.fullAddress}
												</p>
											</div>
										)}
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								<div>
									<h4 className="text-sm font-medium mb-2">Dịch vụ:</h4>
									<div className="space-y-1">
										{vendor.services.length > 0 ? (
											vendor.services.map((service) => (
												<div
													key={service.id}
													className="flex justify-between items-center text-sm"
												>
													<span className="text-muted-foreground line-clamp-1">
														{service.name}
													</span>
													<Badge variant="secondary" className="text-xs">
														{formatCurrency(service.fee)}/kg
													</Badge>
												</div>
											))
										) : (
											<p className="text-xs text-muted-foreground">
												Chưa có dịch vụ nào
											</p>
										)}
									</div>
								</div>

								<Dialog>
									<DialogTrigger asChild>
										<Button
											className="w-full"
											onClick={() => loadVendorDetail(vendor.id)}
										>
											Xem chi tiết
										</Button>
									</DialogTrigger>
									<DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
										<DialogHeader>
											<DialogTitle>Thông tin cửa hàng</DialogTitle>
										</DialogHeader>

										{loadingDetail ? (
											<div className="flex items-center justify-center py-8">
												<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
											</div>
										) : (
											selectedVendor && (
												<div className="space-y-6">
													<div className="flex items-start gap-4">
														{selectedVendor.images.length > 0 ? (
															<div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0">
																<Image
																	src={selectedVendor.images[0].url}
																	alt={selectedVendor.shopName}
																	fill
																	className="object-cover"
																	unoptimized
																/>
															</div>
														) : (
															<Avatar className="h-20 w-20">
																<AvatarFallback className="text-2xl">
																	{selectedVendor.shopName
																		.charAt(0)
																		.toUpperCase()}
																</AvatarFallback>
															</Avatar>
														)}
														<div className="flex-1">
															<h2 className="text-xl font-bold">
																{selectedVendor.shopName}
															</h2>
															<div className="space-y-1 mt-2">
																<div className="flex items-center gap-2 text-sm">
																	<Phone className="h-4 w-4 text-muted-foreground" />
																	<span>{selectedVendor.phone}</span>
																</div>
																{selectedVendor.email && (
																	<div className="flex items-center gap-2 text-sm">
																		<Mail className="h-4 w-4 text-muted-foreground" />
																		<span>{selectedVendor.email}</span>
																	</div>
																)}
																{selectedVendor.address && (
																	<div className="flex items-start gap-2 text-sm">
																		<MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
																		<span>
																			{selectedVendor.address.fullAddress}
																		</span>
																	</div>
																)}
															</div>
														</div>
													</div>

													{selectedVendor.images.length > 1 && (
														<div>
															<h3 className="font-medium mb-3">
																Hình ảnh cửa hàng
															</h3>
															<div className="grid grid-cols-3 gap-2">
																{selectedVendor.images.map((image) => (
																	<div
																		key={image.id}
																		className="relative aspect-square rounded-lg overflow-hidden"
																	>
																		<Image
																			src={image.url}
																			alt="Hình ảnh cửa hàng"
																			fill
																			className="object-cover"
																			unoptimized
																		/>
																	</div>
																))}
															</div>
														</div>
													)}

													<div>
														<h3 className="font-medium mb-3">
															Bảng giá dịch vụ
														</h3>
														{selectedVendor.services.length > 0 ? (
															<div className="grid gap-2">
																{selectedVendor.services.map((service) => (
																	<div
																		key={service.id}
																		className="flex justify-between items-center p-3 border rounded-lg"
																	>
																		<span className="font-medium">
																			{service.name}
																		</span>
																		<Badge variant="secondary">
																			{formatCurrency(service.fee)}/kg
																		</Badge>
																	</div>
																))}
															</div>
														) : (
															<p className="text-muted-foreground text-center py-4">
																Cửa hàng chưa có dịch vụ nào
															</p>
														)}
													</div>

													<div className="flex gap-3">
														<Button
															className="flex-1"
															disabled={selectedVendor.services.length === 0}
														>
															<ShoppingCart className="h-4 w-4 mr-2" />
															Tạo đơn hàng
														</Button>
													</div>
												</div>
											)
										)}
									</DialogContent>
								</Dialog>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
