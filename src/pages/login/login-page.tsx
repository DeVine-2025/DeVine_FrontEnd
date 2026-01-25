import { useState } from 'react';
import GithubIcon from '@assets/icons/github.svg?react';
import GoogleIcon from '@assets/icons/google.svg?react';
import AgreementList from '@components/onboarding/AgreementList';

const LoginPage = () => {
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [loginProvider, setLoginProvider] = useState<'github' | 'google' | null>(null);

  return (
    <div className="bg-[var(--color-auth-bg)] text-[var(--color-auth-text)]">
      <main className="mx-auto flex min-h-screen w-full max-w-[360px] flex-col items-center justify-center px-6 text-center sm:max-w-[600px] sm:px-10 lg:max-w-[1200px] lg:px-16">
        <h1 className="Title2 font-bold text-[var(--color-auth-text)]">Devine 한줄소개</h1>
        <p className="mt-15 w-full max-w-[320px] text-[16px] leading-[24px] text-[var(--color-auth-desc)] sm:max-w-[600px]">
          Devine 설명이 들어가는 자리입니다.
          <br />
          Devine 설명이 들어가는 자리입니다.
          <br />
          Devine 설명이 들어가는 자리입니다.
        </p>
        <div className="mt-30 flex w-full max-w-[360px] flex-col gap-3 font-semibold text-[16px] sm:max-w-[420px]">
          <button
            type="button"
            onClick={() => {
              setLoginProvider('github');
              setIsAgreementOpen(true);
            }}
            className="flex h-[48px] w-full items-center justify-center gap-4 rounded-[12px] px-4 whitespace-nowrap bg-[var(--color-auth-btn-dark-bg)] text-[var(--color-auth-btn-dark-text)]"
          >
            <GithubIcon className="h-9 w-9" aria-hidden="true" />
            깃허브 계정으로 계속하기
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginProvider('google');
              setIsAgreementOpen(true);
            }}
            className="flex h-[48px] w-full items-center justify-center gap-4 rounded-[12px] px-4 whitespace-nowrap bg-[var(--color-auth-btn-light-bg)] text-[var(--color-auth-btn-light-text)] border border-[var(--color-auth-btn-light-border)]"
          >
            <GoogleIcon className="h-7 w-7" aria-hidden="true" />
            구글 계정으로 계속하기
          </button>
        </div>
      </main>
      {isAgreementOpen && (
        <AgreementList
          onClose={() => setIsAgreementOpen(false)}
          onConfirm={() => setIsAgreementOpen(false)}
          loginProvider={loginProvider ?? 'google'}
        />
      )}
    </div>
  );
};

export default LoginPage;

