import { useMemo, useState } from 'react';

type BasicProfileSectionProps = {
  onNext: () => void;
  onBack: () => void;
};

const BasicProfileSection = ({ onNext, onBack }: BasicProfileSectionProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');

  const hasWhitespace = useMemo(() => /\s/.test(nickname), [nickname]);
  const isNicknameValid = useMemo(() => {
    const trimmed = nickname.trim();
    return trimmed.length > 0 && !hasWhitespace;
  }, [nickname, hasWhitespace]);
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
              <div className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full border border-[var(--ui-200)] bg-[var(--ui-50)]">
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      setPreviewUrl(null);
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => {
                      setPreviewUrl(typeof reader.result === 'string' ? reader.result : null);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="선택한 프로필"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <>
                    <div className="h-6 w-6 rounded-full bg-[var(--ui-200)]" />
                    <div className="absolute bottom-4 h-7 w-10 rounded-t-[999px] bg-[var(--ui-200)]" />
                  </>
                )}
                <label
                  htmlFor="profileImage"
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-[var(--ui-200)] bg-[var(--ui-100)] text-[var(--ui-400)]"
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
              className={`h-[48px] w-full rounded-2xl border bg-[var(--ui-50)] px-4 text-[var(--ui-900)] placeholder:text-[var(--ui-300)] ${
                hasWhitespace ? 'border-[#FF4D4F]' : 'border-[var(--ui-100)]'
              }`}
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
            />
            {hasWhitespace && (
              <span className="Caption1 text-[#FF4D4F]">
                공백은 사용할 수 없어요.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto mb-24 flex flex-col gap-3">
        <button
          type="button"
          onClick={onNext}
          disabled={!isNicknameValid}
          className={`Body1 h-[48px] w-full rounded-xl font-semibold ${
            isNicknameValid
              ? 'bg-[var(--badge-text-primary)] text-white'
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
