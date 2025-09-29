import { NextAuthConfig } from 'next-auth';

export const authConfig = {
	pages: {
		signIn: '/login',
	},
	callbacks: {
		authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user;
			const isOnCustomerDashboard = nextUrl.pathname.startsWith('/customer');
			const isOnVendorDashboard = nextUrl.pathname.startsWith('/vendor');
			const isOnAdminDashboard = nextUrl.pathname.startsWith('/admin');
			const isOnOldDashboard = nextUrl.pathname.startsWith('/dashboard');

			// Admin routes
			if (isOnAdminDashboard) {
				if (nextUrl.pathname === '/admin/login') {
					// Allow access to admin login page
					return true;
				}
				// For other admin pages, check if logged in as admin
				if (isLoggedIn && auth.user.role === 'ADMIN') return true;
				return false; // Redirect unauthenticated or non-admin users
			}

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
				} else if (userRole === 'ADMIN') {
					return Response.redirect(new URL('/admin/dashboard', nextUrl));
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
				token.name = user.name;
			}
			return token;
		},
		session({ session, token }) {
			session.user.id = token.id as string;
			session.user.phone = token.phone as string;
			session.user.role = token.role as string;
			session.user.name = token.name as string;
			return session;
		},
	},
	providers: [], // Middleware không cần providers
} satisfies NextAuthConfig;
