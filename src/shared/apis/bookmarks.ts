const BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

export type BookmarkTargetType = 'PROJECT' | 'DEVELOPER';

export type BookmarkItem = {
  bookmarkId: number;
  targetType: BookmarkTargetType;
  targetId?: number;
  targetNickname?: string;
  createdAt: string;
};

type GetBookmarksResponse = {
  isSuccess?: boolean;
  result?: { bookmarks?: BookmarkItem[] };
  message?: string;
};

export async function getBookmarks(token: string): Promise<BookmarkItem[]> {
  const res = await fetch(`${BASE_URL}/api/v1/bookmarks`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = (await res.json().catch(() => null)) as GetBookmarksResponse | null;
  if (!res.ok) {
    const message = json?.message ?? `요청 실패 (${res.status})`;
    throw new Error(message);
  }
  return json?.result?.bookmarks ?? [];
}

export type CreateBookmarkBody =
  | { targetType: 'PROJECT'; targetId: number }
  | { targetType: 'DEVELOPER'; targetNickname: string };

type CreateBookmarkResponse = {
  isSuccess?: boolean;
  result?: { bookmarkId: number };
  message?: string;
};

export async function createBookmark(
  body: CreateBookmarkBody,
  token: string,
): Promise<{ bookmarkId: number }> {
  const res = await fetch(`${BASE_URL}/api/v1/bookmarks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json().catch(() => null)) as CreateBookmarkResponse | null;
  if (!res.ok) {
    const message = json?.message ?? `요청 실패 (${res.status})`;
    throw new Error(message);
  }
  const bookmarkId = json?.result?.bookmarkId;
  if (bookmarkId == null) throw new Error('북마크 ID 없음');
  return { bookmarkId };
}

export async function deleteBookmark(bookmarkId: number, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/v1/bookmarks/${bookmarkId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const json = (await res.json().catch(() => null)) as { message?: string } | null;
    const message = json?.message ?? `요청 실패 (${res.status})`;
    throw new Error(message);
  }
}
