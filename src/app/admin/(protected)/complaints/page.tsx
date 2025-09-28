'use client';

import {
	AlertTriangle,
	CheckCircle,
	Clock,
	Eye,
	MessageSquare,
	Search,
	XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

interface AdminComplaint {
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
		servicePrice: number;
		deliveryFee: number;
		status: string;
	};
	customer: {
		fullName: string;
		user: {
			phone: string;
		};
	};
	vendor: {
		shopName: string;
		user: {
			id: string;
		};
	};
}

const getStatusIcon = (status: AdminComplaint['status']) => {
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

const getStatusText = (status: AdminComplaint['status']) => {
	switch (status) {
		case 'PENDING':
			return 'Chờ vendor xử lý';
		case 'IN_REVIEW':
			return 'Chờ admin duyệt';
		case 'RESOLVED':
			return 'Đã chấp nhận';
		case 'REJECTED':
			return 'Đã từ chối';
		default:
			return status;
	}
};

const getStatusVariant = (status: AdminComplaint['status']) => {
	switch (status) {
		case 'PENDING':
			return 'secondary' as const;
		case 'IN_REVIEW':
			return 'default' as const;
		case 'RESOLVED':
			return 'default' as const;
		case 'REJECTED':
			return 'destructive' as const;
		default:
			return 'secondary' as const;
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

const getPriorityBadge = (
	status: AdminComplaint['status'],
	createdAt: string,
) => {
	if (status === 'RESOLVED' || status === 'REJECTED') return null;

	const daysSinceCreated = Math.floor(
		(new Date().getTime() - new Date(createdAt).getTime()) /
			(1000 * 60 * 60 * 24),
	);

	if (status === 'IN_REVIEW') {
		if (daysSinceCreated >= 2) {
			return (
				<Badge variant="destructive" className="ml-2">
					Khẩn cấp
				</Badge>
			);
		}
		if (daysSinceCreated >= 1) {
			return (
				<Badge
					variant="outline"
					className="ml-2 border-orange-500 text-orange-600"
				>
					Cần duyệt
				</Badge>
			);
		}
	}

	if (status === 'PENDING' && daysSinceCreated >= 3) {
		return (
			<Badge variant="secondary" className="ml-2">
				Vendor chậm xử lý
			</Badge>
		);
	}

	return null;
};

export default function AdminComplaintsPage() {
	const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedComplaint, setSelectedComplaint] =
		useState<AdminComplaint | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [adminDecision, setAdminDecision] = useState('');

	// Filters
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [searchTerm, setSearchTerm] = useState('');

	const fetchComplaints = async () => {
		try {
			setIsLoading(true);
			const response = await fetch('/api/admin/complaints');

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

	const handleComplaintDecision = async (
		complaintId: string,
		decision: 'RESOLVED' | 'REJECTED',
	) => {
		if (!adminDecision.trim()) {
			toast.error('Vui lòng nhập lý do quyết định');
			return;
		}

		setIsProcessing(true);
		try {
			const response = await fetch(`/api/admin/complaints/${complaintId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					status: decision,
					adminDecision: adminDecision.trim(),
				}),
			});

			if (!response.ok) {
				throw new Error('Không thể cập nhật trạng thái khiếu nại');
			}

			toast.success(
				`Khiếu nại đã được ${
					decision === 'RESOLVED' ? 'chấp nhận' : 'từ chối'
				}`,
			);

			setSelectedComplaint(null);
			setAdminDecision('');
			fetchComplaints();
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Có lỗi xảy ra');
		} finally {
			setIsProcessing(false);
		}
	};

	// Filter complaints
	const filteredComplaints = complaints.filter((complaint) => {
		const matchesStatus =
			statusFilter === 'all' || complaint.status === statusFilter;
		const matchesSearch =
			complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			complaint.customer.fullName
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			complaint.vendor.shopName
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			complaint.order.id.toLowerCase().includes(searchTerm.toLowerCase());

		return matchesStatus && matchesSearch;
	});

	// Statistics
	const stats = {
		total: complaints.length,
		pending: complaints.filter((c) => c.status === 'PENDING').length,
		inReview: complaints.filter((c) => c.status === 'IN_REVIEW').length,
		resolved: complaints.filter((c) => c.status === 'RESOLVED').length,
		rejected: complaints.filter((c) => c.status === 'REJECTED').length,
	};

	if (isLoading) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold">Quản lý khiếu nại</h1>
					<p className="text-muted-foreground">
						Giám sát và xử lý các khiếu nại trong hệ thống
					</p>
				</div>
				<Card>
					<CardContent className="flex items-center justify-center py-12">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
							<p className="mt-2 text-sm text-muted-foreground">Đang tải...</p>
						</div>
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
						Giám sát và xử lý các khiếu nại trong hệ thống
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
					Giám sát và xử lý các khiếu nại trong hệ thống
				</p>
			</div>

			{/* Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Tổng số</CardTitle>
						<AlertTriangle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.total}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Chờ vendor</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-yellow-600">
							{stats.pending}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
						<Eye className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-blue-600">
							{stats.inReview}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
						<CheckCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{stats.resolved}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Đã từ chối</CardTitle>
						<XCircle className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">
							{stats.rejected}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<Input
						placeholder="Tìm kiếm theo tiêu đề, khách hàng, vendor, đơn hàng..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-full sm:w-48">
						<SelectValue placeholder="Lọc theo trạng thái" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả trạng thái</SelectItem>
						<SelectItem value="PENDING">Chờ vendor xử lý</SelectItem>
						<SelectItem value="IN_REVIEW">Chờ admin duyệt</SelectItem>
						<SelectItem value="RESOLVED">Đã chấp nhận</SelectItem>
						<SelectItem value="REJECTED">Đã từ chối</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Complaints Table */}
			{filteredComplaints.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
						<MessageSquare className="h-12 w-12 text-muted-foreground" />
						<p className="text-muted-foreground text-center">
							{searchTerm || statusFilter !== 'all'
								? 'Không tìm thấy khiếu nại nào phù hợp với bộ lọc.'
								: 'Chưa có khiếu nại nào trong hệ thống.'}
						</p>
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5" />
							Danh sách khiếu nại ({filteredComplaints.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Khiếu nại</TableHead>
										<TableHead>Khách hàng</TableHead>
										<TableHead>Vendor</TableHead>
										<TableHead>Đơn hàng</TableHead>
										<TableHead>Trạng thái</TableHead>
										<TableHead>Ngày tạo</TableHead>
										<TableHead>Hành động</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredComplaints.map((complaint) => (
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
														{complaint.customer.user.phone}
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="font-medium">
													{complaint.vendor.shopName}
												</div>
											</TableCell>
											<TableCell>
												<div className="space-y-1">
													<div className="font-medium">
														#{complaint.order.id.slice(-8)}
													</div>
													<div className="text-xs text-muted-foreground">
														{formatCurrency(
															complaint.order.servicePrice +
																complaint.order.deliveryFee,
														)}
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
													{getPriorityBadge(
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
													{complaint.status === 'IN_REVIEW'
														? 'Xử lý'
														: 'Xem chi tiết'}
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

			{/* Complaint Detail Dialog */}
			{selectedComplaint && (
				<Dialog
					open={!!selectedComplaint}
					onOpenChange={(open) => {
						if (!open) {
							setSelectedComplaint(null);
							setAdminDecision('');
						}
					}}
				>
					<DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<AlertTriangle className="h-5 w-5 text-orange-500" />
								Chi tiết khiếu nại
							</DialogTitle>
							<DialogDescription>
								Đơn hàng #{selectedComplaint.order.id.slice(-8)} từ{' '}
								{selectedComplaint.vendor.shopName}
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-6">
							{/* Basic Info */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<h4 className="font-medium text-sm mb-1">Trạng thái</h4>
									<Badge
										variant={getStatusVariant(selectedComplaint.status)}
										className="gap-1"
									>
										{getStatusIcon(selectedComplaint.status)}
										{getStatusText(selectedComplaint.status)}
									</Badge>
								</div>
								<div>
									<h4 className="font-medium text-sm mb-1">Khách hàng</h4>
									<p className="text-sm">
										{selectedComplaint.customer.fullName}
									</p>
									<p className="text-xs text-muted-foreground">
										{selectedComplaint.customer.user.phone}
									</p>
								</div>
								<div>
									<h4 className="font-medium text-sm mb-1">Ngày tạo</h4>
									<p className="text-sm text-muted-foreground">
										{formatDate(selectedComplaint.createdAt)}
									</p>
								</div>
							</div>

							{/* Complaint Content */}
							<div>
								<h4 className="font-medium text-sm mb-2">Tiêu đề khiếu nại</h4>
								<p className="text-sm">{selectedComplaint.title}</p>
							</div>

							<div>
								<h4 className="font-medium text-sm mb-2">Mô tả chi tiết</h4>
								<div className="bg-muted/50 p-3 rounded-lg">
									<p className="text-sm whitespace-pre-wrap">
										{selectedComplaint.description}
									</p>
								</div>
							</div>

							{/* Vendor Resolution */}
							{selectedComplaint.resolution && (
								<div>
									<h4 className="font-medium text-sm mb-2">
										Phản hồi từ vendor
									</h4>
									<div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
										<p className="text-sm whitespace-pre-wrap">
											{selectedComplaint.resolution}
										</p>
									</div>
								</div>
							)}

							{/* Action Section for IN_REVIEW status */}
							{selectedComplaint.status === 'IN_REVIEW' && (
								<div className="border-t pt-6">
									<h4 className="font-medium text-sm mb-2">Quyết định xử lý</h4>
									<div className="space-y-4">
										<Textarea
											placeholder="Nhập lý do quyết định của bạn..."
											value={adminDecision}
											onChange={(e) => setAdminDecision(e.target.value)}
											rows={3}
										/>
										<div className="flex gap-3">
											<Button
												onClick={() =>
													handleComplaintDecision(
														selectedComplaint.id,
														'RESOLVED',
													)
												}
												disabled={isProcessing || !adminDecision.trim()}
												className="bg-green-600 hover:bg-green-700"
											>
												{isProcessing ? 'Đang xử lý...' : 'Chấp nhận khiếu nại'}
											</Button>
											<Button
												variant="destructive"
												onClick={() =>
													handleComplaintDecision(
														selectedComplaint.id,
														'REJECTED',
													)
												}
												disabled={isProcessing || !adminDecision.trim()}
											>
												{isProcessing ? 'Đang xử lý...' : 'Từ chối khiếu nại'}
											</Button>
										</div>
									</div>
								</div>
							)}

							{selectedComplaint.updatedAt !== selectedComplaint.createdAt && (
								<div className="text-xs text-muted-foreground border-t pt-2">
									Cập nhật lần cuối: {formatDate(selectedComplaint.updatedAt)}
								</div>
							)}
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
