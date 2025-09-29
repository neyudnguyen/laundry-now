import bcrypt from 'bcryptjs';
import NextAuth, { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { authConfig } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

const fullAuthConfig = {
	...authConfig,
	providers: [
		Credentials({
			id: 'credentials',
			name: 'credentials',
			credentials: {
				phone: { label: 'Phone', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.phone || !credentials?.password) {
					return null;
				}

				try {
					const user = await prisma.user.findUnique({
						where: {
							phone: credentials.phone as string,
						},
						include: {
							customerProfile: true,
						},
					});

					if (!user) {
						return null;
					}

					const isPasswordValid = await bcrypt.compare(
						credentials.password as string,
						user.password,
					);

					if (!isPasswordValid) {
						return null;
					}

					// Allow both customers and vendors to login
					if (user.role !== 'CUSTOMER' && user.role !== 'VENDOR') {
						return null;
					}

					return {
						id: user.id,
						phone: user.phone,
						role: user.role,
						email: user.email,
					};
				} catch (error) {
					console.error('Authentication error:', error);
					return null;
				}
			},
		}),
		Credentials({
			id: 'admin-credentials',
			name: 'admin-credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				try {
					const admin = await prisma.admin.findUnique({
						where: {
							email: credentials.email as string,
						},
					});

					if (!admin) {
						return null;
					}

					const isPasswordValid = await bcrypt.compare(
						credentials.password as string,
						admin.password,
					);

					if (!isPasswordValid) {
						return null;
					}

					return {
						id: admin.id,
						email: admin.email,
						name: admin.name,
						role: 'ADMIN',
						phone: undefined, // Admin doesn't have phone
					};
				} catch (error) {
					console.error('Admin authentication error:', error);
					return null;
				}
			},
		}),
	],
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(fullAuthConfig);
