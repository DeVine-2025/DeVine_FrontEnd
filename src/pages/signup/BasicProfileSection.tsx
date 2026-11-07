import { useEffect, useMemo, useState } from 'react';
import ProfilePlaceholderIcon from '@assets/icons/profile-placeholder.svg?react';
import { useAuth } from '@clerk/clerk-react';
import { confirmImageUpload, createPresignedUrl } from '@apis/image';
import { checkNicknameDuplicate } from '@apis/nickname-check';
import { ArrowLeft, Camera } from 'lucide-react';

type BasicProfileSectionProps = {
  preview?: boolean;
  onNext: (data: { nickname: string; imageUrl: string | null }) => void;
  onBack: () => void;
  initialData?: { nickname: string; imageUrl: string | null };
};

const BasicProfileSection = ({ onNext, onBack, initialData, preview = false }: BasicProfileSectionProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [isDuplicateNickname, setIsDuplicateNickname] = useState(false);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [nicknameCheckError, setNicknameCheckError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const trimmedNickname = useMemo(() => nickname.trim(), [nickname]);
  const hasInvalidNicknameCharacters = useMemo(
    () => trimmedNickname.length > 0 && !/^[가-힣A-Za-z0-9]+$/.test(nickname),
    [nickname, trimmedNickname],
  );

  const isLengthValid = useMemo(
    () => trimmedNickname.length >= 2 && trimmedNickname.length <= 20,
    [trimmedNickname],
  );

  // 닉네임 유효성: 길이 + 허용 문자(한글/영어/숫자)
  const isNicknameValid = useMemo(
    () => isLengthValid && !hasInvalidNicknameCharacters,
    [isLengthValid, hasInvalidNicknameCharacters],
  );

  useEffect(() => {
    if (!initialData) return;
    setNickname(initialData.nickname ?? '');
    setImageUrl(initialData.imageUrl ?? null);
    setPreviewUrl(initialData.imageUrl ?? null);
  }, [initialData?.imageUrl, initialData?.nickname]);

  const canUseNickname =
    isNicknameValid && !isDuplicateNickname && !isCheckingNickname && !nicknameCheckError;

  useEffect(() => {
    if (preview) {
      setIsDuplicateNickname(false);
      setIsCheckingNickname(false);
      setNicknameCheckError(null);
      return;
    }
    if (!isNicknameValid) {
      setIsDuplicateNickname(false);
      setIsCheckingNickname(false);
      setNicknameCheckError(null);
      return;
    }

    let isActive = true;
    const timer = window.setTimeout(async () => {
      try {
        setIsCheckingNickname(true);
        setNicknameCheckError(null);

        const isDuplicate = await checkNicknameDuplicate(trimmedNickname);
        if (isActive) {
          setIsDuplicateNickname(isDuplicate);
        }
      } catch {
        if (isActive) {
          setIsDuplicateNickname(false);
          setNicknameCheckError('닉네임 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        }
      } finally {
        if (isActive) {
          setIsCheckingNickname(false);
        }
      }
    }, 350);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [isNicknameValid, trimmedNickname, preview]);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setPreviewUrl(null);
      setImageUrl(null);
      setUploadError(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(typeof reader.result === 'string' ? reader.result : null);
    };
    reader.readAsDataURL(file);

    if (preview) return;

    setIsUploading(true);
    setUploadError(null);

    const token = await getToken();
    if (!token) {
      setIsUploading(false);
      setUploadError('이미지 업로드에 실패했어요. 다시 시도해주세요.');
      return;
    }

    try {
      const presigned = await createPresignedUrl(
        { imageType: 'PROFILE', fileName: file.name },
        token,
      );

      const uploadRes = await fetch(presigned.presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error(`upload failed: ${uploadRes.status}`);
      }

      const confirmed = await confirmImageUpload(presigned.imageId, presigned.imageUrl, token);
      setImageUrl(confirmed?.imageUrl ?? presigned.imageUrl ?? null);
    } catch {
      setImageUrl(null);
      setUploadError('이미지 업로드에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[515px] text-[#f5f5f7]">
      <div className="flex flex-col gap-12">
        <div>
          <h2 className="text-[clamp(26px,3vw,36px)] font-bold leading-[1.3] tracking-[-.04em]">프로필 설정</h2>
          <p className="mt-4 text-[16px] leading-[1.6] text-[#b5b7c8]">DeVine에서 사용할 프로필 정보를 입력해 주세요.</p>
        </div>

        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-3">
            <label className="text-[16px] font-semibold text-[#f0f0f5]" htmlFor="nickname">
              닉네임 <span className="ml-1 text-[var(--project-accent)]" aria-hidden="true">*</span>
            </label>
            <div className="relative">
            <input
              id="nickname"
              type="text"
              placeholder="닉네임을 입력해주세요"
              maxLength={20}
              aria-required="true"
              className={`h-[52px] w-full rounded-[10px] border bg-transparent px-4 pr-20 text-[15px] text-[#f5f5f7] outline-none transition-colors placeholder:text-[#85889a] focus:border-[var(--project-accent)] ${
                hasInvalidNicknameCharacters || isDuplicateNickname
                  ? 'border-[#c78f9d]'
                  : 'border-white/[0.12]'
              }`}
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[14px] text-[#999caf]" aria-hidden="true">{nickname.length} / 20</span>
            </div>

            {!isLengthValid && (
              <span className={trimmedNickname ? 'text-[13px] text-[#d9a4ae]' : 'text-[13px] text-[#a9abc0]'}>
                2자 이상 20자 이하로 입력해 주세요.
              </span>
            )}

            {isLengthValid && hasInvalidNicknameCharacters && (
              <span className="Caption1 text-[#d9a4ae]">한글, 영어, 숫자만을 포함해 닉네임을 입력해주세요</span>
            )}

            {!hasInvalidNicknameCharacters && isDuplicateNickname && (
              <span className="Caption1 text-[#d9a4ae]">이미 누군가가 사용 중인 닉네임이에요</span>
            )}

            {!hasInvalidNicknameCharacters && !isDuplicateNickname && isCheckingNickname && (
              <span className="Caption1 text-[var(--ui-400)]">닉네임 중복 확인 중...</span>
            )}

            {!hasInvalidNicknameCharacters && nicknameCheckError && (
              <span className="Caption1 text-[#d9a4ae]">{nicknameCheckError}</span>
            )}

            {!hasInvalidNicknameCharacters && canUseNickname && (
              <span className="Caption1 text-[var(--project-accent)]">사용 가능한 닉네임이에요!</span>
            )}

            {isUploading && <span className="Caption1 text-[var(--ui-400)]">이미지 업로드 중...</span>}
            {uploadError && <span className="Caption1 text-[#d9a4ae]">{uploadError}</span>}
          </div>
          <div className="flex min-h-[96px] items-center gap-4 rounded-[12px] border border-white/[0.12] bg-transparent px-5 py-3 sm:gap-5">
            <div className="relative h-[68px] w-[68px] shrink-0">
              {previewUrl ? <img src={previewUrl} alt="선택한 프로필" className="h-full w-full rounded-full object-cover" /> : <ProfilePlaceholderIcon className="h-full w-full [&_circle:first-child]:fill-[#292a35] [&_circle:first-child]:stroke-[#414251] [&_circle:nth-child(2)]:fill-[#686c79] [&_path]:fill-[#686c79]" aria-hidden="true" />}
              <input id="profileImage" type="file" accept="image/*" className="peer sr-only" onChange={handleImageChange} />
              <label htmlFor="profileImage" aria-label="프로필 사진 업로드" className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-[#55586a] bg-[#22232d] text-[#e4e2f0] transition-colors hover:text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--project-accent)]"><Camera size={14} aria-hidden="true" /></label>
            </div>
            <div className="min-w-0 flex-1"><p className="text-[16px] font-semibold text-[#f0f0f5]">프로필 사진 추가</p><p className="mt-1 text-[13px] leading-[1.5] text-[#a9abc0]">선택 사항 · 나중에 변경할 수 있어요</p></div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-4">
        <button
          type="button"
          onClick={() => onNext({ nickname: trimmedNickname, imageUrl })}
          disabled={!canUseNickname || isUploading}
          className={`h-[52px] w-full rounded-[10px] border text-[15px] font-semibold tracking-[-.01em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--project-accent)] ${
            canUseNickname && !isUploading
              ? 'cursor-pointer border-transparent bg-[var(--project-accent)] text-[#191824] hover:bg-[color-mix(in_srgb,var(--project-accent)_85%,white)]'
              : 'cursor-not-allowed border-white/[0.10] bg-white/[0.035] text-[#8f92a3]'
          }`}
        >
          다음
        </button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-fit self-center text-[14px] text-[#a9abc0] transition-colors hover:text-[#f5f5f7]"
        >
          <ArrowLeft size={17} aria-hidden="true" /><span className="ml-2">돌아가기</span>
        </button>
      </div>
    </div>
  );
};

export default BasicProfileSection;
