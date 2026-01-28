import { useMemo, useState } from 'react';
import LogoDark from '@assets/icons/logo-dark.svg?react';
import LogoLight from '@assets/icons/logo-light.svg?react';
import CheckboxCheckedIcon from '@assets/icons/checkbox-checked.svg?react';
import CheckboxUncheckedIcon from '@assets/icons/checkbox-unchecked.svg?react';
import { Link, useNavigate } from 'react-router-dom';
import { useThemeStore } from '@store/theme';
import BasicProfileSection from './BasicProfileSection';
import AdditionalProfileSection from './AdditionalProfileSection';
import GithubRepoSelectionSection from './GithubRepoSelectionSection';
import ProfilePage from '@pages/login/profile-page';

type AgreementListProps = {
  onClose: () => void;
  onConfirm: () => void;
  loginProvider: 'github' | 'google';
};

const AgreementList = ({ onClose, onConfirm, loginProvider }: AgreementListProps) => {
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const [serviceAgreed, setServiceAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);
  const [step, setStep] = useState<
    'agreements' | 'basicProfile' | 'profilePage' | 'additionalProfile' | 'githubRepos'
  >('agreements');

  const requiredAgreed = useMemo(
    () => serviceAgreed && privacyAgreed,
    [serviceAgreed, privacyAgreed],
  );
  const allChecked = useMemo(
    () => serviceAgreed && privacyAgreed && marketingAgreed,
    [serviceAgreed, privacyAgreed, marketingAgreed],
  );

  const handleAllChange = (checked: boolean) => {
    setServiceAgreed(checked);
    setPrivacyAgreed(checked);
    setMarketingAgreed(checked);
  };

  const handleConfirm = () => {
    if (!requiredAgreed) {
      return;
    }
    setStep('basicProfile');
  };

  const backgroundStyle =
    theme === 'dark'
      ? {
          backgroundColor: 'var(--ui-bg)',
          backgroundImage:
            'radial-gradient(circle at top center, rgba(78,73,255,0.18) 0%, rgba(78,73,255,0.08) 25%, rgba(78,73,255,0) 70%)',
        }
      : {
          backgroundColor: 'var(--ui-bg)',
          backgroundImage:
            'radial-gradient(circle at top center, rgba(78,73,255,0.2) 0%, rgba(78,73,255,0.06) 25%, rgba(78,73,255,0) 70%)',
        };

  return (
    <div className="fixed inset-0 z-50" style={backgroundStyle}>

      <div className="absolute left-1/2 top-0 h-[6rem] w-screen -translate-x-1/2">
        <div className="mx-auto flex h-full max-w-[144rem] items-center px-[12rem]">
          <Link to="/" className="flex-items-center gap-[0.4rem]">
            {theme === 'dark' ? <LogoLight aria-hidden="true" /> : <LogoDark aria-hidden="true" />}
          </Link>
        </div>
      </div>
      {step === 'basicProfile' ? (
        <div className="mx-auto mt-[104px] w-full max-w-[632px]">
          <BasicProfileSection
            onNext={() => setStep('profilePage')}
            onBack={() => setStep('agreements')}
          />
        </div>
      ) : step === 'profilePage' ? (
        <div className="mx-auto mt-[104px] w-full max-w-[632px]">
          <ProfilePage
            onNext={() => setStep('additionalProfile')}
            onBack={() => setStep('basicProfile')}
          />
        </div>
      ) : step === 'githubRepos' ? (
        <div className="mx-auto mt-[104px] w-full max-w-[632px]">
          <GithubRepoSelectionSection onBack={() => setStep('additionalProfile')} />
        </div>
      ) : step === 'additionalProfile' ? (
        <div className="mx-auto mt-[104px] w-full max-w-[632px]">
          <AdditionalProfileSection
            onBack={() => setStep('basicProfile')}
            onNext={() => {
              if (loginProvider === 'github') {
                setStep('githubRepos');
              } else {
                onConfirm();
                navigate('/');
              }
            }}
          />
        </div>
      ) : (
      <div className="mx-auto mt-[104px] flex h-[660px] w-[632px] flex-col rounded-[32px] bg-[var(--ui-bg)] px-8 pb-20 pt-8 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2 text-[var(--ui-1000)]">
            <h2 className="Heading2 font-semibold">서비스 이용을 위해</h2>
            <h2 className="Heading2 font-semibold">약관에 동의해주세요</h2>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={allChecked}
              onClick={() => handleAllChange(!allChecked)}
              className="relative flex items-center gap-3 rounded-2xl bg-[var(--ui-50)] px-5 py-4 text-left"
            >
              {allChecked ? (
                <CheckboxCheckedIcon className="h-7 w-7 shrink-0" aria-hidden="true" />
              ) : (
                <CheckboxUncheckedIcon className="h-7 w-7 shrink-0" aria-hidden="true" />
              )}
              <span className="Body1 text-[var(--ui-900)]">전체 동의</span>
            </button>

            <div className="flex flex-col gap-3 rounded-2xl border border-[var(--ui-100)] px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={serviceAgreed}
                  onClick={() => setServiceAgreed((prev) => !prev)}
                  className="flex items-center gap-3 text-left"
                >
                  {serviceAgreed ? (
                    <CheckboxCheckedIcon className="h-7 w-7 shrink-0" aria-hidden="true" />
                  ) : (
                    <CheckboxUncheckedIcon className="h-7 w-7 shrink-0" aria-hidden="true" />
                  )}
                  <span className="Body1 text-[var(--ui-900)]">
                    서비스 이용약관 동의 (필수)
                  </span>
                </button>
                <span className="text-[var(--ui-400)]">{'>'}</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={privacyAgreed}
                  onClick={() => setPrivacyAgreed((prev) => !prev)}
                  className="flex items-center gap-3 text-left"
                >
                  {privacyAgreed ? (
                    <CheckboxCheckedIcon className="h-7 w-7 shrink-0" aria-hidden="true" />
                  ) : (
                    <CheckboxUncheckedIcon className="h-7 w-7 shrink-0" aria-hidden="true" />
                  )}
                  <span className="Body1 text-[var(--ui-900)]">
                    개인정보 처리방침 동의 (필수)
                  </span>
                </button>
                <span className="text-[var(--ui-400)]">{'>'}</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={marketingAgreed}
                  onClick={() => setMarketingAgreed((prev) => !prev)}
                  className="flex items-center gap-3 text-left"
                >
                  {marketingAgreed ? (
                    <CheckboxCheckedIcon className="h-7 w-7 shrink-0" aria-hidden="true" />
                  ) : (
                    <CheckboxUncheckedIcon className="h-7 w-7 shrink-0" aria-hidden="true" />
                  )}
                  <span className="Body1 text-[var(--ui-900)]">
                    프로젝트 알림 수신 동의 (선택)
                  </span>
                </button>
                <span className="text-[var(--ui-400)]">{'>'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto mb-24 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!requiredAgreed}
            className={`Body1 h-[48px] w-full rounded-xl font-semibold ${
              requiredAgreed
                ? 'bg-[var(--badge-text-primary)] text-white'
                : 'bg-[var(--ui-50)] text-[var(--ui-300)]'
            }`}
          >
            다음
          </button>
          <button type="button" onClick={onClose} className="Body1 text-[var(--ui-400)]">
            돌아가기
          </button>
        </div>
      </div>
      )}
    </div>
  );
};

export default AgreementList;