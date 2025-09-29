import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'bbsthlwqbrwfaxmwxieh.supabase.co',
				pathname: '/storage/v1/object/public/**',
			},
		],
		// Allow any external images for development
		dangerouslyAllowSVG: true,
		contentDispositionType: 'attachment',
	},
};

export default nextConfig;
