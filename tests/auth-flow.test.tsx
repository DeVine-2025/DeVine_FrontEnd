import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  path: '/report/create',
  signedIn: true,
  githubLinked: true,
  metadataComplete: true,
  member: { data: undefined, isPending: false, isError: false, isFetching: false, refetch: vi.fn() } as any,
  repos: { data: undefined, isLoading: false, isFetching: false, isError: false, error: null,
    refetch: vi.fn(), fetchNextPage: vi.fn(), hasNextPage: false, isFetchingNextPage: false } as any,
}));
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({ isLoaded: true, user: state.signedIn ? {
    id: 'test-user', unsafeMetadata: { onboardingComplete: state.metadataComplete },
    externalAccounts: state.githubLinked ? [{ provider: 'github' }] : [],
  } : null }),
  useAuth: () => ({ getToken: vi.fn(), isLoaded: true, isSignedIn: state.signedIn, userId: 'test-user' }),
}));
vi.mock('../src/shared/hooks/useAuthMe', () => ({ useAuthMe: () => state.member }));
vi.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: () => state.repos,
  useQueryClient: () => ({ setQueryData: vi.fn() }),
}));
vi.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => <span>redirect:{to}</span>,
  Outlet: () => <span>page-content</span>,
  useLocation: () => ({ pathname: state.path, search: '', key: 'test' }),
  useNavigate: () => vi.fn(),
}));
vi.mock('../src/shared/components/chat/FloatingChatWidget', () => ({ default: () => <span>chat-widget</span> }));
vi.mock('../src/shared/layouts/header', () => ({ default: () => null }));
vi.mock('../src/shared/layouts/footer', () => ({ default: () => null }));
vi.mock('../src/shared/libs/analytics', () => ({ trackPageView: vi.fn() }));
vi.mock('../src/shared/store/auth', () => ({ useAuthStore: () => vi.fn() }));
vi.mock('../src/shared/utils/storage', () => ({ getStoredUserRole: vi.fn(), setCurrentUserId: vi.fn() }));
vi.mock('../src/shared/store/theme', () => ({ useThemeStore: () => ({ theme: 'dark' }) }));
vi.mock('../src/shared/apis/myInfo/my-info.queries', () => ({ myInfoQueries: { reposInfinite: () => ({}) } }));
vi.mock('../src/shared/components/report/CheckBox', () => ({ default: ({ title }: { title: string }) => <span>{title}</span> }));
vi.mock('../src/shared/components/report/GithubRepoListSkeleton', () => ({ default: () => <span>loading-repositories</span> }));
vi.mock('react-spinners', () => ({ BeatLoader: () => null }));
vi.mock('../src/pages/signup/AgreementList', () => ({ default: () => <span>signup-form</span> }));

import RootLayout from '../src/shared/layouts/root-layout';
import SignupPage from '../src/pages/signup/signup-page';
import ReportCreatePage from '../src/pages/report/report-create-page';

beforeEach(() => {
  state.path = '/report/create'; state.signedIn = true; state.githubLinked = true; state.metadataComplete = true;
  state.member = { data: { isRegistered: false }, isPending: false, isError: false, isFetching: false, refetch: vi.fn() };
  state.repos = { data: undefined, isLoading: false, isFetching: false, isError: false, error: null,
    refetch: vi.fn(), fetchNextPage: vi.fn(), hasNextPage: false, isFetchingNextPage: false };
  vi.stubGlobal('sessionStorage', { getItem: () => null, removeItem: vi.fn() });
});

describe('login and signup routing', () => {
  it('redirects to signup despite stale Clerk onboardingComplete=true', () => {
    expect(renderToStaticMarkup(<RootLayout />)).toContain('redirect:/signup');
  });
  it('renders signup without redirecting back to the homepage for the same stale metadata', () => {
    state.path = '/signup';
    expect(renderToStaticMarkup(<RootLayout />)).toContain('page-content');
    expect(renderToStaticMarkup(<SignupPage />)).toContain('signup-form');
  });
  it('allows a registered member even if Clerk metadata is missing', () => {
    state.metadataComplete = false; state.member.data.isRegistered = true;
    expect(renderToStaticMarkup(<RootLayout />)).toContain('page-content');
    expect(renderToStaticMarkup(<SignupPage />)).not.toContain('signup-form');
  });
  it('does not mount member pages while verifying membership', () => {
    state.member.data = undefined; state.member.isPending = true;
    const html = renderToStaticMarkup(<RootLayout />);
    expect(html).toContain('회원 정보를 확인하고'); expect(html).not.toContain('page-content');
  });
  it('shows retry on membership lookup failure instead of signup or member pages', () => {
    state.member.data = undefined; state.member.isError = true;
    const html = renderToStaticMarkup(<RootLayout />);
    expect(html).toContain('다시 확인하기'); expect(html).not.toContain('redirect:'); expect(html).not.toContain('page-content');
  });
  it('allows signed-out public browsing and the OAuth callback', () => {
    state.signedIn = false; state.member.data = undefined; state.member.isPending = true;
    expect(renderToStaticMarkup(<RootLayout />)).toContain('page-content');
    state.signedIn = true; state.path = '/sso-callback';
    expect(renderToStaticMarkup(<RootLayout />)).toContain('page-content');
  });
});

describe('repository errors are not empty lists', () => {
  const fail = (status: number, code: string) => {
    state.repos.isError = true;
    state.repos.error = { isAxiosError: true, response: { status, data: { code } } };
  };
  it('offers membership recovery for the observed AUTH403_1', () => {
    fail(403, 'AUTH403_1');
    const html = renderToStaticMarkup(<ReportCreatePage />);
    expect(html).toContain('회원가입 계속하기'); expect(html).not.toContain('GitHub 연결하기');
  });
  it('shows retry for backend failure', () => {
    fail(500, 'AUTH500_1');
    const html = renderToStaticMarkup(<ReportCreatePage />);
    expect(html).toContain('다시 불러오기'); expect(html).not.toContain('불러올 레포지토리가 없습니다');
  });
  it('only offers connection when GitHub is actually unlinked', () => {
    fail(404, 'AUTH404_1'); state.githubLinked = false;
    expect(renderToStaticMarkup(<ReportCreatePage />)).toContain('GitHub 연결하기');
    state.githubLinked = true;
    expect(renderToStaticMarkup(<ReportCreatePage />)).not.toContain('GitHub 연결하기');
  });
  it('allows refresh for a successful empty repository list', () => {
    state.repos.data = { pages: [{ result: { content: [] } }] };
    const html = renderToStaticMarkup(<ReportCreatePage />);
    expect(html).toContain('불러올 레포지토리가 없습니다'); expect(html).toContain('다시 불러오기');
    expect(html).not.toContain('GitHub 연결하기');
  });
  it('renders returned repositories for selection', () => {
    state.repos.data = { pages: [{ result: { content: [{ gitRepoId: 1, name: 'sample-repository' }] } }] };
    const html = renderToStaticMarkup(<ReportCreatePage />);
    expect(html).toContain('sample-repository'); expect(html).toContain('생성하기');
  });
});
