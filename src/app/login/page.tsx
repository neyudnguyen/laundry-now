'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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

const loginSchema = z.object({
	phone: z
		.string()
		.min(10, 'Phone number must be at least 10 digits')
		.regex(/^[0-9]+$/, 'Phone number must contain only digits'),
	password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const [isLoading, setIsLoading] = useState(false);
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
				toast.error('Invalid phone number or password');
				return;
			}

			if (result?.ok) {
				toast.success('Login successful!');
				router.push('/dashboard');
				router.refresh();
			}
		} catch (error) {
			console.error('Login error:', error);
			toast.error('An error occurred during login');
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">
						Welcome Back
					</CardTitle>
					<CardDescription className="text-center">
						Sign in to your account to continue
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
										<FormLabel>Phone Number</FormLabel>
										<FormControl>
											<Input
												placeholder="Enter your phone number"
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
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="Enter your password"
												{...field}
												disabled={isLoading}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? 'Signing In...' : 'Sign In'}
							</Button>
						</form>
					</Form>

					<div className="mt-4 text-center text-sm">
						Don&apos;t have an account?{' '}
						<Link
							href="/register"
							className="underline underline-offset-4 hover:text-primary"
						>
							Create account
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
