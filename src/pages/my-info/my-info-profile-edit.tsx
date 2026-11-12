import { DOMAIN_ICONS } from '@constants/domain-icons';
import { useProfileEditForm } from './use-profile-edit-form';
import TechStackChip from '@components/common/TechStackChip';
import { ProfileEditLoading } from '@components/common/LoadingLayouts';
import ImagePreview from '@components/profileDetail/ImagePreview';
import TechStackPicker from '@components/common/TechStackPicker';
import { Link } from 'react-router-dom';
import { Camera, Check, ChevronRight, ExternalLink, Mail, Plus, Search } from 'lucide-react';
import GitHubIcon from '@assets/icons/github.svg?react';
import LinkedInIcon from '@assets/icons/linkedin.svg?react';
import './my-info-profile-edit.css';

const domainOrder = ['교육', '소셜/커뮤니티', '엔터테인먼트', 'AI/데이터', '헬스케어', '핀테크', '이커머스', '기타'] as const;

const MyInfoProfileEdit = () => {
  const { isLoading, nickname, introduction, setIntroduction, email, setEmail, githubLink, setGithubLink, linkedInLink, setLinkedInLink, imageUrl, domains, isStackDropdownOpen, setIsStackDropdownOpen, isUploadingImage, fileInputRef, techStackData, stack, updateMutation, stackMutation, isButtonDisabled, handleSave, handleImageClick, handleImageChange, openStackPicker, handleStackApply, toggleDomain } = useProfileEditForm();

  if (isLoading) {
    return <ProfileEditLoading />;
  }

  const socialLinks = [
    { id: 'profile-github', label: 'GitHub 링크', value: githubLink, change: setGithubLink, Icon: GitHubIcon },
    { id: 'profile-linkedin', label: 'LinkedIn 링크', value: linkedInLink, change: setLinkedInLink, Icon: LinkedInIcon },
  ];

  return (
    <div className="profile-edit desktop-content">
      <nav className="profile-edit-breadcrumb flex items-center gap-[8px] text-[13px] text-[var(--text-secondary)]" aria-label="현재 위치">
        <Link to="/my-info/setting">설정</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">프로필</span>
      </nav>
      <form onSubmit={event => { event.preventDefault(); if (!isButtonDisabled) handleSave(); }}>
        <header className="profile-edit-header">
          <div>
            <h1>프로필 수정</h1>
            <p>다른 사용자에게 보여줄 프로필 정보를 관리합니다.</p>
          </div>
          <div className="profile-edit-actions flex items-center gap-[10px]">
            <Link className="profile-edit-button" to="/my-info">취소</Link>
            <button className="profile-edit-button profile-edit-save" type="submit" disabled={isButtonDisabled}>
              {updateMutation.isPending ? '저장 중…' : '저장'}
            </button>
          </div>
        </header>

        <section className="profile-edit-section" aria-labelledby="profile-edit-basic">
          <header className="profile-edit-section-heading">
            <h2 id="profile-edit-basic">기본 정보</h2>
            <p>프로필에 표시되는 기본 정보를 설정합니다.</p>
          </header>
          <div className="profile-edit-basic">
            <div className="profile-edit-photo">
              <div className="relative">
                <ImagePreview isExist={Boolean(imageUrl)} imageUrl={imageUrl} className="profile-edit-avatar" alt="현재 프로필 사진" />
                {isUploadingImage && <span className="profile-edit-uploading" role="status">업로드 중…</span>}
                <button className="profile-edit-camera" type="button" aria-label="프로필 사진 변경" onClick={handleImageClick} disabled={isUploadingImage}>
                  <Camera size={18} aria-hidden="true" />
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} hidden disabled={isUploadingImage} />
            </div>

            <div className="profile-edit-fields">
              <div className="profile-edit-field profile-edit-field-inline">
                <label htmlFor="profile-nickname">닉네임 <span aria-hidden="true">*</span></label>
                <div className="profile-edit-input">
                  <input id="profile-nickname" value={nickname} readOnly />
                  <span className="profile-edit-count">{nickname.length} / 20</span>
                </div>
              </div>
              <div className="profile-edit-field profile-edit-field-inline">
                <label htmlFor="profile-introduction">한 줄 소개</label>
                <div className="profile-edit-input profile-edit-textarea">
                  <textarea id="profile-introduction" value={introduction} maxLength={100} rows={2} onChange={event => setIntroduction(event.target.value)} />
                  <span className="profile-edit-count">{introduction.length} / 100</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="profile-edit-section" aria-labelledby="profile-edit-contact">
          <header className="profile-edit-section-heading">
            <h2 id="profile-edit-contact">연락처 및 링크</h2>
            <p>연락 가능한 정보와 외부 프로필을 연결합니다.</p>
          </header>
          <div className="profile-edit-fields">
            <div className="profile-edit-field profile-edit-field-inline">
              <label htmlFor="profile-email">이메일</label>
              <div className="profile-edit-input">
                <Mail size={18} aria-hidden="true" />
                <input id="profile-email" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" />
              </div>
            </div>
            <div className="profile-edit-social">
              {socialLinks.map(({ id, label, value, change, Icon }) => (
                <div className="profile-edit-field" key={id}>
                  <label htmlFor={id}>{label}</label>
                  <div className="profile-edit-input">
                    <Icon className="profile-edit-social-icon" aria-hidden="true" />
                    <input id={id} inputMode="url" value={value} onChange={event => change(event.target.value)} />
                    {/^(https?:\/\/)\S+$/i.test(value.trim()) && (
                      <a href={value.trim()} target="_blank" rel="noreferrer" aria-label={label + ' 열기'}>
                        <ExternalLink size={16} aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="profile-edit-section" aria-labelledby="profile-edit-stacks">
          <header className="profile-edit-section-heading">
            <h2 id="profile-edit-stacks">보유 스택</h2>
            <p>사용 가능한 기술 스택을 추가해 주세요.</p>
          </header>
          <div className="profile-edit-fields">
            <button type="button" className="profile-edit-input profile-edit-stack-search" aria-haspopup="dialog" disabled={!techStackData?.result || stackMutation.isPending} onClick={openStackPicker}>
              <Search size={18} aria-hidden="true" />
              <span>기술 스택 검색 (예: React, TypeScript, Next.js)</span>
            </button>
            <ul className="profile-edit-stacks">
              {stack.map(item => <TechStackChip key={item.techstackId} name={item.name} disabled={stackMutation.isPending} onRemove={() => stackMutation.mutate({ added: [], removed: [item.techstackId] })} />)}
              <li><button type="button" className="profile-edit-chip profile-edit-add" disabled={!techStackData?.result || stackMutation.isPending} onClick={openStackPicker}><Plus size={15} aria-hidden="true" /> 추가</button></li>
            </ul>
          </div>
        </section>

        <section className="profile-edit-section" aria-labelledby="profile-edit-domains">
          <header className="profile-edit-section-heading">
            <h2 id="profile-edit-domains">관심 도메인</h2>
            <p>관심 있는 분야를 선택하면 더 적합한 프로젝트를 추천해드려요.</p>
          </header>
          <div>
            <div className="profile-edit-domains">
              {domainOrder.map(domain => {
                const selected = domains.includes(domain);
                const Icon = DOMAIN_ICONS[domain];
                return (
                  <button key={domain} type="button" aria-pressed={selected} disabled={!selected && domains.length >= 3} onClick={() => toggleDomain(domain)}>
                    <Icon size={19} aria-hidden="true" />
                    <span>{domain}</span>
                    {selected && <Check className="profile-edit-domain-check" size={17} aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
            <p className="profile-edit-domain-count" aria-live="polite">최대 3개까지 선택할 수 있어요. ({domains.length}/3)</p>
          </div>
        </section>
      </form>

      {isStackDropdownOpen && (
        <TechStackPicker
          valueType="id"
          value={[...new Set(stack.map((item) => String(item.techstackId)))]}
          onApply={handleStackApply}
          onClose={() => setIsStackDropdownOpen(false)}
          title="보유 스택 선택"
          description="프로필에 표시할 기술을 선택하세요."
        />
      )}
    </div>
  );
};

export default MyInfoProfileEdit;
