import { useMemo, useState } from 'react';
import Lottie from 'lottie-react';
import confettiAnimation from './Confetti.json';
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
import TermsDetailScreen from '@pages/signup/TermsDetailScreen';
import { TERMS_CONTENT, TERMS_IDS } from './terms-content';

type BasicProfileData = {
  nickname: string;
  imageUrl: string | null;
};

type ProfileData = {
  mainType: 'PM' | 'DEVELOPER';
  categoryIds: number[];
};

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
  const [activeTermsKey, setActiveTermsKey] = useState<keyof typeof TERMS_CONTENT | null>(null);
  const [basicProfile, setBasicProfile] = useState<BasicProfileData>({
    nickname: '',
    imageUrl: null,
  });
  const [profileInfo, setProfileInfo] = useState<ProfileData>({
    mainType: 'PM',
    categoryIds: [],
  });
  const [step, setStep] = useState<
    'agreements' | 'basicProfile' | 'profilePage' | 'additionalProfile' | 'signupComplete' | 'githubRepos'
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
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem('allow_main_once', 'true');
              navigate('/');
            }}
            className="flex items-center gap-[0.4rem] cursor-pointer"
            aria-label="메인으로 이동"
          >
            {theme === 'dark' ? <LogoLight aria-hidden="true" /> : <LogoDark aria-hidden="true" />}
          </button>
        </div>
      </div>
      {step === 'basicProfile' ? (
        <div className="mx-auto mt-[104px] w-full max-w-[632px]">
          <BasicProfileSection
            onNext={(data) => {
              setBasicProfile(data);
              setStep('profilePage');
            }}
            onBack={() => setStep('agreements')}
          />
        </div>
      ) : step === 'profilePage' ? (
        <div className="mx-auto mt-[104px] w-full max-w-[632px]">
          <ProfilePage
            onNext={(data) => {
              setProfileInfo(data);
              setStep('additionalProfile');
            }}
            onBack={() => setStep('basicProfile')}
          />
        </div>
      ) : step === 'signupComplete' ? (
        <div className="relative mx-auto mt-[104px] flex h-[520px] w-[632px] flex-col items-center justify-center gap-6 px-8 py-12 text-center">
          <Lottie
            animationData={confettiAnimation}
            loop
            className="pointer-events-none absolute left-1/2 top-1/2 h-full w-[900px] -translate-x-1/2 -translate-y-1/2"
          />
          <div className="-mt-8 flex flex-col gap-3 text-[var(--ui-1000)]">
            <h2 className="Heading2 font-semibold">회원가입이 완료되었어요!</h2>
            <p className="Caption1 text-[var(--ui-400)]">
              Github로 회원가입 시 1회 무료로 리포트를 생성해드려요!
              <br />
              지금 바로 리포트를 만들어 보세요!
            </p>
          </div>
          <div className="mt-6 flex w-full max-w-[320px] flex-col gap-3">
            <button
              type="button"
              onClick={() => setStep('githubRepos')}
              className="Body1 h-[48px] w-full rounded-xl bg-[#4E49FF] font-semibold text-white"
            >
              리포트 생성하기
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                navigate('/');
              }}
              className="Body1 text-[var(--ui-400)]"
            >
              메인 화면으로 이동하기
            </button>
          </div>
        </div>
      ) : step === 'githubRepos' ? (
        <div className="mx-auto mt-[104px] w-full max-w-[632px]">
          <GithubRepoSelectionSection
            onBack={() => setStep('additionalProfile')}
            onNext={() => {
              onConfirm();
              navigate('/');
            }}
          />
        </div>
      ) : step === 'additionalProfile' ? (
        <div className="mx-auto mt-[104px] w-full max-w-[632px]">
          <AdditionalProfileSection
            onBack={() => setStep('profilePage')}
            signupData={{
              agreements: [
                { termsId: TERMS_IDS.service, agreed: serviceAgreed },
                { termsId: TERMS_IDS.privacy, agreed: privacyAgreed },
                { termsId: TERMS_IDS.marketing, agreed: marketingAgreed },
              ],
              nickname: basicProfile.nickname,
              imageUrl: basicProfile.imageUrl,
              mainType: profileInfo.mainType,
              categoryIds: profileInfo.categoryIds,
            }}
            onNext={() => {
              if (loginProvider === 'github') {
                setStep('signupComplete');
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
                <CheckboxCheckedIcon className="h-7 w-7 shrink-0 text-[#4E49FF]" aria-hidden="true" />
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
                    <CheckboxCheckedIcon className="h-7 w-7 shrink-0 text-[#4E49FF]" aria-hidden="true" />
                  ) : (
                    <CheckboxUncheckedIcon className="h-7 w-7 shrink-0" aria-hidden="true" />
                  )}
                  <span className="Body1 text-[var(--ui-900)]">
                    서비스 이용약관 동의 (필수)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTermsKey('service')}
                  className="text-[var(--ui-400)] hover:text-[var(--ui-600)]"
                  aria-label="서비스 이용약관 보기"
                >
                  {'>'}
                </button>
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
                    <CheckboxCheckedIcon className="h-7 w-7 shrink-0 text-[#4E49FF]" aria-hidden="true" />
                  ) : (
                    <CheckboxUncheckedIcon className="h-7 w-7 shrink-0" aria-hidden="true" />
                  )}
                  <span className="Body1 text-[var(--ui-900)]">
                    개인정보 처리방침 동의 (필수)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTermsKey('privacy')}
                  className="text-[var(--ui-400)] hover:text-[var(--ui-600)]"
                  aria-label="개인정보 처리방침 보기"
                >
                  {'>'}
                </button>
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
                    <CheckboxCheckedIcon className="h-7 w-7 shrink-0 text-[#4E49FF]" aria-hidden="true" />
                  ) : (
                    <CheckboxUncheckedIcon className="h-7 w-7 shrink-0" aria-hidden="true" />
                  )}
                  <span className="Body1 text-[var(--ui-900)]">
                    프로젝트 알림 수신 동의 (선택)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTermsKey('marketing')}
                  className="text-[var(--ui-400)] hover:text-[var(--ui-600)]"
                  aria-label="프로젝트 알림 수신 동의 보기"
                >
                  {'>'}
                </button>
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
                ? 'bg-[#4E49FF] text-white'
                : 'bg-[var(--ui-50)] text-[var(--ui-300)]'
            }`}
          >
            다음
          </button>
          <button type="button" onClick={() => navigate('/login')} className="Body1 text-[var(--ui-400)]">
            돌아가기
          </button>
        </div>
      </div>
      )}
      <TermsDetailScreen
        open={activeTermsKey !== null}
        title={activeTermsKey ? TERMS_CONTENT[activeTermsKey].title : ''}
        content={activeTermsKey ? TERMS_CONTENT[activeTermsKey].content : ''}
        onClose={() => setActiveTermsKey(null)}
      />
    </div>
  );
};

export default AgreementList;