'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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

interface ChangePasswordFormProps {
	userRole: 'customer' | 'vendor';
}

export const ChangePasswordForm = ({ userRole }: ChangePasswordFormProps) => {
	const [formData, setFormData] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [showPasswords, setShowPasswords] = useState({
		current: false,
		new: false,
		confirm: false,
	});
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate passwords
		if (formData.newPassword !== formData.confirmPassword) {
			toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp');
			return;
		}

		if (formData.newPassword.length < 6) {
			toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch(`/api/${userRole}/change-password`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					currentPassword: formData.currentPassword,
					newPassword: formData.newPassword,
				}),
			});

			const data = await response.json();

			if (response.ok) {
				toast.success('Đổi mật khẩu thành công');
				setFormData({
					currentPassword: '',
					newPassword: '',
					confirmPassword: '',
				});
			} else {
				toast.error(data.error || 'Không thể đổi mật khẩu');
			}
		} catch (error) {
			console.error('Error changing password:', error);
			toast.error('Có lỗi xảy ra khi đổi mật khẩu');
		} finally {
			setIsLoading(false);
		}
	};

	const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
		setShowPasswords((prev) => ({
			...prev,
			[field]: !prev[field],
		}));
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Đổi mật khẩu</CardTitle>
				<CardDescription>Cập nhật mật khẩu của tài khoản</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Current Password */}
					<div className="space-y-2">
						<Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
						<div className="relative">
							<Input
								id="currentPassword"
								type={showPasswords.current ? 'text' : 'password'}
								value={formData.currentPassword}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										currentPassword: e.target.value,
									}))
								}
								placeholder="Nhập mật khẩu hiện tại"
								required
							/>
							<button
								type="button"
								onClick={() => togglePasswordVisibility('current')}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							>
								{showPasswords.current ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</button>
						</div>
					</div>

					{/* New Password */}
					<div className="space-y-2">
						<Label htmlFor="newPassword">Mật khẩu mới</Label>
						<div className="relative">
							<Input
								id="newPassword"
								type={showPasswords.new ? 'text' : 'password'}
								value={formData.newPassword}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										newPassword: e.target.value,
									}))
								}
								placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
								required
								minLength={6}
							/>
							<button
								type="button"
								onClick={() => togglePasswordVisibility('new')}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							>
								{showPasswords.new ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</button>
						</div>
					</div>

					{/* Confirm Password */}
					<div className="space-y-2">
						<Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
						<div className="relative">
							<Input
								id="confirmPassword"
								type={showPasswords.confirm ? 'text' : 'password'}
								value={formData.confirmPassword}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										confirmPassword: e.target.value,
									}))
								}
								placeholder="Nhập lại mật khẩu mới"
								required
								minLength={6}
							/>
							<button
								type="button"
								onClick={() => togglePasswordVisibility('confirm')}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							>
								{showPasswords.confirm ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</button>
						</div>
					</div>

					<Button type="submit" disabled={isLoading} className="w-full">
						{isLoading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
};
