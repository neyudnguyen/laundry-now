'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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

const bankingSchema = z.object({
	bankName: z.string().min(1, 'Tên ngân hàng là bắt buộc'),
	bankNumber: z
		.string()
		.min(8, 'Số tài khoản phải có ít nhất 8 số')
		.max(20, 'Số tài khoản không được quá 20 số')
		.regex(/^\d+$/, 'Số tài khoản chỉ được chứa số'),
	bankHolder: z.string().min(1, 'Tên chủ tài khoản là bắt buộc'),
});

type BankingFormValues = z.infer<typeof bankingSchema>;

interface VendorBankingInfoProps {
	initialData: {
		bankName: string;
		bankNumber: string;
		bankHolder: string;
	};
	onSuccess?: () => void;
}

export function VendorBankingInfo({
	initialData,
	onSuccess,
}: VendorBankingInfoProps) {
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();

	const form = useForm<BankingFormValues>({
		resolver: zodResolver(bankingSchema),
		defaultValues: initialData,
	});

	const onSubmit = async (data: BankingFormValues) => {
		setIsLoading(true);
		try {
			const response = await fetch('/api/vendor/banking', {
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

			toast.success('Cập nhật thông tin ngân hàng thành công');
			onSuccess?.();
		} catch (error) {
			console.error('Error updating banking info:', error);
			toast.error(
				error instanceof Error
					? error.message
					: 'Không thể cập nhật thông tin ngân hàng',
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Thông tin ngân hàng</CardTitle>
				<CardDescription>
					Cập nhật thông tin tài khoản ngân hàng để nhận thanh toán
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<FormField
								control={form.control}
								name="bankName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tên ngân hàng *</FormLabel>
										<FormControl>
											<Input
												placeholder="VD: Vietcombank, BIDV, Techcombank..."
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="bankHolder"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tên chủ tài khoản *</FormLabel>
										<FormControl>
											<Input
												placeholder="VD: NGUYEN VAN A"
												{...field}
												style={{ textTransform: 'uppercase' }}
												onChange={(e) => {
													field.onChange(e.target.value.toUpperCase());
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="bankNumber"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Số tài khoản *</FormLabel>
									<FormControl>
										<Input
											placeholder="VD: 1234567890"
											{...field}
											maxLength={20}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end">
							<Button type="submit" disabled={isLoading}>
								{isLoading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
