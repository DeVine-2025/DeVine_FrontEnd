import { useState } from 'react';
import type { ComponentType, ChangeEvent, SVGProps } from 'react';
import PlusIcon from '@assets/icons/create-project/plus.svg?react';
import UnderVectorIcon from '@assets/icons/create-project/under-vector.svg?react';
import TablerIconH1 from '@assets/icons/create-project/tabler-icon-h-1.svg?react';
import TablerIconH2 from '@assets/icons/create-project/tabler-icon-h-2.svg?react';
import TablerIconBold from '@assets/icons/create-project/tabler-icon-bold.svg?react';
import TablerIconItalic from '@assets/icons/create-project/tabler-icon-italic.svg?react';
import TablerIconStrikethrough from '@assets/icons/create-project/tabler-icon-strikethrough.svg?react';
import TablerIconUnderline from '@assets/icons/create-project/tabler-icon-underline.svg?react';
import TablerIconListNumbers from '@assets/icons/create-project/tabler-icon-list-numbers.svg?react';
import TablerIconList from '@assets/icons/create-project/tabler-icon-list.svg?react';
import TablerIconPhoto from '@assets/icons/create-project/tabler-icon-photo.svg?react';
import TablerIconLink from '@assets/icons/create-project/tabler-icon-link.svg?react';
import SelectDropdown from '@components/common/SelectDropdown';

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

function Label({ children }: { children: string }) {
  return (
    <p className="Headline1 font-medium text-[var(--ui-700)]">
      {children}
    </p>
  );
}

function SubLabel({ children }: { children: string }) {
  return (
    <p className="Label1 font-medium text-[var(--ui-700)]">
      {children}
    </p>
  );
}

function DropdownLike({ placeholder }: { placeholder: string }) {
  return (
    <button
      type="button"
      className="relative flex h-[44px] w-full items-center rounded-[12px] border border-[var(--ui-200)] bg-[var(--ui-bg)] px-[12px] text-left"
    >
      <span className="Caption1 text-[var(--ui-400)]">{placeholder}</span>
      <span className="absolute right-[10px] top-1/2 -translate-y-1/2 inline-flex h-[28px] w-[28px] items-center justify-center text-[var(--ui-400)]">
        <UnderVectorIcon aria-hidden className="h-[9px] w-[16px]" />
      </span>
    </button>
  );
}

function InputLike({ placeholder, value }: { placeholder: string; value?: string }) {
  return (
    <input
      value={value ?? ''}
      placeholder={placeholder}
      onChange={() => {
        // NOTE: legacy wrapper kept for compatibility; prefer InputField below.
      }}
      className="h-[48px] w-full rounded-[12px] border border-[var(--ui-200)] bg-[var(--ui-50)] px-[12px] Caption1 font-medium tracking-[0.0912px] text-[var(--ui-900)] placeholder:text-[var(--ui-300)] focus:outline-none focus:ring-2 focus:ring-[rgba(78,73,255,0.25)]"
    />
  );
}

function InputField({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={handleChange}
      className="h-[48px] w-full rounded-[12px] border border-[var(--ui-200)] bg-[var(--ui-50)] px-[12px] Caption1 font-medium tracking-[0.0912px] text-[var(--ui-900)] placeholder:text-[var(--ui-300)] focus:outline-none focus:ring-2 focus:ring-[rgba(78,73,255,0.25)]"
    />
  );
}

function TextAreaField({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value);
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      onChange={handleChange}
      className="min-h-[380px] w-full resize-none bg-transparent Caption1 font-medium tracking-[0.0912px] text-[var(--ui-900)] placeholder:text-[var(--ui-300)] focus:outline-none"
    />
  );
}

function ImageSlot({ label }: { label: string }) {
  return (
    <div className="relative h-[166px] w-[296px] overflow-hidden rounded-[12px] bg-[var(--ui-50)]">
      <p className="Body1 absolute left-1/2 top-[31px] w-[150px] -translate-x-1/2 text-center font-medium text-[var(--ui-400)]">
        {label}
      </p>
      <div className="absolute left-1/2 top-[75px] h-[60px] w-[60px] -translate-x-1/2 overflow-hidden rounded-full flex-row-center">
        <PlusIcon aria-hidden className="h-full w-full" />
      </div>
    </div>
  );
}

