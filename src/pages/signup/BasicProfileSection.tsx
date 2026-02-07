import { useEffect, useMemo, useState } from 'react';
import ProfilePlaceholderIcon from '@assets/icons/profile-placeholder.svg?react';
import { useAuth } from '@clerk/clerk-react';
import { confirmImageUpload, createPresignedUrl } from '@apis/image';
import { checkNicknameDuplicate } from '@apis/member';

type BasicProfileSectionProps = {
  onNext: (data: { nickname: string; imageUrl: string | null }) => void;
  onBack: () => void;
};

const BasicProfileSection = ({ onNext, onBack }: BasicProfileSectionProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [isDuplicateNickname, setIsDuplicateNickname] = useState(false);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [nicknameCheckError, setNicknameCheckError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const hasWhitespace = useMemo(() => /\s/.test(nickname), [nickname]);
  const trimmedNickname = useMemo(() => nickname.trim(), [nickname]);
  const isLengthValid = useMemo(
    () => trimmedNickname.length >= 2 && trimmedNickname.length <= 20,
    [trimmedNickname],
  );
  const isNicknameValid = useMemo(
    () => isLengthValid && !hasWhitespace,
    [isLengthValid, hasWhitespace],
  );
  const canUseNickname = isNicknameValid && !isDuplicateNickname && !isCheckingNickname;

  useEffect(() => {
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
        const token = await getToken();
        const isDuplicate = await checkNicknameDuplicate(trimmedNickname, token ?? undefined);
        if (isActive) {
          setIsDuplicateNickname(isDuplicate);
        }
      } catch {
        if (isActive) {
          setIsDuplicateNickname(false);
          setNicknameCheckError('닉네임 중복 확인에 실패했어요.');
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
  }, [getToken, isNicknameValid, trimmedNickname]);

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

    setIsUploading(true);
    setUploadError(null);

    try {
      const token = await getToken();
      const presigned = await createPresignedUrl(
        { imageType: 'PROFILE', fileName: file.name },
        token ?? undefined,
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
      const confirmed = await confirmImageUpload(presigned.imageId, token ?? undefined);
      setImageUrl(confirmed?.imageUrl ?? presigned.imageUrl ?? null);
    } catch {
      setImageUrl(null);
      setUploadError('이미지 업로드에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <div className="mx-auto flex h-[660px] w-full max-w-[632px] flex-col rounded-[32px] bg-[var(--ui-bg)] px-10 pb-20 pt-10 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2 text-[var(--ui-1000)]">
          <h2 className="Heading2 font-semibold">프로필을 입력해주세요</h2>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <span className="Body1 text-[var(--ui-900)]">프로필 사진</span>
            <div className="flex items-center justify-center">
              <div className="relative flex h-[112px] w-[112px] items-center justify-center rounded-full bg-transparent">
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageChange}
                />
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="선택한 프로필"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <ProfilePlaceholderIcon className="h-full w-full" aria-hidden="true" />
                )}
                <label
                  htmlFor="profileImage"
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--ui-200)] bg-[var(--ui-200)] text-xl text-white"
                >
                  +
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="Body1 text-[var(--ui-900)]" htmlFor="nickname">
              닉네임
            </label>
            <input
              id="nickname"
              type="text"
              placeholder="닉네임을 입력해주세요"
              className={`h-[48px] w-full rounded-2xl border-2 bg-[var(--ui-50)] px-4 text-[var(--ui-900)] placeholder:text-[var(--ui-300)] ${
                canUseNickname
                  ? 'border-[#00BF40]'
                  : hasWhitespace || isDuplicateNickname
                    ? 'border-[#FF4242]'
                    : 'border-[var(--ui-100)]'
              }`}
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
            />
            {hasWhitespace && (
              <span className="Caption1 text-[#FF4242]">공백은 사용할 수 없어요.</span>
            )}
            {!hasWhitespace && !isLengthValid && (
              <span className="Caption1 text-[#FF4242]">닉네임은 2자 이상 20자 이하로 입력해주세요.</span>
            )}
            {!hasWhitespace && isDuplicateNickname && (
              <span className="Caption1 text-[#FF4242]">
                이미 누군가가 사용 중인 닉네임이에요
              </span>
            )}
            {!hasWhitespace && !isDuplicateNickname && isCheckingNickname && (
              <span className="Caption1 text-[var(--ui-400)]">닉네임 중복 확인 중...</span>
            )}
            {!hasWhitespace && nicknameCheckError && (
              <span className="Caption1 text-[#FF4242]">{nicknameCheckError}</span>
            )}
            {!hasWhitespace && canUseNickname && (
              <span className="Caption1 text-[#00BF40]">사용 가능한 닉네임이에요!</span>
            )}
            {isUploading && (
              <span className="Caption1 text-[var(--ui-400)]">이미지 업로드 중...</span>
            )}
            {uploadError && (
              <span className="Caption1 text-[#FF4242]">{uploadError}</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto mb-24 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onNext({ nickname: trimmedNickname, imageUrl })}
          disabled={!canUseNickname || isUploading}
          className={`Body1 h-[48px] w-full rounded-xl font-semibold ${
            canUseNickname && !isUploading
              ? 'bg-[#4E49FF] text-white'
              : 'bg-[var(--ui-100)] text-[var(--ui-400)]'
          }`}
        >
          다음
        </button>
        <button type="button" onClick={onBack} className="Body1 text-[var(--ui-400)]">
          돌아가기
        </button>
      </div>
    </div>
  );
};

export default BasicProfileSection;
