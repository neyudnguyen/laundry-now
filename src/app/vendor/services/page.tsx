'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign, Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Type cho service
interface Service {
	id: string;
	name: string;
	fee: number;
	createdAt: string;
	updatedAt: string;
}

// Schema validation
const serviceSchema = z.object({
	name: z.string().min(1, 'Tên dịch vụ không được để trống'),
	fee: z.string().min(1, 'Giá dịch vụ không được để trống'),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function ServicesPage() {
	const [services, setServices] = useState<Service[]>([]);
	const [loading, setLoading] = useState(true);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingService, setEditingService] = useState<Service | null>(null);
	const [deletingService, setDeletingService] = useState<Service | null>(null);

	const form = useForm<ServiceFormData>({
		resolver: zodResolver(serviceSchema),
		defaultValues: {
			name: '',
			fee: '',
		},
	});

	// Load services
	const loadServices = async () => {
		try {
			const response = await fetch('/api/vendor/services');
			if (response.ok) {
				const data = await response.json();
				setServices(data.services);
			} else {
				toast.error('Không thể tải danh sách dịch vụ');
			}
		} catch (error) {
			console.error('Error loading services:', error);
			toast.error('Có lỗi xảy ra khi tải dịch vụ');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadServices();
	}, []);

	// Submit form
	const onSubmit = async (data: ServiceFormData) => {
		try {
			const fee = parseFloat(data.fee);
			if (isNaN(fee) || fee <= 0) {
				toast.error('Giá dịch vụ phải là số dương');
				return;
			}

			const url = editingService
				? `/api/vendor/services/${editingService.id}`
				: '/api/vendor/services';

			const method = editingService ? 'PUT' : 'POST';

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: data.name,
					fee: fee,
				}),
			});

			if (response.ok) {
				toast.success(
					editingService
						? 'Cập nhật dịch vụ thành công'
						: 'Thêm dịch vụ thành công',
				);
				setIsDialogOpen(false);
				setEditingService(null);
				form.reset();
				loadServices();
			} else {
				const error = await response.json();
				toast.error(error.error || 'Có lỗi xảy ra');
			}
		} catch (error) {
			console.error('Error submitting form:', error);
			toast.error('Có lỗi xảy ra');
		}
	};

	// Delete service
	const handleDelete = async () => {
		if (!deletingService) return;

		try {
			const response = await fetch(
				`/api/vendor/services/${deletingService.id}`,
				{
					method: 'DELETE',
				},
			);

			if (response.ok) {
				toast.success('Xóa dịch vụ thành công');
				setDeletingService(null);
				loadServices();
			} else {
				const error = await response.json();
				toast.error(error.error || 'Có lỗi xảy ra');
			}
		} catch (error) {
			console.error('Error deleting service:', error);
			toast.error('Có lỗi xảy ra');
		}
	};

	// Open edit dialog
	const handleEdit = (service: Service) => {
		setEditingService(service);
		form.setValue('name', service.name);
		form.setValue('fee', service.fee.toString());
		setIsDialogOpen(true);
	};

	// Open create dialog
	const handleCreate = () => {
		setEditingService(null);
		form.reset();
		setIsDialogOpen(true);
	};

	// Format currency
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
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
					<p className="mt-2 text-sm text-gray-600">Đang tải...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Quản lý dịch vụ</h1>
					<p className="text-gray-600">
						Quản lý các dịch vụ giặt là mà bạn cung cấp
					</p>
				</div>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button
							onClick={handleCreate}
							className="bg-orange-500 hover:bg-orange-600"
						>
							<Plus className="h-4 w-4 mr-2" />
							Thêm dịch vụ
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{editingService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
							</DialogTitle>
						</DialogHeader>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-4"
							>
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Tên dịch vụ</FormLabel>
											<FormControl>
												<Input
													placeholder="VD: Giặt quần áo thường"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="fee"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Giá dịch vụ (VND/kg)</FormLabel>
											<FormControl>
												<Input
													type="number"
													placeholder="VD: 15000"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className="flex justify-end space-x-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsDialogOpen(false)}
									>
										Hủy
									</Button>
									<Button
										type="submit"
										className="bg-orange-500 hover:bg-orange-600"
									>
										{editingService ? 'Cập nhật' : 'Thêm'}
									</Button>
								</div>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Services List */}
			{services.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<DollarSign className="h-12 w-12 text-gray-400 mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							Chưa có dịch vụ nào
						</h3>
						<p className="text-gray-600 text-center mb-4">
							Thêm dịch vụ đầu tiên để khách hàng có thể đặt hàng
						</p>
						<Button
							onClick={handleCreate}
							className="bg-orange-500 hover:bg-orange-600"
						>
							<Plus className="h-4 w-4 mr-2" />
							Thêm dịch vụ đầu tiên
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{services.map((service) => (
						<Card
							key={service.id}
							className="hover:shadow-md transition-shadow"
						>
							<CardHeader className="pb-3">
								<div className="flex items-start justify-between">
									<div className="space-y-1">
										<CardTitle className="text-lg">{service.name}</CardTitle>
										<Badge
											variant="secondary"
											className="bg-orange-100 text-orange-800"
										>
											{formatCurrency(service.fee)}/kg
										</Badge>
									</div>
									<div className="flex space-x-1">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => handleEdit(service)}
											className="h-8 w-8 p-0"
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setDeletingService(service)}
											className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent className="pt-0">
								<p className="text-sm text-gray-600">
									Cập nhật:{' '}
									{new Date(service.updatedAt).toLocaleDateString('vi-VN')}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={!!deletingService}
				onOpenChange={() => setDeletingService(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc chắn muốn xóa dịch vụ &ldquo;{deletingService?.name}
							&rdquo;? Hành động này không thể hoàn tác.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-red-600 hover:bg-red-700"
						>
							Xóa
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
