import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to upload image to Supabase Storage
export const uploadImage = async (file: File, vendorId: string) => {
	const fileExt = file.name.split('.').pop();
	const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
	const filePath = `exe2/vendor-${vendorId}/${fileName}`;

	const { error } = await supabase.storage
		.from('images')
		.upload(filePath, file, {
			cacheControl: '3600',
			upsert: false,
		});

	if (error) {
		throw error;
	}

	// Get public URL
	const { data: publicUrlData } = supabase.storage
		.from('images')
		.getPublicUrl(filePath);

	return publicUrlData.publicUrl;
};

// Helper function to delete image from Supabase Storage
export const deleteImageFromUrl = async (imageUrl: string) => {
	// Extract file path from Supabase URL
	// Format: https://xxx.supabase.co/storage/v1/object/public/images/exe2/vendor-xxx/filename.jpg
	const urlParts = imageUrl.split('/storage/v1/object/public/images/');
	if (urlParts.length !== 2) {
		throw new Error('Invalid Supabase image URL');
	}

	const filePath = urlParts[1];

	const { error } = await supabase.storage.from('images').remove([filePath]);

	if (error) {
		throw error;
	}
};
