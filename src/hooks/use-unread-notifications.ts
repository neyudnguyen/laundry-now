import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';

export function useUnreadNotifications() {
	const [unreadCount, setUnreadCount] = useState<number>(0);
	const [loading, setLoading] = useState(true);
	const { data: session } = useSession();

	const fetchUnreadCount = useCallback(async () => {
		if (!session?.user?.id) {
			setUnreadCount(0);
			setLoading(false);
			return;
		}

		try {
			const response = await fetch(
				'/api/notifications?unreadOnly=true&limit=1',
			);
			if (response.ok) {
				const data = await response.json();
				setUnreadCount(data.pagination?.totalCount || 0);
			}
		} catch (error) {
			console.error('Error fetching unread notifications:', error);
		} finally {
			setLoading(false);
		}
	}, [session?.user?.id]);

	useEffect(() => {
		fetchUnreadCount();

		// Refresh every 30 seconds
		const interval = setInterval(fetchUnreadCount, 30000);

		return () => clearInterval(interval);
	}, [fetchUnreadCount]);

	return { unreadCount, loading, refetch: fetchUnreadCount };
}
