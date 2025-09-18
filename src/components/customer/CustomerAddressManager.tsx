'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, MapPin, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { VietnamAddressSelector } from '@/components/customer/VietnamAddressSelector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
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
import { useToast } from '@/hooks/use-toast';

const addressSchema = z.object({
	province: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
	district: z.string().min(1, 'Vui lòng chọn quận/huyện'),
	ward: z.string().min(1, 'Vui lòng chọn phường/xã'),
	street: z.string().min(1, 'Vui lòng nhập địa chỉ cụ thể'),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface Address {
	id: string;
	province: string;
	district: string;
	ward: string;
	street: string;
	createdAt: string;
	updatedAt: string;
}

export function CustomerAddressManager() {
	const [addresses, setAddresses] = useState<Address[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingAddress, setEditingAddress] = useState<Address | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { toast } = useToast();

	const form = useForm<AddressFormData>({
		resolver: zodResolver(addressSchema),
		defaultValues: {
			province: '',
			district: '',
			ward: '',
			street: '',
		},
	});

	// Fetch addresses
	const fetchAddresses = async () => {
		try {
			const response = await fetch('/api/customer/addresses');
			if (response.ok) {
				const data = await response.json();
				setAddresses(data.addresses || []);
			}
		} catch (error) {
			console.error('Error fetching addresses:', error);
			toast.error('Không thể tải danh sách địa chỉ');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchAddresses();
	}, []);

	// Handle form submission
	const onSubmit = async (data: AddressFormData) => {
		setIsSubmitting(true);
		try {
			const url = editingAddress
				? `/api/customer/addresses/${editingAddress.id}`
				: '/api/customer/addresses';

			const method = editingAddress ? 'PUT' : 'POST';

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Có lỗi xảy ra');
			}

			toast.success(
				editingAddress
					? 'Cập nhật địa chỉ thành công!'
					: 'Thêm địa chỉ thành công!',
			);
			setIsDialogOpen(false);
			setEditingAddress(null);
			form.reset();
			fetchAddresses(); // Refresh the list
		} catch (error) {
			console.error('Error saving address:', error);
			toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle delete address
	const handleDelete = async (addressId: string) => {
		if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
			return;
		}

		try {
			const response = await fetch(`/api/customer/addresses/${addressId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Có lỗi xảy ra');
			}

			toast.success('Xóa địa chỉ thành công!');
			fetchAddresses(); // Refresh the list
		} catch (error) {
			console.error('Error deleting address:', error);
			toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
		}
	};

	// Handle edit address
	const handleEdit = (address: Address) => {
		setEditingAddress(address);
		form.reset({
			province: address.province,
			district: address.district,
			ward: address.ward,
			street: address.street,
		});
		setIsDialogOpen(true);
	};

	// Handle add new address
	const handleAddNew = () => {
		setEditingAddress(null);
		form.reset({
			province: '',
			district: '',
			ward: '',
			street: '',
		});
		setIsDialogOpen(true);
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Quản lý địa chỉ</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-4">Đang tải...</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>Quản lý địa chỉ</span>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button onClick={handleAddNew} size="sm">
								<Plus className="h-4 w-4 mr-2" />
								Thêm địa chỉ
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>
									{editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
								</DialogTitle>
								<DialogDescription>
									{editingAddress
										? 'Cập nhật thông tin địa chỉ của bạn'
										: 'Thêm địa chỉ mới cho tài khoản của bạn'}
								</DialogDescription>
							</DialogHeader>

							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-6"
								>
									<VietnamAddressSelector
										control={form.control}
										defaultValues={
											editingAddress
												? {
														province: editingAddress.province,
														district: editingAddress.district,
														ward: editingAddress.ward,
													}
												: undefined
										}
									/>

									<FormField
										control={form.control}
										name="street"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Địa chỉ cụ thể</FormLabel>
												<FormControl>
													<Input
														placeholder="Nhập số nhà, tên đường..."
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<div className="flex gap-2">
										<Button
											type="submit"
											disabled={isSubmitting}
											className="flex-1"
										>
											{isSubmitting
												? 'Đang lưu...'
												: editingAddress
													? 'Cập nhật'
													: 'Thêm địa chỉ'}
										</Button>
										<Button
											type="button"
											variant="outline"
											onClick={() => setIsDialogOpen(false)}
											disabled={isSubmitting}
										>
											Hủy
										</Button>
									</div>
								</form>
							</Form>
						</DialogContent>
					</Dialog>
				</CardTitle>
				<CardDescription>Quản lý các địa chỉ giao hàng của bạn</CardDescription>
			</CardHeader>
			<CardContent>
				{addresses.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p>Chưa có địa chỉ nào</p>
						<p className="text-sm">Thêm địa chỉ đầu tiên để bắt đầu</p>
					</div>
				) : (
					<div className="space-y-4">
						{addresses.map((address) => (
							<div
								key={address.id}
								className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-2 mb-2">
											<MapPin className="h-4 w-4 text-muted-foreground" />
											<Badge variant="secondary" className="text-xs">
												Địa chỉ {addresses.indexOf(address) + 1}
											</Badge>
										</div>
										<p className="font-medium">{address.street}</p>
										<p className="text-sm text-muted-foreground">
											{address.ward}, {address.district}, {address.province}
										</p>
									</div>
									<div className="flex gap-2">
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleEdit(address)}
										>
											<Edit className="h-4 w-4" />
										</Button>
										<Button
											size="sm"
											variant="outline"
											onClick={() => handleDelete(address.id)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
