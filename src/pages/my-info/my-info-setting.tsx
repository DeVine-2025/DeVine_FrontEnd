import { myInfoQueries, updateMyProfile } from '@apis/myInfo/myInfo-queries';
import GithubIcon from '@assets/icons/github.svg?react';
import GoogleIcon from '@assets/icons/google.svg?react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useElasticUnderline } from '@hooks/useElasticUnderline';
import { useAuthStore } from '@store/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BriefcaseBusiness, CodeXml, Ellipsis, LogOut, Paperclip } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const settingsSaveScope = { id: 'my-info-settings' };

function SettingMenu({ title, description }: { title: string; description: string }) {
  return (
    <div className="my-info-setting-copy">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

const MyInfoSetting = () => {
  const [isOnFirst, setIsOnFirst] = useState<boolean>(false);
  const [isOnSecond, setIsOnSecond] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('PM');
  const [loadingProvider, setLoadingProvider] = useState<'github' | 'google' | null>(null);
  const tabs = [{ label: 'PM', Icon: BriefcaseBusiness }, { label: '개발자', Icon: CodeXml }];
  const { navRef: roleSelectorRef, indicatorRef: roleIndicatorRef } = useElasticUnderline(activeTab, 'button[aria-pressed=true]');
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const logout = useMutation({
    mutationFn: () => signOut(),
    onSuccess: () => navigate('/', { replace: true }),
  });
  const queryClient = useQueryClient();
  const setRole = useAuthStore((state) => state.setRole);

  const { data: profileData } = useQuery(myInfoQueries.profile());
  const updateMutation = useMutation({
    scope: settingsSaveScope,
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
    scope: settingsSaveScope,
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
    scope: settingsSaveScope,
    mutationFn: updateMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member'] });
    },
    onError: () => {
      setIsOnSecond((prev) => !prev);
      alert('프로젝트 제안 알림 설정 변경에 실패했습니다.');
    },
  });

  const mainType = profileData?.result?.member?.mainType;
  useEffect(() => {
    if (mainType === 'PM' || mainType === 'DEVELOPER') {
      setActiveTab(mainType === 'PM' ? 'PM' : '개발자');
    }
  }, [mainType]);

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
    setIsOnFirst(next);
    disclosureMutation.mutate({ disclosure: next });
  };

  const handleProposalAlarmChange = (next: boolean) => {
    setIsOnSecond(next);
    proposalAlarmMutation.mutate({ proposalAlarm: next });
  };

  const handleMainTypeChange = (tab: string) => {
    if (tab === activeTab) return;
    const profile = profileData?.result;
    if (!profile) return;

    const newMainType = tab === 'PM' ? 'PM' : 'DEVELOPER';
    setActiveTab(tab);
    updateMutation.mutate({ mainType: newMainType });
  };




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

  const settingsUnavailable = !profileData?.result;
  const preferences = [
    { title: '개발자 검색 노출 공개', description: '공개 상태인 경우 내 프로필이 노출되어 프로젝트 제안을 받을 수 있습니다.', checked: isOnFirst, change: handleDisclosureChange, saving: disclosureMutation.isPending },
    { title: '프로젝트 제안 알림', description: 'PM이 제안하는 프로젝트 알림을 받을 수 있습니다.', checked: isOnSecond, change: handleProposalAlarmChange, saving: proposalAlarmMutation.isPending },
  ];
  const providers = [
    { provider: 'github', label: 'GitHub', description: '개발 활동과 프로젝트를 연동할 수 있습니다.', Icon: GithubIcon },
    { provider: 'google', label: 'Google', description: 'Google 계정으로 간편하게 로그인할 수 있습니다.', Icon: GoogleIcon },
  ] as const;

  return (
    <section className="my-info-settings" aria-labelledby="my-info-settings-title">
      <header className="my-info-settings-heading">
        <h2 id="my-info-settings-title">설정</h2>
        <p>계정과 서비스 이용 환경을 관리합니다.</p>
      </header>

      <section className="my-info-settings-group" aria-labelledby="settings-general">
        <h3 id="settings-general">기본 설정</h3>
        <div className="my-info-settings-card">
          <div className="my-info-setting-row my-info-setting-role">
            <SettingMenu title="메인 권한" description="선택한 권한에 맞춰 가장 필요한 정보를 메인 화면에 먼저 확인할 수 있습니다." />
            <nav ref={roleSelectorRef} className="my-info-role-selector" role="group" aria-label="메인 권한">
              {tabs.map(({ label, Icon }) => (
                <button key={label} type="button" aria-pressed={activeTab === label} disabled={settingsUnavailable || updateMutation.isPending} onClick={() => handleMainTypeChange(label)}>
                  <Icon size={15} aria-hidden="true" />
                  {label}
                </button>
              ))}
              <span ref={roleIndicatorRef} className="my-info-tabs-indicator" aria-hidden="true" />
            </nav>
          </div>
        </div>
      </section>

      <section className="my-info-settings-group" aria-labelledby="settings-preferences">
        <h3 id="settings-preferences">공개 및 알림</h3>
        <div className="my-info-settings-card">
          {preferences.map(({ title, description, checked, change, saving }) => (
            <div className="my-info-setting-row" key={title}>
              <SettingMenu title={title} description={description} />
              <button className="my-info-setting-switch" type="button" role="switch" aria-label={title} aria-checked={checked} disabled={settingsUnavailable || saving} onClick={() => change(!checked)}>
                <span aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="my-info-settings-group" aria-labelledby="settings-accounts">
        <h3 id="settings-accounts">연결된 계정</h3>
        <div className="my-info-settings-card">
          {providers.map(({ provider, label, description, Icon }) => {
            const account = user?.externalAccounts.find(item => item.provider === provider);
            return (
              <div className="my-info-setting-row my-info-account-row" key={provider}>
                <div className="my-info-account-provider">
                  <span className="my-info-account-icon"><Icon aria-hidden="true" /></span>
                  <SettingMenu title={label} description={description} />
                </div>
                {account ? (
                  <div className="my-info-account-actions">
                    <span className="my-info-account-connected"><Paperclip size={14} aria-hidden="true" /> 연결됨</span>
                    <details className="my-info-account-details">
                      <summary aria-label={label + ' 연결 정보'}><Ellipsis size={18} aria-hidden="true" /></summary>
                      <div className="my-info-account-popover">
                        <strong>{label} 연결 정보</strong>
                        <p>{account.username || account.emailAddress || '연결된 계정입니다.'}</p>
                      </div>
                    </details>
                  </div>
                ) : (
                  <button className="my-info-control" type="button" disabled={loadingProvider !== null || !isLoaded} onClick={() => void linkExternalAccount(provider)}>
                    {loadingProvider === provider ? '연결 중…' : '연결하기'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="my-info-settings-group" aria-labelledby="settings-session">
        <h3 id="settings-session">로그인 세션</h3>
        <div className="my-info-settings-card">
          <div className="my-info-setting-row">
            <SettingMenu title="로그아웃" description="현재 기기에서 로그아웃합니다." />
            <button className="my-info-control my-info-logout" type="button" disabled={!isLoaded || logout.isPending} onClick={() => logout.mutate()}>
              <LogOut size={16} aria-hidden="true" /> {logout.isPending ? '로그아웃 중…' : '로그아웃'}
            </button>
          </div>
          {logout.isError && <p className="my-info-logout-error" role="alert">로그아웃에 실패했어요. 다시 시도해 주세요.</p>}
        </div>
      </section>
    </section>
  );
};

export default MyInfoSetting;
