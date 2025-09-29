import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
	try {
		const session = await auth();

		if (!session?.user?.id || session.user.role !== 'VENDOR') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get vendor profile with images
		const vendorProfile = await prisma.vendorProfile.findUnique({
			where: { userId: session.user.id },
			include: {
				images: true,
			},
		});

		if (!vendorProfile) {
			return NextResponse.json(
				{ error: 'Vendor profile not found' },
				{ status: 404 },
			);
		}

		return NextResponse.json({ images: vendorProfile.images });
	} catch (error) {
		console.error('Error fetching vendor images:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth();

		if (!session?.user?.id || session.user.role !== 'VENDOR') {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { url } = body;

		if (!url) {
			return NextResponse.json(
				{ error: 'Image URL is required' },
				{ status: 400 },
			);
		}

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

		// Create new vendor image
		const vendorImage = await prisma.vendorImage.create({
			data: {
				url,
				vendorId: vendorProfile.id,
			},
		});

		return NextResponse.json({ image: vendorImage });
	} catch (error) {
		console.error('Error creating vendor image:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}
