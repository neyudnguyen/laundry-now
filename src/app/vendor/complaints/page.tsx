'use client';

import {
	AlertTriangle,
	CheckCircle,
	Clock,
	Eye,
	MessageSquare,
	XCircle,
} from 'lucide-react';
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
import { ComplaintResponseDialog } from '@/components/vendor/ComplaintResponseDialog';

interface VendorComplaint {
	id: string;
	title: string;
	description: string;
	status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';
	resolution?: string | null;
	createdAt: string;
	updatedAt: string;
	order: {
		id: string;
		createdAt: string;
		totalAmount: number;
		status: string;
	};
	customer: {
		fullName: string;
		phone: string;
	};
}

const getStatusIcon = (status: VendorComplaint['status']) => {
	switch (status) {
		case 'PENDING':
			return <Clock className="h-4 w-4" />;
		case 'IN_REVIEW':
			return <Eye className="h-4 w-4" />;
		case 'RESOLVED':
			return <CheckCircle className="h-4 w-4" />;
		case 'REJECTED':
			return <XCircle className="h-4 w-4" />;
		default:
			return <AlertTriangle className="h-4 w-4" />;
	}
};

const getStatusText = (status: VendorComplaint['status']) => {
	switch (status) {
		case 'PENDING':
			return 'Chờ xử lý';
		case 'IN_REVIEW':
			return 'Đang xem xét';
		case 'RESOLVED':
			return 'Đã giải quyết';
		case 'REJECTED':
			return 'Từ chối';
		default:
			return status;
	}
};

const getStatusVariant = (status: VendorComplaint['status']) => {
	switch (status) {
		case 'PENDING':
			return 'secondary';
		case 'IN_REVIEW':
			return 'default';
		case 'RESOLVED':
			return 'default';
		case 'REJECTED':
			return 'destructive';
		default:
			return 'secondary';
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

const getUrgencyBadge = (
	status: VendorComplaint['status'],
	createdAt: string,
) => {
	if (status !== 'PENDING') return null;

	const daysSinceCreated = Math.floor(
		(new Date().getTime() - new Date(createdAt).getTime()) /
			(1000 * 60 * 60 * 24),
	);

	if (daysSinceCreated >= 3) {
		return (
			<Badge variant="destructive" className="ml-2">
				Khẩn cấp
			</Badge>
		);
	}
	if (daysSinceCreated >= 1) {
		return (
			<Badge variant="secondary" className="ml-2">
				Cần xử lý
			</Badge>
		);
	}
	return null;
};

export default function VendorComplaints() {
	const [complaints, setComplaints] = useState<VendorComplaint[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedComplaint, setSelectedComplaint] =
		useState<VendorComplaint | null>(null);

	const fetchComplaints = async () => {
		try {
			setIsLoading(true);
			const response = await fetch('/api/vendor/complaints');

			if (!response.ok) {
				throw new Error('Không thể tải danh sách khiếu nại');
			}

			const data = await response.json();
			setComplaints(data.complaints || []);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchComplaints();
	}, []);

	const handleComplaintUpdated = () => {
		fetchComplaints(); // Refresh the list
	};

	const pendingComplaints = complaints.filter((c) => c.status === 'PENDING');
	const inReviewComplaints = complaints.filter((c) => c.status === 'IN_REVIEW');
	const resolvedComplaints = complaints.filter(
		(c) => c.status === 'RESOLVED' || c.status === 'REJECTED',
	);

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold">Quản lý khiếu nại</h1>
					<p className="text-muted-foreground">
						Xem và xử lý các khiếu nại từ khách hàng về chất lượng dịch vụ.
					</p>
				</div>
				<Card>
					<CardContent className="flex items-center justify-center py-12">
						<p>Đang tải danh sách khiếu nại...</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold">Quản lý khiếu nại</h1>
					<p className="text-muted-foreground">
						Xem và xử lý các khiếu nại từ khách hàng về chất lượng dịch vụ.
					</p>
				</div>
				<Card>
					<CardContent className="flex items-center justify-center py-12">
						<p className="text-destructive">{error}</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold">Quản lý khiếu nại</h1>
				<p className="text-muted-foreground">
					Xem và xử lý các khiếu nại từ khách hàng về chất lượng dịch vụ.
				</p>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-orange-500" />
							<div>
								<p className="text-sm text-muted-foreground">Chờ xử lý</p>
								<p className="text-xl font-bold">{pendingComplaints.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<Eye className="h-4 w-4 text-blue-500" />
							<div>
								<p className="text-sm text-muted-foreground">Đang xem xét</p>
								<p className="text-xl font-bold">{inReviewComplaints.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<CheckCircle className="h-4 w-4 text-green-500" />
							<div>
								<p className="text-sm text-muted-foreground">Đã xử lý</p>
								<p className="text-xl font-bold">{resolvedComplaints.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<div className="flex items-center gap-2">
							<MessageSquare className="h-4 w-4 text-gray-500" />
							<div>
								<p className="text-sm text-muted-foreground">Tổng cộng</p>
								<p className="text-xl font-bold">{complaints.length}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{complaints.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
						<MessageSquare className="h-12 w-12 text-muted-foreground" />
						<p className="text-muted-foreground text-center">
							Chưa có khiếu nại nào từ khách hàng.
						</p>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5" />
							Danh sách khiếu nại
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Khiếu nại</TableHead>
										<TableHead>Khách hàng</TableHead>
										<TableHead>Đơn hàng</TableHead>
										<TableHead>Trạng thái</TableHead>
										<TableHead>Ngày tạo</TableHead>
										<TableHead>Hành động</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{complaints.map((complaint) => (
										<TableRow key={complaint.id}>
											<TableCell className="max-w-xs">
												<div className="space-y-1">
													<div
														className="font-medium truncate"
														title={complaint.title}
													>
														{complaint.title}
													</div>
													<div
														className="text-xs text-muted-foreground truncate"
														title={complaint.description}
													>
														{complaint.description}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="space-y-1">
													<div className="font-medium">
														{complaint.customer.fullName}
													</div>
													<div className="text-xs text-muted-foreground">
														{complaint.customer.phone}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="space-y-1">
													<div className="font-medium">
														#{complaint.order.id.slice(-8)}
													</div>
													<div className="text-xs text-muted-foreground">
														{formatCurrency(complaint.order.totalAmount)}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center">
													<Badge
														variant={getStatusVariant(complaint.status)}
														className="gap-1"
													>
														{getStatusIcon(complaint.status)}
														{getStatusText(complaint.status)}
													</Badge>
													{getUrgencyBadge(
														complaint.status,
														complaint.createdAt,
													)}
												</div>
											</TableCell>
											<TableCell>{formatDate(complaint.createdAt)}</TableCell>
											<TableCell>
												<Button
													variant="outline"
													size="sm"
													onClick={() => setSelectedComplaint(complaint)}
												>
													Xem & Xử lý
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			)}

			{selectedComplaint && (
				<ComplaintResponseDialog
					complaint={selectedComplaint}
					isOpen={!!selectedComplaint}
					onClose={() => setSelectedComplaint(null)}
					onComplaintUpdated={handleComplaintUpdated}
				/>
			)}
		</div>
	);
}
