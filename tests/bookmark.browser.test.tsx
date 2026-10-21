import { userEvent } from '@vitest/browser/context';
import { StrictMode, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createBookmark, deleteBookmark } from '../src/shared/apis/bookmarks';
import BookmarkButton from '../src/shared/components/common/BookmarkButton';
import { BookmarkAnimationContext } from '../src/shared/components/common/bookmark-animation-context';
import { BOOKMARK_PATHS } from '../src/shared/components/common/bookmark-motion';
import { gsap } from '../src/shared/libs/gsap';

let host: HTMLDivElement;
let root: Root;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const commit = async (callback: () => unknown) => {
  flushSync(() => {
    void callback();
  });
  await wait(0);
};
const button = (name = '첫 번째') =>
  host.querySelector<HTMLButtonElement>(`button[aria-label^="${name}"]`)!;
const stage = (name = '첫 번째') =>
  button(name).querySelector<HTMLSpanElement>('.bookmark-ribbon')!;
const settled = async (name = '첫 번째') =>
  vi.waitFor(() => expect(button(name).getAttribute('aria-disabled')).toBe('false'), {
    timeout: 4000,
  });

function Controlled({
  initial = false,
  onChange,
}: {
  initial?: boolean;
  onChange?: (next: boolean) => Promise<void>;
}) {
  const [saved, setSaved] = useState(initial);
  return (
    <BookmarkButton
      aria-label="첫 번째"
      bookmarked={saved}
      onBookmarkChange={async (next) => {
        await onChange?.(next);
        setSaved(next);
      }}
    />
  );
}

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await commit(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});

