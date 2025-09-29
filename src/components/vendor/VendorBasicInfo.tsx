'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
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

const formSchema = z.object({
	shopName: z.string().min(1, 'Tên cửa hàng là bắt buộc'),
	phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 số'),
	email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface VendorBasicInfoProps {
	initialData: {
		shopName: string;
		phone: string;
		email: string;
	};
	onSuccess?: () => void;
}

export function VendorBasicInfo({
	initialData,
	onSuccess,
}: VendorBasicInfoProps) {
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			shopName: initialData.shopName || '',
			phone: initialData.phone || '',
			email: initialData.email || '',
		},
	});

	const onSubmit = async (data: FormData) => {
		setIsLoading(true);
		try {
			const response = await fetch('/api/vendor/profile', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (response.ok) {
				toast.success('Thông tin cửa hàng đã được cập nhật');
				onSuccess?.();
			} else {
				throw new Error('Failed to update profile');
			}
		} catch (error) {
			console.error('Error updating vendor profile:', error);
			toast.error('Không thể cập nhật thông tin cửa hàng');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Thông tin cửa hàng</CardTitle>
				<CardDescription>
					Cập nhật thông tin cơ bản của cửa hàng
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="shopName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Tên cửa hàng</FormLabel>
									<FormControl>
										<Input placeholder="Nhập tên cửa hàng" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Số điện thoại</FormLabel>
									<FormControl>
										<Input placeholder="Nhập số điện thoại" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email (tùy chọn)</FormLabel>
									<FormControl>
										<Input placeholder="Nhập email" type="email" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button type="submit" disabled={isLoading} className="w-full">
							{isLoading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
						</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
