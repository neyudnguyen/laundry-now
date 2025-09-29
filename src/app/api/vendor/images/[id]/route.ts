import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteImageFromUrl } from '@/lib/supabase';

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const session = await auth();

		if (!session?.user?.id || session.user.role !== 'VENDOR') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const imageId = params.id;

		// Get vendor profile
		const vendorProfile = await prisma.vendorProfile.findUnique({
			where: { userId: session.user.id },
		});

		if (!vendorProfile) {
			return NextResponse.json(
				{ error: 'Vendor profile not found' },
				{ status: 404 },
			);
		}

		// Find the image first to get URL
		const image = await prisma.vendorImage.findFirst({
			where: {
				id: imageId,
				vendorId: vendorProfile.id,
			},
		});

		if (!image) {
			return NextResponse.json(
				{ error: 'Image not found or not owned by vendor' },
				{ status: 404 },
			);
		}

		// Delete from Supabase Storage
		try {
			await deleteImageFromUrl(image.url);
		} catch (storageError) {
			console.error('Error deleting from storage:', storageError);
			// Continue with database deletion even if storage deletion fails
		}

		// Delete from database
		await prisma.vendorImage.delete({
			where: { id: imageId },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting vendor image:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