function ToolbarButton({ Icon, label }: { Icon: SvgIcon; label: string }) {
  return (
    <button
      type="button"
      className="flex h-[20px] w-[20px] items-center justify-center text-[var(--ui-400)] hover:text-[var(--ui-700)] transition-colors"
      aria-label={label}
    >
      <Icon aria-hidden className="h-[20px] w-[20px]" />
    </button>
  );
}

const ProjectCreatePage = () => {
  const [locationText, setLocationText] = useState('');
  const [deadlineText, setDeadlineText] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectContent, setProjectContent] = useState('');
  const [projectType, setProjectType] = useState<string | null>(null);

  return (
    <div className="-mx-6 -my-8">
      {/* 상단 타이틀 영역 */}
      <section className="bg-[var(--ui-bg)]">
        <div className="mx-auto w-full max-w-[1018px] px-6 py-[36px]">
          <h1 className="Title3 font-bold text-[var(--ui-900)]">
            <span className="block">프로젝트를 등록하고</span>
            <span className="block">함께 성장할 개발자들을 만나보세요</span>
          </h1>
        </div>
      </section>

      {/* 본문(회색 배경 + 카드) */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-[var(--ui-50)] py-[64px]">
        <div className="mx-auto w-full max-w-[1018px] border border-[var(--ui-200)] bg-[var(--ui-bg)] px-6 py-[40px]">
          <div className="mx-auto w-full max-w-[922px]">
            <div className="flex flex-col gap-[64px]">
              {/* 1. 프로젝트 정보 */}
              <section className="flex flex-col gap-[40px]">
                <h2 className="Heading2 font-semibold text-[var(--ui-900)]">
                  1. 프로젝트 정보를 입력해주세요
                </h2>

                <div className="flex flex-col gap-[40px]">
                  <div className="grid w-full grid-cols-2 gap-x-[240px] gap-y-[32px] max-[1100px]:grid-cols-1 max-[1100px]:gap-x-0">
                    <div className="flex w-[320px] flex-col gap-[16px] max-[1100px]:w-full">
                      <Label>프로젝트 유형</Label>
                      <SelectDropdown
                        placeholder="프로젝트 유형"
                        value={projectType}
                        onChange={setProjectType}
                        options={[
                          { label: '웹', value: '웹' },
                          { label: '모바일/앱', value: '모바일/앱' },
                          { label: '게임', value: '게임' },
                          { label: '블록체인', value: '블록체인' },
                          { label: '기타', value: '기타' },
                        ]}
                      />
                    </div>

                    <div className="flex w-[320px] flex-col gap-[16px] max-[1100px]:w-full">
                      <Label>도메인</Label>
                      <DropdownLike placeholder="도메인" />
                    </div>

                    <div className="flex w-[320px] flex-col gap-[16px] max-[1100px]:w-full">
                      <Label>진행 방식</Label>
                      <DropdownLike placeholder="진행 방식" />
                    </div>

                    <div className="flex w-[320px] flex-col gap-[16px] max-[1100px]:w-full">
                      <Label>진행 기간</Label>
                      <DropdownLike placeholder="진행 기간" />
                    </div>

                    <div className="flex w-[320px] flex-col gap-[16px] max-[1100px]:w-full">
                      <Label>진행 장소</Label>
                      <InputField placeholder="서울시 중구" value={locationText} onChange={setLocationText} />
                    </div>

                    <div className="flex w-[320px] flex-col gap-[16px] max-[1100px]:w-full">
                      <Label>모집 마감일</Label>
                      <InputField placeholder="YYYY.MM.DD" value={deadlineText} onChange={setDeadlineText} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-[20px]">
                    <Label>모집 분야</Label>

                    <div className="flex flex-col gap-[12px]">
                      <div className="flex w-full items-end gap-[16px] max-[1100px]:flex-col max-[1100px]:items-stretch">
                        <div className="flex w-[212px] flex-col gap-[8px] max-[1100px]:w-full">
                          <SubLabel>포지션</SubLabel>
                          <DropdownLike placeholder="포지션" />
                        </div>

                        <div className="flex w-[212px] flex-col gap-[8px] max-[1100px]:w-full">
                          <SubLabel>모집 인원</SubLabel>
                          <DropdownLike placeholder="모집 인원" />
                        </div>

                        <div className="flex w-[358px] flex-col gap-[8px] max-[1100px]:w-full">
                          <SubLabel>기술 스택</SubLabel>
                          <DropdownLike placeholder="기술 스택" />
                        </div>

                        <button
                          type="button"
                          className="flex h-[44px] w-[80px] items-center justify-center rounded-[12px] bg-[var(--ui-50)] px-[12px] py-[10px] max-[1100px]:w-full"
                        >
                          <span className="Body1 font-medium text-[var(--ui-400)]">
                            저장
                          </span>
                        </button>
                      </div>

                      <div className="h-[158px] w-full rounded-[16px] border border-[var(--ui-200)] bg-[var(--ui-bg)] p-[16px]">
                        <p className="Caption1 tracking-[0.0912px] text-[var(--ui-300)]">
                          아직 등록된 모집 분야가 없습니다. 위에서 정보를 입력해 주세요.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. 프로젝트 내용 */}
              <section className="flex flex-col gap-[40px]">
                <h2 className="Heading2 font-semibold text-[var(--ui-900)]">
                  2. 프로젝트 내용을 입력해주세요
                </h2>

                <div className="flex flex-col gap-[40px]">
                  <div className="relative flex flex-col gap-[12px]">
                    <Label>프로젝트 대표 사진</Label>
                    <div className="flex gap-[12px] max-[1100px]:flex-col">
                      <ImageSlot label="대표 사진 추가하기" />
                      <ImageSlot label="사진 추가하기" />
                      <ImageSlot label="사진 추가하기" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-[12px]">
                    <Label>프로젝트 제목</Label>
                    <InputField
                      placeholder="프로젝트 제목을 입력해주세요."
                      value={projectTitle}
                      onChange={setProjectTitle}
                    />
                  </div>

                  <div className="flex flex-col gap-[12px]">
                    <Label>프로젝트 내용</Label>

                    <div className="w-full overflow-hidden rounded-[12px] bg-[var(--ui-50)]">
                      <div className="flex h-[48px] items-center border-b border-[var(--ui-300)] px-[14px]">
                        <div className="flex items-center gap-[22px]">
                          <div className="flex items-center gap-[8px]">
                            <ToolbarButton Icon={TablerIconH1} label="H1" />
                            <ToolbarButton Icon={TablerIconH2} label="H2" />
                          </div>
                          <div className="flex items-center gap-[8px]">
                            <ToolbarButton Icon={TablerIconBold} label="굵게" />
                            <ToolbarButton Icon={TablerIconItalic} label="기울임" />
                            <ToolbarButton Icon={TablerIconStrikethrough} label="취소선" />
                            <ToolbarButton Icon={TablerIconUnderline} label="밑줄" />
                          </div>
                          <div className="flex items-center gap-[8px]">
                            <ToolbarButton Icon={TablerIconListNumbers} label="번호 목록" />
                            <ToolbarButton Icon={TablerIconList} label="불릿 목록" />
                          </div>
                          <div className="flex items-center gap-[8px]">
                            <ToolbarButton Icon={TablerIconPhoto} label="이미지" />
                            <ToolbarButton Icon={TablerIconLink} label="링크" />
                          </div>
                        </div>
                      </div>
                      <div className="min-h-[420px] px-[16px] pt-[16px]">
                        <TextAreaField
                          placeholder="프로젝트 내용을 입력해주세요."
                          value={projectContent}
                          onChange={setProjectContent}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full justify-center pt-[8px]">
                    <button
                      type="button"
                      className="Body1 h-[52px] w-[292px] rounded-[12px] bg-[#4E49FF] font-medium text-white"
                    >
                      등록하기
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectCreatePage;

