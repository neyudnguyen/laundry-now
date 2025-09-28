'use client';

import { useEffect, useState } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

interface AdminVendor {
	id: string;
	phone: string;
	email?: string;
	shopName: string;
	address?: {
		province: string;
		district: string;
		ward: string;
		street: string;
	};
	createdAt: string;
}

export default function VendorsPage() {
	const [vendors, setVendors] = useState<AdminVendor[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchVendors = async () => {
			try {
				setIsLoading(true);
				const response = await fetch('/api/admin/vendors');

				if (!response.ok) {
					throw new Error('Không thể tải danh sách nhà cung cấp');
				}

				const data = await response.json();
				setVendors(data || []);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
			} finally {
				setIsLoading(false);
			}
		};

		fetchVendors();
	}, []);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		});
	};

	const formatAddress = (address?: AdminVendor['address']) => {
		if (!address) return '—';
		return `${address.street}, ${address.ward}, ${address.district}, ${address.province}`;
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="px-1">
					<h1 className="text-3xl font-bold">Danh sách nhà cung cấp</h1>
					<p className="text-muted-foreground mt-2">
						Xem thông tin cơ bản của tất cả nhà cung cấp trong hệ thống
					</p>
				</div>
				<Card>
					<CardContent className="flex items-center justify-center py-16 px-6">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
							<p className="text-lg text-muted-foreground">
								Đang tải danh sách nhà cung cấp...
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<div className="px-1">
					<h1 className="text-3xl font-bold">Danh sách nhà cung cấp</h1>
					<p className="text-muted-foreground mt-2">
						Xem thông tin cơ bản của tất cả nhà cung cấp trong hệ thống
					</p>
				</div>
				<Card>
					<CardContent className="flex items-center justify-center py-16 px-6">
						<div className="text-center">
							<div className="rounded-full bg-red-100 p-3 mx-auto mb-4 w-fit">
								<svg
									className="h-6 w-6 text-red-600"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
									/>
								</svg>
							</div>
							<p className="text-lg text-destructive font-medium">{error}</p>
							<p className="text-sm text-muted-foreground mt-2">
								Vui lòng thử lại sau
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="px-1">
				<h1 className="text-3xl font-bold">Danh sách nhà cung cấp</h1>
				<p className="text-muted-foreground mt-2">
					Xem thông tin cơ bản của tất cả nhà cung cấp trong hệ thống
				</p>
			</div>

			<Card>
				<CardContent className="p-6">
					{vendors.length === 0 ? (
						<div className="text-center py-12 px-4 text-muted-foreground">
							<p className="text-lg">Chưa có nhà cung cấp nào trong hệ thống</p>
						</div>
					) : (
						<div className="overflow-x-auto -mx-6">
							<div className="inline-block min-w-full align-middle">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="px-6 py-4">Tên cửa hàng</TableHead>
											<TableHead className="px-6 py-4">Số điện thoại</TableHead>
											<TableHead className="hidden md:table-cell px-6 py-4">
												Email
											</TableHead>
											<TableHead className="hidden lg:table-cell px-6 py-4">
												Địa chỉ
											</TableHead>
											<TableHead className="hidden md:table-cell px-6 py-4">
												Ngày tham gia
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{vendors.map((vendor) => (
											<TableRow key={vendor.id} className="hover:bg-muted/50">
												<TableCell className="font-medium px-6 py-4">
													{vendor.shopName}
												</TableCell>
												<TableCell className="px-6 py-4">
													{vendor.phone}
												</TableCell>
												<TableCell className="hidden md:table-cell px-6 py-4">
													{vendor.email || '—'}
												</TableCell>
												<TableCell className="hidden lg:table-cell px-6 py-4 max-w-xs truncate">
													{formatAddress(vendor.address)}
												</TableCell>
												<TableCell className="hidden md:table-cell px-6 py-4 text-muted-foreground">
													{formatDate(vendor.createdAt)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
