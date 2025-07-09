import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
	experimental: {
		reactCompiler: true,
	},
	serverExternalPackages: ['@node-rs/argon2', 'probe-image-size'],
	env: {
		DATABASE_URL: process.env.DATABASE_URL,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '*.r2.cloudflarestorage.com',
				port: '',
				pathname: '/**',
			},
		],
	},
};

export default withNextIntl(nextConfig);
