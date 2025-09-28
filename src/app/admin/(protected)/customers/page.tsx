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

interface AdminCustomer {
	id: string;
	phone: string;
	email?: string;
	fullName: string;
	createdAt: string;
}

export default function CustomersPage() {
	const [customers, setCustomers] = useState<AdminCustomer[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchCustomers = async () => {
			try {
				setIsLoading(true);
				const response = await fetch('/api/admin/customers');

				if (!response.ok) {
					throw new Error('Không thể tải danh sách khách hàng');
				}

				const data = await response.json();
				setCustomers(data || []);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
			} finally {
				setIsLoading(false);
			}
		};

		fetchCustomers();
	}, []);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('vi-VN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		});
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="px-1">
					<h1 className="text-3xl font-bold">Danh sách khách hàng</h1>
					<p className="text-muted-foreground mt-2">
						Xem thông tin cơ bản của tất cả khách hàng trong hệ thống
					</p>
				</div>
				<Card>
					<CardContent className="flex items-center justify-center py-16 px-6">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
							<p className="text-lg text-muted-foreground">
								Đang tải danh sách khách hàng...
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
					<h1 className="text-3xl font-bold">Danh sách khách hàng</h1>
					<p className="text-muted-foreground mt-2">
						Xem thông tin cơ bản của tất cả khách hàng trong hệ thống
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
				<h1 className="text-3xl font-bold">Danh sách khách hàng</h1>
				<p className="text-muted-foreground mt-2">
					Xem thông tin cơ bản của tất cả khách hàng trong hệ thống
				</p>
			</div>

			<Card>
				<CardContent className="p-6">
					{customers.length === 0 ? (
						<div className="text-center py-12 px-4 text-muted-foreground">
							<p className="text-lg">Chưa có khách hàng nào trong hệ thống</p>
						</div>
					) : (
						<div className="overflow-x-auto -mx-6">
							<div className="inline-block min-w-full align-middle">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="px-6 py-4 w-16">#</TableHead>
											<TableHead className="px-6 py-4">Họ tên</TableHead>
											<TableHead className="px-6 py-4">Số điện thoại</TableHead>
											<TableHead className="hidden md:table-cell px-6 py-4">
												Email
											</TableHead>
											<TableHead className="hidden md:table-cell px-6 py-4">
												Ngày tham gia
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{customers.map((customer, index) => (
											<TableRow key={customer.id} className="hover:bg-muted/50">
												<TableCell className="px-6 py-4 text-muted-foreground">
													{index + 1}
												</TableCell>
												<TableCell className="font-medium px-6 py-4">
													{customer.fullName}
												</TableCell>
												<TableCell className="px-6 py-4">
													{customer.phone}
												</TableCell>
												<TableCell className="hidden md:table-cell px-6 py-4">
													{customer.email || '—'}
												</TableCell>
												<TableCell className="hidden md:table-cell px-6 py-4 text-muted-foreground">
													{formatDate(customer.createdAt)}
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
