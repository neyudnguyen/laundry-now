'use client';

import { Eye, EyeOff, Shield } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function AdminLoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();
	const { toast } = useToast();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!email || !password) {
			toast.error('Lỗi', {
				description: 'Vui lòng điền đầy đủ thông tin đăng nhập',
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const result = await signIn('admin-credentials', {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				toast.error('Email hoặc mật khẩu không chính xác');
			} else if (result?.ok) {
				toast.success('Đăng nhập thành công');
				router.push('/admin/dashboard');
			}
		} catch {
			toast.error('Có lỗi xảy ra khi đăng nhập');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1 text-center">
					<div className="flex justify-center mb-4">
						<div className="p-3 bg-primary/10 rounded-full">
							<Shield className="h-8 w-8 text-primary" />
						</div>
					</div>
					<CardTitle className="text-2xl font-bold">Đăng nhập Admin</CardTitle>
					<CardDescription>
						Vui lòng đăng nhập để truy cập hệ thống quản lý
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="admin@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={isSubmitting}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Mật khẩu</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? 'text' : 'password'}
									placeholder="Nhập mật khẩu"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									disabled={isSubmitting}
									required
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
									onClick={() => setShowPassword(!showPassword)}
									disabled={isSubmitting}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4 text-muted-foreground" />
									) : (
										<Eye className="h-4 w-4 text-muted-foreground" />
									)}
								</Button>
							</div>
						</div>
						<Button type="submit" className="w-full" disabled={isSubmitting}>
							{isSubmitting ? (
								<div className="flex items-center gap-2">
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
									Đang đăng nhập...
								</div>
							) : (
								'Đăng nhập'
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