describe('controlled morphing bookmark in a real browser', () => {
  it('uses the existing bookmark POST/DELETE API and retains its returned bookmark ID', async () => {
    const fetchMock = vi
      .spyOn(window, 'fetch')
      .mockImplementation(
        async (_url, options) =>
          new Response(
            options?.method === 'POST'
              ? JSON.stringify({ isSuccess: true, result: { bookmarkId: 731 } })
              : null,
            { status: options?.method === 'POST' ? 200 : 204 },
          ),
      );
    let bookmarkId: number | undefined;
    await commit(async () =>
      root.render(
        <Controlled
          onChange={async (next) => {
            if (next)
              bookmarkId = (
                await createBookmark({ targetType: 'PROJECT', targetId: 42 }, 'test-token')
              ).bookmarkId;
            else await deleteBookmark(bookmarkId!, 'test-token');
          }}
        />,
      ),
    );
    await userEvent.click(button());
    await settled();
    expect(fetchMock.mock.calls[0][1]?.method).toBe('POST');
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      targetType: 'PROJECT',
      targetId: 42,
    });
    expect(bookmarkId).toBe(731);
    await userEvent.click(button());
    await settled();
    expect(fetchMock.mock.calls[1][0]).toContain('/api/v1/bookmarks/731');
    expect(fetchMock.mock.calls[1][1]?.method).toBe('DELETE');
    expect(button().getAttribute('aria-pressed')).toBe('false');
  });

  it('restores the outline when the existing API rejects a server response', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'server rejected' }), { status: 503 }),
    );
    await commit(async () =>
      root.render(
        <Controlled
          onChange={async () => {
            await createBookmark(
              { targetType: 'DEVELOPER', targetNickname: 'sample' },
              'test-token',
            );
          }}
        />,
      ),
    );
    await userEvent.click(button());
    await settled();
    expect(button().getAttribute('aria-pressed')).toBe('false');
    expect(stage().dataset.saved).toBe('false');
    expect(host.querySelector('output')!.textContent).toContain('실패');
  });

  it('preserves the legacy button on the original home opt-out', async () => {
    const change = vi.fn();
    await commit(async () =>
      root.render(
        <BookmarkAnimationContext.Provider value={false}>
          <BookmarkButton aria-label="첫 번째" bookmarked={false} onBookmarkChange={change} />
        </BookmarkAnimationContext.Provider>,
      ),
    );
    expect(host.querySelector('.bookmark-ribbon')).toBeNull();
    await userEvent.click(button());
    expect(change).toHaveBeenCalledWith(true);
  });

  it('restores the saved ribbon after a cancelled touch press without changing data', async () => {
    const change = vi.fn();
    await commit(async () =>
      root.render(<BookmarkButton aria-label="첫 번째" bookmarked onBookmarkChange={change} />),
    );
    button().dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'touch' }),
    );
    await wait(180);
    expect(button().querySelector('.default')!.getAttribute('d')).not.toBe(BOOKMARK_PATHS.ribbon);
    button().dispatchEvent(
      new PointerEvent('pointercancel', { bubbles: true, pointerType: 'touch' }),
    );
    await wait(250);
    expect(button().querySelector('.default')!.getAttribute('d')).toBe(BOOKMARK_PATHS.ribbon);
    expect(change).not.toHaveBeenCalled();
  });

  it('initializes the saved shape without playing an animation and keeps unique masks', async () => {
    await commit(async () =>
      root.render(
        <StrictMode>
          <Controlled initial />
          <BookmarkButton bookmarked={false} />
        </StrictMode>,
      ),
    );
    expect(stage().dataset.saved).toBe('true');
    expect(button().getAttribute('aria-pressed')).toBe('true');
    expect(button().getAttribute('aria-label')).toContain('해제');
    const masks = [...host.querySelectorAll('mask')].map((mask) => mask.id);
    expect(new Set(masks).size).toBe(2);
    expect(stage().style.length).toBe(0);
  });

  it('morphs the real corner through its folds, then cleans path and inline styles', async () => {
    await commit(async () =>
      root.render(
        <StrictMode>
          <Controlled />
        </StrictMode>,
      ),
    );
    await userEvent.click(button());
    await wait(200);
    expect(button().querySelector('.corner')!.getAttribute('d')).not.toBe(BOOKMARK_PATHS.corner);
    expect(stage().style.getPropertyValue('--default-y')).not.toBe('0px');
    await settled();
    expect(stage().dataset.saved).toBe('true');
    expect(stage().style.length).toBe(0);
    expect(button().querySelector('.corner')!.getAttribute('d')).toBe(BOOKMARK_PATHS.corner);
    expect(button().getAttribute('aria-pressed')).toBe('true');
    expect(getComputedStyle(stage()).getPropertyValue('--ribbon-color').trim().toLowerCase()).toBe(
      '#4e49ff',
    );
  });

  it('unmarks with the original pressed/overshoot path and returns to the outline', async () => {
    await commit(async () => root.render(<Controlled initial />));
    await userEvent.click(button());
    await wait(80);
    expect(button().querySelector('.default')!.getAttribute('d')).not.toBe(BOOKMARK_PATHS.ribbon);
    await settled();
    expect(stage().dataset.saved).toBe('false');
    expect(button().querySelector('.default')!.getAttribute('d')).toBe(BOOKMARK_PATHS.ribbon);
    expect(button().getAttribute('aria-label')).toContain('저장');
  });

  it('blocks repeat requests after animation completion until the API promise settles', async () => {
    let resolve!: () => void;
    const request = vi.fn(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );
    await commit(async () => root.render(<Controlled onChange={request} />));
    await userEvent.click(button());
    await wait(1200);
    await userEvent.click(button(), { force: true });
    await userEvent.click(button(), { force: true });
    expect(request).toHaveBeenCalledTimes(1);
    expect(button().getAttribute('aria-busy')).toBe('true');
    await commit(async () => resolve());
    await settled();
    expect(button().getAttribute('aria-pressed')).toBe('true');
  });

  it('rolls back an optimistic parent state when a request rejects', async () => {
    let reject!: (error: Error) => void;
    const request = new Promise<void>((_resolve, fail) => {
      reject = fail;
    });
    function Optimistic() {
      const [saved, setSaved] = useState(false);
      return (
        <BookmarkButton
          aria-label="첫 번째"
          bookmarked={saved}
          onBookmarkChange={async (next) => {
            setSaved(next);
            try {
              await request;
            } catch (error) {
              setSaved(false);
              throw error;
            }
          }}
        />
      );
    }
    await commit(async () => root.render(<Optimistic />));
    await userEvent.click(button());
    await wait(200);
    await commit(async () => reject(new Error('server rejected')));
    await settled();
    expect(button().getAttribute('aria-pressed')).toBe('false');
    expect(stage().dataset.saved).toBe('false');
    expect(host.querySelector('output')!.textContent).toContain('실패');
    expect(stage().style.length).toBe(0);
  });

  it('does not mark a no-op or unauthenticated callback as saved', async () => {
    await commit(async () =>
      root.render(
        <BookmarkButton
          aria-label="첫 번째"
          bookmarked={false}
          onBookmarkChange={() => undefined}
        />,
      ),
    );
    await userEvent.click(button());
    await settled();
    expect(button().getAttribute('aria-pressed')).toBe('false');
    expect(stage().dataset.saved).toBe('false');
  });

  it('keeps instances independent and synchronizes externally supplied data', async () => {
    const change = vi.fn();
    await commit(async () =>
      root.render(
        <>
          <Controlled />
          <BookmarkButton aria-label="두 번째" bookmarked={false} onBookmarkChange={change} />
        </>,
      ),
    );
    await userEvent.click(button());
    await settled();
    expect(stage('두 번째').dataset.saved).toBe('false');
    expect(change).not.toHaveBeenCalled();
    await commit(async () =>
      root.render(
        <>
          <Controlled />
          <BookmarkButton aria-label="두 번째" bookmarked onBookmarkChange={change} />
        </>,
      ),
    );
    await settled('두 번째');
    expect(stage('두 번째').dataset.saved).toBe('true');
    expect(change).not.toHaveBeenCalled();
  });

  it('supports Enter and Space without activating the parent card', async () => {
    const navigate = vi.fn();
    await commit(async () =>
      root.render(
        <a href="#card" onClick={navigate} onKeyDown={navigate}>
          <Controlled />
        </a>,
      ),
    );
    button().focus();
    await userEvent.keyboard('{Enter}');
    await settled();
    expect(button().getAttribute('aria-pressed')).toBe('true');
    await userEvent.keyboard(' ');
    await settled();
    expect(button().getAttribute('aria-pressed')).toBe('false');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('uses a minimum 40px hit target (44px on mobile)', async () => {
    await commit(async () => root.render(<Controlled />));
    const rect = button().getBoundingClientRect();
    const mobile = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
    expect(rect.width).toBeGreaterThanOrEqual(mobile ? 44 : 40);
    expect(rect.height).toBeGreaterThanOrEqual(mobile ? 44 : 40);
  });

  it('minimizes motion under prefers-reduced-motion', async () => {
    const native = window.matchMedia.bind(window);
    vi.spyOn(window, 'matchMedia').mockImplementation((query) =>
      query.includes('prefers-reduced-motion')
        ? ({
            ...native(query),
            matches: true,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          } as unknown as MediaQueryList)
        : native(query),
    );
    await commit(async () => root.render(<Controlled />));
    await userEvent.click(button());
    await settled();
    expect(stage().dataset.saved).toBe('true');
    expect(stage().style.length).toBe(0);
    expect(gsap.getTweensOf(stage()).length).toBe(0);
  });

  it('cleans all running timelines when StrictMode unmounts during a pending request', async () => {
    let resolve!: () => void;
    await commit(async () =>
      root.render(
        <StrictMode>
          <Controlled
            onChange={() =>
              new Promise<void>((done) => {
                resolve = done;
              })
            }
          />
        </StrictMode>,
      ),
    );
    await userEvent.click(button());
    const elements = [stage(), ...button().querySelectorAll('path')];
    await commit(async () => root.render(null));
    expect(gsap.getTweensOf(elements).length).toBe(0);
    await commit(async () => resolve());
    expect(host.children.length).toBe(0);
  });
});
