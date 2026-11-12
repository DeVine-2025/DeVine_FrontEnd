import SignupNotices from './signup-notices';
import SignupAgreements from './signup-agreements';
import { useSignupTerms } from './use-signup-terms';
import BrandLogo from '@assets/images/devine-symbol.png';
import { useCallback, useRef, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import HorizonBackground from '@pages/landing/launch-ui/components/ui/horizon-background';
import { getProfileImageKey } from '@utils/storage';
import BasicProfileSection from './BasicProfileSection';
import AdditionalProfileSection from './AdditionalProfileSection';
import GithubRepoSelectionSection from './GithubRepoSelectionSection';
import ProfilePage from '@pages/login/profile-page';
import TermsDetailScreen from '@pages/signup/TermsDetailScreen';

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
  onConfirm: () => Promise<void> | void;
  loginProvider: 'github' | 'google';
  preview?: boolean;
};

const AgreementList = ({ onConfirm, loginProvider, preview = false }: AgreementListProps) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const onboardingConfirmedRef = useRef(false);
  const logoSubmitHandlerRef = useRef<null | (() => void)>(null);
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
  const [isStayModalOpen, setIsStayModalOpen] = useState(false);
  const [step, setStep] = useState<
    'agreements' | 'basicProfile' | 'profilePage' | 'additionalProfile' | 'signupComplete' | 'githubRepos'
  >('agreements');

  const termsState = useSignupTerms(preview);
  const { terms, agreedByTermsId, requiredAgreed, activeTerm, setActiveTermsId } = termsState;

  const handleConfirm = () => {
    if (!requiredAgreed || terms.length === 0) {
      return;
    }
    setStep('basicProfile');
  };

  const confirmOnboardingOnce = async () => {
    if (onboardingConfirmedRef.current) return true;
    try {
      await onConfirm();
      onboardingConfirmedRef.current = true;
      return true;
    } catch (error) {
      alert(error instanceof Error ? error.message : '회원가입 상태를 확인하지 못했습니다. 다시 시도해 주세요.');
      return false;
    }
  };

  const setAdditionalLogoHandler = useCallback((handler: (() => void) | null) => {
    logoSubmitHandlerRef.current = handler;
  }, []);

  return (
    <div className="fixed inset-0 z-50 isolate overflow-y-auto bg-[#101116]">
      <style>{`@keyframes signup-step-enter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-60 [&_.horizon-background]:!top-[26%] [&_.horizon-background]:!z-0 [&_.horizon-background]:!h-full">
        <HorizonBackground />
      </div>

      <div className="absolute left-1/2 top-0 h-[6rem] w-screen -translate-x-1/2">
        <div className="mx-auto flex h-full max-w-[144rem] items-center px-[12rem]">
          <button
            type="button"
            onClick={() => {
              if (step === 'githubRepos') {
                setIsWaitModalOpen(true);
                return;
              }
              if (step === 'additionalProfile') {
                setIsStayModalOpen(true);
                return;
              }
              if (step === 'signupComplete') {
                void confirmOnboardingOnce().then((confirmed) => { if (confirmed) navigate('/'); });
                return;
              }
              setIsStayModalOpen(true);
            }}
            className="flex items-center gap-[0.4rem] cursor-pointer"
            aria-label="메인으로 이동"
          >
            <img src={BrandLogo} alt="Devine" aria-hidden="true" className="h-[44px] w-[44px] object-contain" />
          </button>
        </div>
      </div>
      <div className="flex min-h-[100svh] items-center justify-center px-4 pb-[124px] pt-[84px] lg:max-2xl:pt-[72px] lg:max-2xl:pb-[clamp(48px,10svh,84px)]">
      <div key={step} className="w-full motion-safe:animate-[signup-step-enter_350ms_ease-out_both]">
      {step === 'basicProfile' ? (
        <div className="mx-auto w-full max-w-[632px] lg:max-2xl:max-w-[560px]">
          <BasicProfileSection
            preview={preview}
            onNext={(data) => {
              setBasicProfile(data);
              const profileImageKey = getProfileImageKey(user?.id ?? null);
              if (!preview && data.imageUrl) {
                localStorage.setItem(profileImageKey, data.imageUrl);
                window.dispatchEvent(new Event('profile-image-updated'));
              } else if (!preview) {
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
        <div className="mx-auto w-full max-w-[632px] lg:max-2xl:max-w-[560px]">
          <ProfilePage
            preview={preview}
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
        <div className="relative mx-auto flex h-[560px] w-full max-w-[680px] flex-col items-center justify-center gap-8 px-10 py-14 text-center">
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
              className="h-[54px] w-full cursor-pointer rounded-xl bg-[var(--color-primary)] text-[17px] font-semibold text-white"
            >
              리포트 생성하기
            </button>
            <button
              type="button"
              onClick={async () => {
                if (await confirmOnboardingOnce()) navigate('/');
              }}
              className="inline-flex w-fit self-center text-[15px] font-medium text-[var(--ui-400)]"
            >
              <span>메인 화면으로 이동하기</span>
            </button>
          </div>
        </div>
      ) : step === 'githubRepos' ? (
        <div className="mx-auto w-full max-w-[632px] lg:max-2xl:max-w-[560px]">
          <GithubRepoSelectionSection
            preview={preview}
            onBack={() => setStep('signupComplete')}
            onNext={async () => {
              if (await confirmOnboardingOnce()) navigate('/');
            }}
          />
        </div>
      ) : step === 'additionalProfile' ? (
        <div className="mx-auto w-full max-w-[632px] lg:max-2xl:max-w-[560px]">
          {terms.length > 0 ? (
            <AdditionalProfileSection
              preview={preview}
              onBack={() => setStep('profilePage')}
              setLogoSubmitHandler={setAdditionalLogoHandler}
              signupData={{
                agreements: terms.map((term) => ({
                  termsId: term.termsId,
                  agreed: agreedByTermsId[term.termsId] === true,
                })),
                nickname: basicProfile.nickname,
                imageUrl: basicProfile.imageUrl,
                mainType: profileInfo.mainType,
                categoryIds: profileInfo.categoryIds,
              }}
              onComplete={loginProvider === 'github' ? undefined : async () => {
                if (!await confirmOnboardingOnce()) throw new Error('회원가입 상태를 다시 확인해 주세요.');
              }}
              onNext={() => {
                if (loginProvider === 'github') {
                  setStep('signupComplete');
                } else {
                  void confirmOnboardingOnce().then((confirmed) => { if (confirmed) navigate('/'); });
                }
              }}
            />
          ) : null}
        </div>
      ) : (
      <SignupAgreements termsState={termsState} preview={preview} onConfirm={handleConfirm} />
      )}
      </div>

      </div>
      <SignupNotices isStayModalOpen={isStayModalOpen} isWaitModalOpen={isWaitModalOpen} onCloseStay={() => setIsStayModalOpen(false)} onCloseWait={() => setIsWaitModalOpen(false)} />
      <TermsDetailScreen
        compactDesktop
        open={activeTerm !== null}
        title={activeTerm?.title ?? ''}
        content={activeTerm?.content ?? ''}
        onClose={() => setActiveTermsId(null)}
      />
    </div>
  );
};

export default AgreementList;
