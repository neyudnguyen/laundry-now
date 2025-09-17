'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { UserRole } from '@prisma/client';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks';

// Customer registration schema
const customerSchema = z
	.object({
		fullName: z
			.string()
			.min(2, 'Tên phải có ít nhất 2 ký tự')
			.max(50, 'Tên không được vượt quá 50 ký tự'),
		phone: z
			.string()
			.min(10, 'Số điện thoại phải có ít nhất 10 số')
			.max(15, 'Số điện thoại không được vượt quá 15 số')
			.regex(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số'),
		password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
		confirmPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Mật khẩu không khớp',
		path: ['confirmPassword'],
	});

// Vendor registration schema
const vendorSchema = z
	.object({
		shopName: z
			.string()
			.min(2, 'Tên cửa hàng phải có ít nhất 2 ký tự')
			.max(100, 'Tên cửa hàng không được vượt quá 100 ký tự'),
		phone: z
			.string()
			.min(10, 'Số điện thoại phải có ít nhất 10 số')
			.max(15, 'Số điện thoại không được vượt quá 15 số')
			.regex(/^[0-9]+$/, 'Số điện thoại chỉ được chứa số'),
		password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
		confirmPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Mật khẩu không khớp',
		path: ['confirmPassword'],
	});

type CustomerFormValues = z.infer<typeof customerSchema>;
type VendorFormValues = z.infer<typeof vendorSchema>;

export default function RegisterPage() {
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();
	const router = useRouter();

	const customerForm = useForm<CustomerFormValues>({
		resolver: zodResolver(customerSchema),
		defaultValues: {
			fullName: '',
			phone: '',
			password: '',
			confirmPassword: '',
		},
	});

	const vendorForm = useForm<VendorFormValues>({
		resolver: zodResolver(vendorSchema),
		defaultValues: {
			shopName: '',
			phone: '',
			password: '',
			confirmPassword: '',
		},
	});

	async function onCustomerSubmit(values: CustomerFormValues) {
		setIsLoading(true);

		try {
			const response = await fetch('/api/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					...values,
					role: UserRole.CUSTOMER,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				toast.error(data.error || 'Đăng ký thất bại');
				return;
			}

			toast.success('Đăng ký thành công!');

			// Automatically sign in the user
			const signInResult = await signIn('credentials', {
				phone: values.phone,
				password: values.password,
				redirect: false,
			});

			if (signInResult?.ok) {
				router.push('/dashboard');
				router.refresh();
			} else {
				toast.error('Tự động đăng nhập thất bại. Vui lòng đăng nhập thủ công.');
				router.push('/login');
			}
		} catch (error) {
			console.error('Registration error:', error);
			toast.error('Đã xảy ra lỗi trong quá trình đăng ký');
		} finally {
			setIsLoading(false);
		}
	}

	async function onVendorSubmit(values: VendorFormValues) {
		setIsLoading(true);

		try {
			const response = await fetch('/api/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					...values,
					role: UserRole.VENDOR,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				toast.error(data.error || 'Đăng ký thất bại');
				return;
			}

			toast.success('Đăng ký thành công!');

			// Automatically sign in the user
			const signInResult = await signIn('credentials', {
				phone: values.phone,
				password: values.password,
				redirect: false,
			});

			if (signInResult?.ok) {
				router.push('/dashboard');
				router.refresh();
			} else {
				toast.error('Tự động đăng nhập thất bại. Vui lòng đăng nhập thủ công.');
				router.push('/login');
			}
		} catch (error) {
			console.error('Registration error:', error);
			toast.error('Đã xảy ra lỗi trong quá trình đăng ký');
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex items-center justify-center mx-4 my-20">
			<Card className="w-full max-w-lg">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">
						Đăng Ký Tài Khoản
					</CardTitle>
					<CardDescription className="text-center">
						Chọn loại tài khoản bạn muốn tạo
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="customer" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="customer">Cần Giặt Ủi</TabsTrigger>
							<TabsTrigger value="vendor">Dịch Vụ Giặt Ủi</TabsTrigger>
						</TabsList>

						<TabsContent value="customer" className="space-y-4">
							<Form {...customerForm}>
								<form
									onSubmit={customerForm.handleSubmit(onCustomerSubmit)}
									className="space-y-4"
								>
									<FormField
										control={customerForm.control}
										name="fullName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Họ và tên</FormLabel>
												<FormControl>
													<Input
														placeholder="Nhập họ và tên của bạn"
														{...field}
														disabled={isLoading}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={customerForm.control}
										name="phone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Số điện thoại</FormLabel>
												<FormControl>
													<Input
														placeholder="Nhập số điện thoại"
														{...field}
														disabled={isLoading}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={customerForm.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Mật khẩu</FormLabel>
												<FormControl>
													<Input
														type="password"
														placeholder="Nhập mật khẩu"
														{...field}
														disabled={isLoading}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={customerForm.control}
										name="confirmPassword"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Xác nhận mật khẩu</FormLabel>
												<FormControl>
													<Input
														type="password"
														placeholder="Nhập lại mật khẩu"
														{...field}
														disabled={isLoading}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<Button type="submit" className="w-full" disabled={isLoading}>
										{isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
									</Button>
								</form>
							</Form>
						</TabsContent>

						<TabsContent value="vendor" className="space-y-4">
							<Form {...vendorForm}>
								<form
									onSubmit={vendorForm.handleSubmit(onVendorSubmit)}
									className="space-y-4"
								>
									<FormField
										control={vendorForm.control}
										name="shopName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Tên cửa hàng</FormLabel>
												<FormControl>
													<Input
														placeholder="Nhập tên cửa hàng"
														{...field}
														disabled={isLoading}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={vendorForm.control}
										name="phone"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Số điện thoại</FormLabel>
												<FormControl>
													<Input
														placeholder="Nhập số điện thoại"
														{...field}
														disabled={isLoading}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={vendorForm.control}
										name="password"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Mật khẩu</FormLabel>
												<FormControl>
													<Input
														type="password"
														placeholder="Nhập mật khẩu"
														{...field}
														disabled={isLoading}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={vendorForm.control}
										name="confirmPassword"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Xác nhận mật khẩu</FormLabel>
												<FormControl>
													<Input
														type="password"
														placeholder="Nhập lại mật khẩu"
														{...field}
														disabled={isLoading}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<Button type="submit" className="w-full" disabled={isLoading}>
										{isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
									</Button>
								</form>
							</Form>
						</TabsContent>
					</Tabs>

					<div className="mt-4 text-center text-sm">
						Đã có tài khoản?{' '}
						<Link
							href="/login"
							className="underline underline-offset-4 hover:text-primary"
						>
							Đăng nhập
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
