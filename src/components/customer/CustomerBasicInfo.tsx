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
	fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
	phone: z.string().min(10, 'Số điện thoại phải có ít nhất 10 ký tự'),
	email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface CustomerBasicInfoProps {
	initialData?: {
		fullName?: string;
		phone?: string;
		email?: string;
	};
	onSuccess?: () => void;
}

export function CustomerBasicInfo({
	initialData,
	onSuccess,
}: CustomerBasicInfoProps) {
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			fullName: initialData?.fullName || '',
			phone: initialData?.phone || '',
			email: initialData?.email || '',
		},
	});

	const onSubmit = async (data: FormData) => {
		setIsLoading(true);
		try {
			const response = await fetch('/api/customer/profile', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Có lỗi xảy ra');
			}

			toast.success('Cập nhật thông tin thành công!');
			onSuccess?.();
		} catch (error) {
			console.error('Error updating profile:', error);
			toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Thông tin cơ bản</CardTitle>
				<CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="fullName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Họ và tên</FormLabel>
									<FormControl>
										<Input placeholder="Nhập họ và tên" {...field} />
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
										<Input type="email" placeholder="Nhập email" {...field} />
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
