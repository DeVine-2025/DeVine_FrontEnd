const LoginPage = () => {

  const handleGitHubLogin = () => {
    // TODO: Implement GitHub OAuth
    console.log('GitHub login clicked');
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log('Google login clicked');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--ui-bg)] px-[2rem]">
      <div className="w-full max-w-[48rem] text-center">
        {/* 로고 */}
        <div className="mb-[4rem]">
          <h1 className="mb-[1rem] font-bold text-6xl text-[var(--ui-900)]">Devine</h1>
        </div>

        {/* 중앙 콘텐츠 영역 */}
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-[4rem] shadow-lg">
          {/* 타이틀 */}
          <h2 className="mb-[2rem] font-semibold text-3xl text-[var(--ui-900)]">
            Devine one-line introduction
          </h2>

          {/* 소개 텍스트 */}
          <p className="mb-[4rem] text-[var(--ui-600)] text-lg leading-relaxed">
            개발자와 프로젝트를 연결하는 플랫폼입니다.
            <br />
            당신의 아이디어를 실현할 최고의 팀을 만나보세요.
          </p>

          {/* CTA 버튼들 */}
          <div className="space-y-[1.5rem]">
            <button
              onClick={handleGitHubLogin}
              className="w-full rounded-xl bg-[var(--ui-900)] px-[2rem] py-[1.5rem] font-semibold text-[var(--ui-50)] text-lg transition-all duration-200 hover:scale-105 hover:bg-[var(--ui-800)] focus:outline-none focus:ring-2 focus:ring-[var(--ui-500)] focus:ring-offset-2"
            >
              Continue with GitHub account
            </button>

            <button
              onClick={handleGoogleLogin}
              className="w-full rounded-xl border-2 border-[var(--ui-300)] bg-[var(--ui-50)] px-[2rem] py-[1.5rem] font-semibold text-[var(--ui-900)] text-lg transition-all duration-200 hover:scale-105 hover:bg-[var(--ui-100)] focus:outline-none focus:ring-2 focus:ring-[var(--ui-500)] focus:ring-offset-2"
            >
              Continue with Google account
            </button>
          </div>

          {/* 추가 정보 */}
          <p className="mt-[3rem] text-[var(--ui-500)] text-sm">
            계정을 만들거나 로그인하면 이용약관과 개인정보처리방침에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
