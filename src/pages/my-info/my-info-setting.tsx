import type { UpdateProfileRequest } from '@apis/myInfo/myInfo';
import { myInfoQueries, updateMyProfile } from '@apis/myInfo/myInfo-queries';
import GithubIcon from '@assets/icons/github.svg?react';
import GoogleIcon from '@assets/icons/google.svg?react';
import { useUser } from '@clerk/clerk-react';
import Switch from '@components/myInfo/Switch';
import TabMenu from '@components/myInfo/TabMenu';
import { cn } from '@libs/cn';
import { useAuthStore } from '@store/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

interface SettingMenuProps {
  title: string;
  description: string;
}

interface LabelProps {
  content: string;
  isConnect: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const SettingMenu = ({ title, description }: SettingMenuProps) => {
  return (
    <div className="flex-col gap-[1.6rem]">
      <p className="font-bold text-3xl text-ui-1000">{title}</p>
      <p className="text-2xl text-ui-600">{description}</p>
    </div>
  );
};

const LabelButton = ({ content, isConnect, disabled = false, onClick }: LabelProps) => {
  return (
    <button
      type="button"
      disabled={isConnect || disabled}
      onClick={onClick}
      className={cn(
        'w-fit cursor-pointer px-[1.2rem] py-[0.8rem] font-semibold text-xl',
        isConnect ? 'text-primary' : 'rounded-full bg-ui-50 text-ui-300',
        disabled && 'opacity-60 cursor-not-allowed',
      )}
    >
      {content}
    </button>
  );
};

const MyInfoSetting = () => {
  const [isOnFirst, setIsOnFirst] = useState<boolean>(false);
  const [isOnSecond, setIsOnSecond] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('PM');
  const [loadingProvider, setLoadingProvider] = useState<'github' | 'google' | null>(null);
  const tabs = ['PM', '개발자'];
  const { user, isLoaded } = useUser();
  const queryClient = useQueryClient();
  const setRole = useAuthStore((state) => state.setRole);

  const { data: profileData } = useQuery(myInfoQueries.profile());
  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['member'] });
      setRole(variables.mainType === 'PM' ? 'pm' : 'dev');
    },
    onError: (_err, variables) => {
      setActiveTab(variables.mainType === 'PM' ? '개발자' : 'PM');
      alert('메인 권한 변경에 실패했습니다.');
    },
  });

  const disclosureMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member'] });
    },
    onError: () => {
      setIsOnFirst((prev) => !prev);
      alert('개발자 검색 노출 설정 변경에 실패했습니다.');
    },
  });

  const proposalAlarmMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member'] });
    },
    onError: () => {
      setIsOnSecond((prev) => !prev);
      alert('프로젝트 제안 알림 설정 변경에 실패했습니다.');
    },
  });

  useEffect(() => {
    const mainType = profileData?.result?.member?.mainType;
    if (mainType === 'PM' || mainType === 'DEVELOPER') {
      setActiveTab(mainType === 'PM' ? 'PM' : '개발자');
    }
  }, [profileData]);

  useEffect(() => {
    const disclosure = profileData?.result?.member?.disclosure;
    if (typeof disclosure === 'boolean') {
      setIsOnFirst(disclosure);
    }
  }, [profileData?.result?.member?.disclosure]);

  useEffect(() => {
    const proposalAlarm = profileData?.result?.member?.proposalAlarm;
    if (typeof proposalAlarm === 'boolean') {
      setIsOnSecond(proposalAlarm);
    }
  }, [profileData?.result?.member?.proposalAlarm]);

  const handleDisclosureChange = (next: boolean) => {
    const profile = profileData?.result;
    if (!profile) return;
    setIsOnFirst(next);
    const payload: UpdateProfileRequest = {
      nickname: profile.member?.nickname ?? '',
      address: profile.member?.address ?? '',
      body: profile.member?.body ?? '',
      domains: profile.domains ?? [],
      contacts: profile.contacts ?? [],
      mainType: (profile.member?.mainType === 'PM' ? 'PM' : 'DEVELOPER') as 'PM' | 'DEVELOPER',
      disclosure: next,
      proposalAlarm: profile.member?.proposalAlarm ?? false,
      ...(profile.member?.imageUrl && { imageUrl: profile.member.imageUrl }),
    };
    disclosureMutation.mutate(payload);
  };

  const handleProposalAlarmChange = (next: boolean) => {
    const profile = profileData?.result;
    if (!profile) return;
    setIsOnSecond(next);
    const payload: UpdateProfileRequest = {
      nickname: profile.member?.nickname ?? '',
      address: profile.member?.address ?? '',
      body: profile.member?.body ?? '',
      domains: profile.domains ?? [],
      contacts: profile.contacts ?? [],
      mainType: (profile.member?.mainType === 'PM' ? 'PM' : 'DEVELOPER') as 'PM' | 'DEVELOPER',
      disclosure: profile.member?.disclosure ?? false,
      proposalAlarm: next,
      ...(profile.member?.imageUrl && { imageUrl: profile.member.imageUrl }),
    };
    proposalAlarmMutation.mutate(payload);
  };

  const handleMainTypeChange = (tab: string) => {
    if (tab === activeTab) return;
    const profile = profileData?.result;
    if (!profile) return;

    const newMainType = tab === 'PM' ? 'PM' : 'DEVELOPER';
    const payload: UpdateProfileRequest = {
      nickname: profile.member?.nickname ?? '',
      address: profile.member?.address ?? '',
      body: profile.member?.body ?? '',
      domains: profile.domains ?? [],
      contacts: profile.contacts ?? [],
      mainType: newMainType,
      disclosure: profile.member?.disclosure ?? true,
      proposalAlarm: profile.member?.proposalAlarm ?? false,
      ...(profile.member?.imageUrl && { imageUrl: profile.member.imageUrl }),
    };
    setActiveTab(tab);
    updateMutation.mutate(payload);
  };

  const hasGoogle = user?.externalAccounts?.some((acc) => acc.provider === 'google');

  const hasGithub = user?.externalAccounts?.some((acc) => acc.provider === 'github');


  const linkExternalAccount = async (provider: 'github' | 'google') => {
    if (!isLoaded || !user) return;
    try {
      setLoadingProvider(provider);
      const externalAccount = await user.createExternalAccount({
        strategy: provider === 'github' ? 'oauth_github' : 'oauth_google',
        redirectUrl: `${window.location.origin}/my-info/setting`,
      });

      if (externalAccount.verification?.externalVerificationRedirectURL) {
        window.location.href =
          externalAccount.verification.externalVerificationRedirectURL.toString();
      }
    } catch (err) {
      const maybeError = err as { errors?: Array<{ code?: string }> };
      console.error('연동 에러:', err);
      if (maybeError.errors?.[0]?.code === 'external_account_exists') {
        alert('이미 다른 계정에 연결된 소셜 계정입니다.');
      } else {
        alert(`연동 중 오류가 발생했습니다. (${maybeError.errors?.[0]?.code ?? 'unknown'})`);
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="mt-[4rem] flex-col gap-[6rem]">
      <div className="flex items-center justify-between gap-[5rem]">
        <SettingMenu
          title={'메인 권한 설정'}
          description={'선택한 권한에 맞춰 가장 필요한 정보를 메인 화면에 먼저 확인할 수 있습니다.'}
        />
        <TabMenu activeTab={activeTab} setActiveTab={handleMainTypeChange} tabs={tabs} />
      </div>

      <div className="flex justify-between items-center">
        <SettingMenu title={"개발자 검색 노출 공개"} description={"공개 상태인 경우 내 프로필이 노출되어 프로젝트 제안을 받을 수 있습니다."} />
        <Switch
          isOn={isOnFirst}
          setIsOn={(updater) => {
            const next = typeof updater === 'function' ? updater(isOnFirst) : updater;
            handleDisclosureChange(next);
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <SettingMenu
          title={'프로젝트 제안 알림'}
          description={'PM이 제안하는 프로젝트 알림을 받을 수 있습니다.'}
        />
        <Switch
          isOn={isOnSecond}
          setIsOn={(updater) => {
            const next = typeof updater === 'function' ? updater(isOnSecond) : updater;
            handleProposalAlarmChange(next);
          }}
        />
      </div>

      {/*<div className="flex-col gap-[2.4rem]">*/}
      {/*  <div className="flex justify-between items-center">*/}
      {/*    <SettingMenu title={"계정 설정"} description={"연동된 계정"} />*/}
      {/*  </div>*/}
      {/*  <div className="flex justify-between gap-[20rem]">*/}
      {/*    <div className="flex flex-1 items-center justify-between">*/}
      {/*      <div className="flex items-center gap-[1.6rem]">*/}
      {/*        <GithubIcon className="w-11 h-11" />*/}
      {/*        <p className="text-ui-1000 text-2xl">GitHub</p>*/}
      {/*      </div>*/}
      {/*      <LabelButton*/}
      {/*        content={hasGithub ? '연동완료' : loadingProvider === 'github' ? '연동중' : '연동하기'}*/}
      {/*        isConnect={!!hasGithub}*/}
      {/*        disabled={loadingProvider !== null || !isLoaded}*/}
      {/*        onClick={() => void linkExternalAccount('github')}*/}
      {/*      />*/}
      {/*    </div>*/}
      {/*    <div className="flex flex-1 items-center justify-between">*/}
      {/*      <div className="flex items-center gap-[1.6rem]">*/}
      {/*        <div className="p-[1rem] border border-ui-100 rounded-full flex-col-center">*/}
      {/*          <GoogleIcon className="w-6 h-6 " />*/}
      {/*        </div>*/}
      {/*        <p className="text-ui-1000 text-2xl">Google</p>*/}
      {/*      </div>*/}
      {/*      <LabelButton*/}
      {/*        content={hasGoogle ? '연동완료' : loadingProvider === 'google' ? '연동중' : '연동하기'}*/}
      {/*        isConnect={!!hasGoogle}*/}
      {/*        disabled={loadingProvider !== null || !isLoaded}*/}
      {/*        onClick={() => void linkExternalAccount('google')}*/}
      {/*      />*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}
    </div>
  );
};

export default MyInfoSetting;
