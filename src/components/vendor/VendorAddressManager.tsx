'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { VietnamAddressSelector } from '@/components/customer/VietnamAddressSelector';
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
}

interface VendorAddressManagerProps {
	vendorAddress?: Address | null;
	onSuccess?: () => void;
}

export function VendorAddressManager({
	vendorAddress,
	onSuccess,
}: VendorAddressManagerProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
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

	const onSubmit = async (data: AddressFormData) => {
		setIsLoading(true);
		try {
			const response = await fetch('/api/vendor/address', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (response.ok) {
				toast.success('Địa chỉ cửa hàng đã được cập nhật');
				setIsDialogOpen(false);
				form.reset();
				onSuccess?.();
			} else {
				throw new Error('Failed to update address');
			}
		} catch (error) {
			console.error('Error updating address:', error);
			toast.error('Không thể cập nhật địa chỉ');
		} finally {
			setIsLoading(false);
		}
	};

	const handleEditAddress = () => {
		if (vendorAddress) {
			form.reset({
				province: vendorAddress.province,
				district: vendorAddress.district,
				ward: vendorAddress.ward,
				street: vendorAddress.street,
			});
		}
		setIsDialogOpen(true);
	};

	const formatAddress = (address: Address) => {
		return `${address.street}, ${address.ward}, ${address.district}, ${address.province}`;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Địa chỉ cửa hàng</CardTitle>
				<CardDescription>Quản lý địa chỉ cửa hàng của bạn</CardDescription>
			</CardHeader>
			<CardContent>
				{vendorAddress ? (
					<div className="space-y-4">
						<div className="flex items-start space-x-3 p-4 border rounded-lg">
							<MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
							<div className="flex-1">
								<p className="font-medium text-sm">
									{formatAddress(vendorAddress)}
								</p>
							</div>
							<Button variant="outline" size="sm" onClick={handleEditAddress}>
								<Pencil className="h-4 w-4 mr-2" />
								Sửa
							</Button>
						</div>
					</div>
				) : (
					<div className="text-center py-8">
						<MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<p className="text-muted-foreground mb-4">
							Chưa có địa chỉ cửa hàng
						</p>
						<Button onClick={() => setIsDialogOpen(true)}>
							<MapPin className="h-4 w-4 mr-2" />
							Thêm địa chỉ
						</Button>
					</div>
				)}

				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>
								{vendorAddress
									? 'Sửa địa chỉ cửa hàng'
									: 'Thêm địa chỉ cửa hàng'}
							</DialogTitle>
							<DialogDescription>
								Vui lòng chọn tỉnh/thành, quận/huyện, phường/xã và nhập địa chỉ
								cụ thể
							</DialogDescription>
						</DialogHeader>

						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-6"
							>
								<div className="space-y-6">
									<VietnamAddressSelector
										control={form.control}
										defaultValues={
											vendorAddress
												? {
														province: vendorAddress.province,
														district: vendorAddress.district,
														ward: vendorAddress.ward,
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
														placeholder="Ví dụ: 123 Đường ABC, Khu phố 1"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="flex justify-end space-x-4 pt-4 border-t">
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsDialogOpen(false)}
									>
										Hủy
									</Button>
									<Button type="submit" disabled={isLoading}>
										{isLoading ? 'Đang lưu...' : 'Lưu địa chỉ'}
									</Button>
								</div>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			</CardContent>
		</Card>
	);
}
