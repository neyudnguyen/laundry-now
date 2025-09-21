import bcrypt from 'bcryptjs';
import NextAuth, { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { prisma } from '@/lib/prisma';

export const authConfig = {
	pages: {
		signIn: '/login',
	},
	callbacks: {
		authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user;
			const isOnCustomerDashboard = nextUrl.pathname.startsWith('/customer');
			const isOnVendorDashboard = nextUrl.pathname.startsWith('/vendor');
			const isOnOldDashboard = nextUrl.pathname.startsWith('/dashboard');

			if (isOnCustomerDashboard || isOnVendorDashboard || isOnOldDashboard) {
				if (isLoggedIn) return true;
				return false; // Redirect unauthenticated users to login page
			} else if (isLoggedIn) {
				// Redirect based on user role
				const userRole = auth.user.role;
				if (userRole === 'CUSTOMER') {
					return Response.redirect(new URL('/customer/marketplace', nextUrl));
				} else if (userRole === 'VENDOR') {
					return Response.redirect(new URL('/vendor/dashboard', nextUrl));
				}
				return Response.redirect(new URL('/customer/marketplace', nextUrl)); // Default fallback
			}
			return true;
		},
		jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.phone = user.phone;
				token.role = user.role;
			}
			return token;
		},
		session({ session, token }) {
			session.user.id = token.id as string;
			session.user.phone = token.phone as string;
			session.user.role = token.role as string;
			return session;
		},
	},
	providers: [
		Credentials({
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
	],
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
