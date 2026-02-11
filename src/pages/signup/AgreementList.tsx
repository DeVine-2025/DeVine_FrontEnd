import { useCallback, useMemo, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import confettiAnimation from './Confetti.json';
import LogoDark from '@assets/icons/logo-dark.svg?react';
import LogoLight from '@assets/icons/logo-light.svg?react';
import CheckboxCheckedIcon from '@assets/icons/checkbox-checked.svg?react';
import CheckboxUncheckedIcon from '@assets/icons/checkbox-unchecked.svg?react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useThemeStore } from '@store/theme';
import { getProfileImageKey } from '@utils/storage';
import BasicProfileSection from './BasicProfileSection';
import AdditionalProfileSection from './AdditionalProfileSection';
import GithubRepoSelectionSection from './GithubRepoSelectionSection';
import ProfilePage from '@pages/login/profile-page';
import TermsDetailScreen from '@pages/signup/TermsDetailScreen';
import { TERMS_CONTENT, TERMS_IDS } from './terms-content';
import type { RootLayoutOutletContext } from '@layouts/root-layout';

type BasicProfileData = {
  nickname: string;
  imageUrl: string | null;
};

type ProfileData = {
  mainType: 'PM' | 'DEVELOPER';
  categoryIds: number[];
  domainLabels: string[];
};

type AgreementListProps = {
  onClose: () => void;
  onConfirm: () => void;
  loginProvider: 'github' | 'google';
};

const AgreementList = ({ onClose, onConfirm, loginProvider }: AgreementListProps) => {
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const { user } = useUser();
  const { openOnboardingModal } = useOutletContext<RootLayoutOutletContext>();
  const onboardingConfirmedRef = useRef(false);
  const logoSubmitHandlerRef = useRef<null | (() => void)>(null);
  const [serviceAgreed, setServiceAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [activeTermsKey, setActiveTermsKey] = useState<keyof typeof TERMS_CONTENT | null>(null);
  const [basicProfile, setBasicProfile] = useState<BasicProfileData>({
    nickname: '',
    imageUrl: null,
  });
  const [profileInfo, setProfileInfo] = useState<ProfileData>({
    mainType: 'PM',
    categoryIds: [],
    domainLabels: [],
  });
  const [isWaitModalOpen, setIsWaitModalOpen] = useState(false);
  const [step, setStep] = useState<
    'agreements' | 'basicProfile' | 'profilePage' | 'additionalProfile' | 'signupComplete' | 'githubRepos'
  >('agreements');

  const requiredAgreed = useMemo(
    () => serviceAgreed && privacyAgreed,
    [serviceAgreed, privacyAgreed],
  );
  const allChecked = useMemo(() => serviceAgreed && privacyAgreed, [serviceAgreed, privacyAgreed]);

  const handleAllChange = (checked: boolean) => {
    setServiceAgreed(checked);
    setPrivacyAgreed(checked);
  };

  const handleConfirm = () => {
    if (!requiredAgreed) {
      return;
    }
    setStep('basicProfile');
  };

  const confirmOnboardingOnce = async () => {
    if (onboardingConfirmedRef.current) return;
    onboardingConfirmedRef.current = true;
    await onConfirm();
    try {
      const key = `onboarding_complete:${user?.id ?? 'unknown'}`;
      localStorage.setItem(key, 'true');
    } catch {
      // ignore storage errors
    }
  };

  const setAdditionalLogoHandler = useCallback((handler: (() => void) | null) => {
    logoSubmitHandlerRef.current = handler;
  }, []);

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
    <div className="fixed inset-0 z-50 overflow-y-auto" style={backgroundStyle}>

      <div className="absolute left-1/2 top-0 h-[6rem] w-screen -translate-x-1/2">
        <div className="mx-auto flex h-full max-w-[144rem] items-center px-[12rem]">
          <button
            type="button"
            onClick={() => {
              if (step === 'githubRepos') {
                setIsWaitModalOpen(true);
                return;
              }
              if (step === 'additionalProfile' && logoSubmitHandlerRef.current) {
                logoSubmitHandlerRef.current();
                return;
              }
              if (step === 'signupComplete') {
                void confirmOnboardingOnce().then(() => navigate('/'));
                return;
              }
              openOnboardingModal();
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
              const profileImageKey = getProfileImageKey(user?.id ?? null);
              if (data.imageUrl) {
                localStorage.setItem(profileImageKey, data.imageUrl);
                window.dispatchEvent(new Event('profile-image-updated'));
              } else {
                localStorage.removeItem(profileImageKey);
                window.dispatchEvent(new Event('profile-image-updated'));
              }
              setStep('profilePage');
            }}
            onBack={() => setStep('agreements')}
            initialData={basicProfile}
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
            initialRole={profileInfo.mainType === 'DEVELOPER' ? 'dev' : 'pm'}
            initialDomains={profileInfo.domainLabels}
          />
        </div>
      ) : step === 'signupComplete' ? (
        <div className="relative mx-auto mt-[104px] flex h-[560px] w-[680px] flex-col items-center justify-center gap-8 px-10 py-14 text-center">
          <Lottie
            animationData={confettiAnimation}
            loop
            className="pointer-events-none absolute left-1/2 top-1/2 h-full w-[980px] -translate-x-1/2 -translate-y-1/2"
          />
          <div className="-mt-6 flex flex-col gap-4 text-[var(--ui-1000)]">
            <h2 className="text-[28px] font-semibold">회원가입이 완료되었어요!</h2>
            <p className="text-[16px] leading-7 text-[var(--ui-400)]">
              Github로 회원가입 시 1회 무료로 리포트를 생성해드려요!
              <br />
              지금 바로 리포트를 만들어 보세요!
            </p>
          </div>
          <div className="mt-6 flex w-full max-w-[360px] flex-col gap-4">
            <button
              type="button"
              onClick={() => setStep('githubRepos')}
              className="h-[54px] w-full rounded-xl bg-[var(--color-primary)] text-[17px] font-semibold text-white"
            >
              리포트 생성하기
            </button>
            <button
              type="button"
              onClick={async () => {
                await confirmOnboardingOnce();
                navigate('/');
              }}
              className="text-[15px] font-medium text-[var(--ui-400)]"
            >
              메인 화면으로 이동하기
            </button>
          </div>
        </div>
      ) : step === 'githubRepos' ? (
        <div className="mx-auto mt-[104px] w-full max-w-[632px]">
          <GithubRepoSelectionSection
            onBack={() => setStep('signupComplete')}
            onNext={async () => {
              await confirmOnboardingOnce();
              navigate('/');
            }}
          />
        </div>
      ) : step === 'additionalProfile' ? (
        <div className="mx-auto mt-[104px] w-full max-w-[632px]">
          <AdditionalProfileSection
            onBack={() => setStep('profilePage')}
            setLogoSubmitHandler={setAdditionalLogoHandler}
            signupData={{
              agreements: [
                { termsId: TERMS_IDS.service, agreed: serviceAgreed },
                { termsId: TERMS_IDS.privacy, agreed: privacyAgreed },
              ],
              nickname: basicProfile.nickname,
              imageUrl: basicProfile.imageUrl,
              mainType: profileInfo.mainType,
              categoryIds: profileInfo.categoryIds,
            }}
            onComplete={loginProvider === 'github' ? undefined : confirmOnboardingOnce}
            onNext={() => {
              if (loginProvider === 'github') {
                setStep('signupComplete');
              } else {
                void confirmOnboardingOnce().then(() => navigate('/'));
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
              className="relative flex items-center gap-3 rounded-2xl bg-[var(--ui-50)] px-6 py-5 text-left"
            >
              {allChecked ? (
                <CheckboxCheckedIcon
                  className="h-8 w-8 shrink-0 text-[var(--color-primary)]"
                  aria-hidden="true"
                />
              ) : (
                <CheckboxUncheckedIcon className="h-8 w-8 shrink-0" aria-hidden="true" />
              )}
              <span className="text-[17px] font-semibold text-[var(--ui-900)]">전체 동의</span>
            </button>

            <div className="flex flex-col gap-4 rounded-2xl border border-[var(--ui-100)] px-6 py-5">
              <div className="mt-1 flex items-center justify-between gap-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={serviceAgreed}
                  onClick={() => setServiceAgreed((prev) => !prev)}
                  className="flex items-center gap-3 text-left"
                >
                  {serviceAgreed ? (
                    <CheckboxCheckedIcon
                      className="h-8 w-8 shrink-0 text-[var(--color-primary)]"
                      aria-hidden="true"
                    />
                  ) : (
                    <CheckboxUncheckedIcon className="h-8 w-8 shrink-0" aria-hidden="true" />
                  )}
                  <span className="text-[16px] font-semibold text-[var(--ui-900)]">
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
              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={privacyAgreed}
                  onClick={() => setPrivacyAgreed((prev) => !prev)}
                  className="flex items-center gap-3 text-left"
                >
                  {privacyAgreed ? (
                    <CheckboxCheckedIcon
                      className="h-8 w-8 shrink-0 text-[var(--color-primary)]"
                      aria-hidden="true"
                    />
                  ) : (
                    <CheckboxUncheckedIcon className="h-8 w-8 shrink-0" aria-hidden="true" />
                  )}
                  <span className="text-[16px] font-semibold text-[var(--ui-900)]">
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
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--ui-50)] text-[var(--ui-300)]'
            }`}
          >
            다음
          </button>
        </div>
      </div>
      )}

      {isWaitModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-[360px] rounded-[24px] bg-[var(--ui-bg)] px-8 pb-8 pt-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <h2 className="text-[18px] font-semibold text-[var(--ui-900)]">
              리포트 제작 중이에요
            </h2>
            <p className="mt-2 text-[13px] text-[var(--ui-400)]">
              제작이 끝날 때까지 잠시만 기다려 주세요.
            </p>
            <button
              type="button"
              onClick={() => setIsWaitModalOpen(false)}
              className="mt-6 h-[48px] w-full rounded-[12px] bg-[#4E49FF] text-[16px] font-semibold text-white"
            >
              확인
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