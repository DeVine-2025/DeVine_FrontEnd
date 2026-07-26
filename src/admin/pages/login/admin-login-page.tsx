import DarkLogo from '@assets/icons/logo-dark.svg?react';
import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate('/admin/dashboard');
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[360px] flex-col items-center justify-center bg-white px-[24px] text-center sm:max-w-[600px] sm:px-[40px] lg:max-w-[1200px] lg:px-[64px]">
      <div className="flex flex-col items-center">
        <DarkLogo aria-hidden="true" className="h-30 w-auto" />
        <h1 className="Title3 mt-[12px] font-bold text-[var(--ui-1000)]">관리자 페이지</h1>
      </div>
      <form
        className="mt-30 w-full max-w-[360px] text-left sm:max-w-[420px]"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-[20px]">
          <label className="flex flex-col gap-[8px]">
            <span className="font-semibold text-[16px] text-[var(--ui-900)]">이메일</span>
            <input
              autoComplete="email"
              className="h-[48px] rounded-[12px] bg-[var(--ui-50)] px-[16px] font-semibold text-[16px] text-[var(--ui-900)] outline-none placeholder:text-[var(--ui-400)] focus:ring-2 focus:ring-[#4e49ff]"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="이메일을 입력해주세요"
              type="email"
              value={email}
            />
          </label>
          <label className="flex flex-col gap-[8px]">
            <span className="font-semibold text-[16px] text-[var(--ui-900)]">비밀번호</span>
            <input
              autoComplete="current-password"
              className="h-[48px] rounded-[12px] bg-[var(--ui-50)] px-[16px] font-semibold text-[16px] text-[var(--ui-900)] outline-none placeholder:text-[var(--ui-400)] focus:ring-2 focus:ring-[#4e49ff]"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호를 입력해주세요"
              type="password"
              value={password}
            />
          </label>
        </div>
        <button
          className="mt-[24px] flex h-[48px] w-full items-center justify-center rounded-[12px] bg-[#4e49ff] font-semibold text-[16px] text-white transition-opacity hover:opacity-90"
          type="submit"
        >
          로그인
        </button>
      </form>
      <p className="mt-[16px] font-medium text-[14px] text-[var(--negative-text)]">
        5회 연속 실패시 일시 잠금
      </p>
    </main>
  );
}
