'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	type District,
	type Province,
	type Ward,
	getDistrictsByProvince,
	getProvinces,
	getWardsByDistrict,
} from '@/lib/address-data';

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
		email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
		province: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
		district: z.string().min(1, 'Vui lòng chọn quận/huyện'),
		ward: z.string().min(1, 'Vui lòng chọn phường/xã'),
		street: z
			.string()
			.min(1, 'Vui lòng nhập số nhà và tên đường')
			.max(100, 'Địa chỉ không được vượt quá 100 ký tự'),
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
		email: z.string().email('Email không hợp lệ').min(1, 'Email là bắt buộc'),
		province: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
		district: z.string().min(1, 'Vui lòng chọn quận/huyện'),
		ward: z.string().min(1, 'Vui lòng chọn phường/xã'),
		street: z
			.string()
			.min(1, 'Vui lòng nhập số nhà và tên đường')
			.max(100, 'Địa chỉ không được vượt quá 100 ký tự'),
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
	const [provinces] = useState<Province[]>(getProvinces());
	const [customerDistricts, setCustomerDistricts] = useState<District[]>([]);
	const [customerWards, setCustomerWards] = useState<Ward[]>([]);
	const [vendorDistricts, setVendorDistricts] = useState<District[]>([]);
	const [vendorWards, setVendorWards] = useState<Ward[]>([]);
	const router = useRouter();

	const customerForm = useForm<CustomerFormValues>({
		resolver: zodResolver(customerSchema),
		defaultValues: {
			fullName: '',
			phone: '',
			email: '',
			province: '',
			district: '',
			ward: '',
			street: '',
			password: '',
			confirmPassword: '',
		},
	});

	const vendorForm = useForm<VendorFormValues>({
		resolver: zodResolver(vendorSchema),
		defaultValues: {
			shopName: '',
			phone: '',
			email: '',
			province: '',
			district: '',
			ward: '',
			street: '',
			password: '',
			confirmPassword: '',
		},
	});

	// Customer address handling
	const handleCustomerProvinceChange = (value: string) => {
		customerForm.setValue('province', value);
		customerForm.setValue('district', '');
		customerForm.setValue('ward', '');
		setCustomerDistricts(getDistrictsByProvince(value));
		setCustomerWards([]);
	};

	const handleCustomerDistrictChange = (value: string) => {
		customerForm.setValue('district', value);
		customerForm.setValue('ward', '');
		const provinceId = customerForm.getValues('province');
		setCustomerWards(getWardsByDistrict(provinceId, value));
	};

	// Vendor address handling
	const handleVendorProvinceChange = (value: string) => {
		vendorForm.setValue('province', value);
		vendorForm.setValue('district', '');
		vendorForm.setValue('ward', '');
		setVendorDistricts(getDistrictsByProvince(value));
		setVendorWards([]);
	};

	const handleVendorDistrictChange = (value: string) => {
		vendorForm.setValue('district', value);
		vendorForm.setValue('ward', '');
		const provinceId = vendorForm.getValues('province');
		setVendorWards(getWardsByDistrict(provinceId, value));
	};

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
					role: 'CUSTOMER',
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
					role: 'VENDOR',
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
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
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
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email (Tùy chọn)</FormLabel>
												<FormControl>
													<Input
														type="email"
														placeholder="Nhập email (không bắt buộc)"
														{...field}
														disabled={isLoading}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Address Fields */}
									<FormField
										control={customerForm.control}
										name="province"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Tỉnh/Thành phố</FormLabel>
												<Select
													onValueChange={handleCustomerProvinceChange}
													disabled={isLoading}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Chọn tỉnh/thành phố" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{provinces.map((province) => (
															<SelectItem key={province.id} value={province.id}>
																{province.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={customerForm.control}
										name="district"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Quận/Huyện</FormLabel>
												<Select
													onValueChange={handleCustomerDistrictChange}
													disabled={isLoading || customerDistricts.length === 0}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Chọn quận/huyện" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{customerDistricts.map((district) => (
															<SelectItem key={district.id} value={district.id}>
																{district.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={customerForm.control}
										name="ward"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Phường/Xã</FormLabel>
												<Select
													onValueChange={field.onChange}
													disabled={isLoading || customerWards.length === 0}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Chọn phường/xã" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{customerWards.map((ward) => (
															<SelectItem key={ward.id} value={ward.id}>
																{ward.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={customerForm.control}
										name="street"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Số nhà, tên đường</FormLabel>
												<FormControl>
													<Input
														placeholder="Nhập số nhà và tên đường"
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
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input
														type="email"
														placeholder="Nhập email"
														{...field}
														disabled={isLoading}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{/* Address Fields */}
									<FormField
										control={vendorForm.control}
										name="province"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Tỉnh/Thành phố</FormLabel>
												<Select
													onValueChange={handleVendorProvinceChange}
													disabled={isLoading}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Chọn tỉnh/thành phố" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{provinces.map((province) => (
															<SelectItem key={province.id} value={province.id}>
																{province.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={vendorForm.control}
										name="district"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Quận/Huyện</FormLabel>
												<Select
													onValueChange={handleVendorDistrictChange}
													disabled={isLoading || vendorDistricts.length === 0}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Chọn quận/huyện" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{vendorDistricts.map((district) => (
															<SelectItem key={district.id} value={district.id}>
																{district.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={vendorForm.control}
										name="ward"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Phường/Xã</FormLabel>
												<Select
													onValueChange={field.onChange}
													disabled={isLoading || vendorWards.length === 0}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Chọn phường/xã" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{vendorWards.map((ward) => (
															<SelectItem key={ward.id} value={ward.id}>
																{ward.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={vendorForm.control}
										name="street"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Số nhà, tên đường</FormLabel>
												<FormControl>
													<Input
														placeholder="Nhập số nhà và tên đường"
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
