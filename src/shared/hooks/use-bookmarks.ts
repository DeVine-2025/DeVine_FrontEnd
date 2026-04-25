import { getBookmarks, type BookmarkItem } from '@apis/bookmarks';
import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';

const BOOKMARKS_QUERY_KEY = ['bookmarks'] as const;

export function useBookmarks(options?: { enabled?: boolean }) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: BOOKMARKS_QUERY_KEY,
    queryFn: async (): Promise<BookmarkItem[]> => {
      const token = await getToken();
      if (!token) return [];
      return getBookmarks(token);
    },
    enabled: options?.enabled ?? isSignedIn ?? false,
    staleTime: 60_000,
  });
}

export { BOOKMARKS_QUERY_KEY };
