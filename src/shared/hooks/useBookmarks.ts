import { createBookmark, deleteBookmark, getBookmarks, type BookmarkItem, type CreateBookmarkBody } from '@apis/bookmarks';
import { useAuth } from '@clerk/clerk-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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

export function useChangeBookmark() {
  const queryClient = useQueryClient();

  return async (target: CreateBookmarkBody, next: boolean, bookmarkId: number | undefined, token: string) => {
    if (next && bookmarkId === undefined) {
      await createBookmark(target, token);
    } else if (!next && bookmarkId !== undefined) {
      await deleteBookmark(bookmarkId, token);
    }
    await queryClient.invalidateQueries({ queryKey: BOOKMARKS_QUERY_KEY });
  };
}

export { BOOKMARKS_QUERY_KEY };
