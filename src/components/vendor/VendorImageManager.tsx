'use client';

import { ImageIcon, Plus, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

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
import { useToast } from '@/hooks/use-toast';

interface VendorImage {
	id: string;
	url: string;
}

interface VendorImageManagerProps {
	vendorImages?: VendorImage[];
	onSuccess?: () => void;
}

export function VendorImageManager({
	vendorImages = [],
	onSuccess,
}: VendorImageManagerProps) {
	const [images, setImages] = useState<VendorImage[]>(vendorImages);
	const [isUploading, setIsUploading] = useState(false);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const { toast } = useToast();

	// Update images when prop changes
	useEffect(() => {
		setImages(vendorImages);
	}, [vendorImages]);

	const handleFileSelect = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const files = event.target.files;
			if (!files || files.length === 0) return;

			const file = files[0];

			// Validate file type
			if (!file.type.startsWith('image/')) {
				toast.error('Vui lòng chọn file ảnh hợp lệ');
				return;
			}

			// Validate file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast.error('Kích thước file không được vượt quá 5MB');
				return;
			}

			setIsUploading(true);

			try {
				// Convert file to base64 for simple storage (in real app, you'd upload to cloud storage)
				const reader = new FileReader();
				reader.onload = async (e) => {
					const base64Url = e.target?.result as string;

					// Call API to save image
					const response = await fetch('/api/vendor/images', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ url: base64Url }),
					});

					if (response.ok) {
						const { image } = await response.json();
						setImages((prev) => [...prev, image]);
						toast.success('Ảnh đã được thêm thành công');
						onSuccess?.();
					} else {
						throw new Error('Failed to upload image');
					}
				};

				reader.onerror = () => {
					throw new Error('Failed to read file');
				};

				reader.readAsDataURL(file);
			} catch (error) {
				console.error('Error uploading image:', error);
				toast.error('Không thể tải ảnh lên');
			} finally {
				setIsUploading(false);
				// Reset input
				event.target.value = '';
			}
		},
		[toast, onSuccess],
	);

	const handleDeleteImage = async (imageId: string) => {
		try {
			const response = await fetch(`/api/vendor/images/${imageId}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				setImages((prev) => prev.filter((img) => img.id !== imageId));
				toast.success('Ảnh đã được xóa');
				onSuccess?.();
			} else {
				throw new Error('Failed to delete image');
			}
		} catch (error) {
			console.error('Error deleting image:', error);
			toast.error('Không thể xóa ảnh');
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Ảnh cửa hàng</CardTitle>
				<CardDescription>
					Thêm ảnh để khách hàng có thể thấy cửa hàng của bạn
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{/* Upload Button */}
					<div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
						<ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<p className="text-muted-foreground mb-4">
							Thêm ảnh cửa hàng (JPG, PNG, tối đa 5MB)
						</p>
						<label htmlFor="image-upload">
							<Button disabled={isUploading} className="cursor-pointer" asChild>
								<span>
									{isUploading ? (
										<>
											<Upload className="h-4 w-4 mr-2 animate-spin" />
											Đang tải...
										</>
									) : (
										<>
											<Plus className="h-4 w-4 mr-2" />
											Thêm ảnh
										</>
									)}
								</span>
							</Button>
						</label>
						<input
							id="image-upload"
							type="file"
							accept="image/*"
							onChange={handleFileSelect}
							disabled={isUploading}
							className="hidden"
						/>
					</div>

					{/* Images Grid */}
					{images.length > 0 && (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{images.map((image) => (
								<div
									key={image.id}
									className="relative group aspect-square rounded-lg overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity"
									onClick={() => setSelectedImage(image.url)}
								>
									<Image
										src={image.url}
										alt="Ảnh cửa hàng"
										fill
										className="object-cover"
									/>
									<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
										<Button
											variant="destructive"
											size="sm"
											className="opacity-0 group-hover:opacity-100 transition-opacity"
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteImage(image.id);
											}}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}

					{images.length === 0 && (
						<div className="text-center py-8 text-muted-foreground">
							Chưa có ảnh nào. Hãy thêm ảnh đầu tiên của cửa hàng!
						</div>
					)}
				</div>

				{/* Image Preview Dialog */}
				<Dialog
					open={!!selectedImage}
					onOpenChange={() => setSelectedImage(null)}
				>
					<DialogContent className="max-w-4xl">
						<DialogHeader>
							<DialogTitle>Xem ảnh</DialogTitle>
							<DialogDescription>Ảnh cửa hàng của bạn</DialogDescription>
						</DialogHeader>
						{selectedImage && (
							<div className="flex justify-center relative max-w-full max-h-[70vh]">
								<Image
									src={selectedImage}
									alt="Ảnh cửa hàng"
									width={800}
									height={600}
									className="max-w-full max-h-[70vh] object-contain"
								/>
							</div>
						)}
					</DialogContent>
				</Dialog>
			</CardContent>
		</Card>
	);
}
