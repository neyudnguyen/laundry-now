'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { useToast } from '@/hooks';

const loginSchema = z.object({
	phone: z
		.string()
		.min(10, 'Số điện thoại phải có ít nhất 10 số')
		.regex(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số'),
	password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();
	const router = useRouter();

	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			phone: '',
			password: '',
		},
	});

	async function onSubmit(values: LoginFormValues) {
		setIsLoading(true);

		try {
			const result = await signIn('credentials', {
				phone: values.phone,
				password: values.password,
				redirect: false,
			});

			if (result?.error) {
				toast.error('Số điện thoại hoặc mật khẩu không hợp lệ');
				return;
			}

			if (result?.ok) {
				toast.success('Đăng nhập thành công!');
				router.push('/dashboard');
				router.refresh();
			}
		} catch (error) {
			console.error('Login error:', error);
			toast.error('Đã xảy ra lỗi trong quá trình đăng nhập');
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex items-center justify-center mx-4 my-20">
			<Card className="w-full max-w-lg">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">
						Chào Mừng Trở Lại
					</CardTitle>
					<CardDescription className="text-center">
						Đăng nhập vào tài khoản của bạn để tiếp tục
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="phone"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Số Điện Thoại</FormLabel>
										<FormControl>
											<Input
												placeholder="Nhập số điện thoại của bạn"
												{...field}
												disabled={isLoading}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Mật Khẩu</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="Nhập mật khẩu của bạn"
												{...field}
												disabled={isLoading}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
							</Button>
						</form>
					</Form>

					<div className="mt-4 text-center text-sm">
						Chưa có tài khoản?{' '}
						<Link
							href="/register"
							className="underline underline-offset-4 hover:text-primary"
						>
							Tạo tài khoản
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
