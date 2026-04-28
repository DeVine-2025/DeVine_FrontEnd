import { confirmImageUpload, createPresignedUrl } from '@apis/image';
import type { UpdateProfileRequest } from '@apis/myInfo/myInfo';
import {
  addMyTechStacks,
  deleteMyTechStacks,
  myInfoQueries,
  updateMyProfile,
} from '@apis/myInfo/myInfo-queries';
import BackIcon from '@assets/icons/back.svg?react';
import CheckboxCheckedIcon from '@assets/icons/checkbox-checked.svg?react';
import CheckboxUncheckedIcon from '@assets/icons/checkbox-unchecked.svg?react';
import PlusNolineIcon from '@assets/icons/plus-noline.svg?react';
import { useAuth } from '@clerk/clerk-react';
import MyInfoInput from '@components/myInfo/MyInfoInput';
import StackChips from '@components/myInfo/StackChips';
import ImagePreview from '@components/profileDetail/ImagePreview';
import PositionTechStackDropdown from '@components/recommend/PositionTechStackDropdown';
import { DOMAIN_MAP, DOMAIN_OPTIONS, DOMAIN_REVERSE_MAP } from '@constants/domain';
import { getTechstackIdsByKeys } from '@constants/signup-mapping';
import { cn } from '@libs/cn';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type StackItem = {
  key: string;
  source: 'AUTO' | 'MANUAL';
};

type MyInfoProfileItemProps = {
  type: 'text' | 'search';
  title: string;
  text?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  setText?: (text: string) => void;
};

const MyInfoProfileItem = ({
  type,
  title,
  text,
  setText,
  disabled,
  placeholder,
  className,
}: MyInfoProfileItemProps) => {
  return (
    <div className="flex-col gap-[1.6rem]">
      <p className={cn('font-bold text-2xl text-ui-900', className)}>{title}</p>
      <MyInfoInput text={text} setText={setText} type={type} placeholder={placeholder} disabled={disabled} />
    </div>
  );
};

const MyInfoProfileEdit = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  // API로 프로필 정보 가져오기
  const { data: profileData, isLoading } = useQuery(myInfoQueries.profile());
  const { data: techStackData } = useQuery(myInfoQueries.getMyTechStacks());

  // 상태 관리
  const [nickname, setNickname] = useState<string>('');
  const [introduction, setIntroduction] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [githubLink, setGithubLink] = useState<string>('');
  const [linkedInLink, setLinkedInLink] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [domains, setDomains] = useState<string[]>([]);
  const [stack, setStack] = useState<StackItem[]>([]); // 기술 스택 배열 (예: [{ key: 'React', source: 'MANUAL' }])
  const [mainType, setMainType] = useState<'DEVELOPER' | 'PM'>('DEVELOPER');
  const [disclosure, setDisclosure] = useState<boolean>(true);
  const [isStackDropdownOpen, setIsStackDropdownOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // 파일 입력 ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 원본 데이터 저장 (비교용)
  const [originalData, setOriginalData] = useState({
    nickname: '',
    introduction: '',
    email: '',
    githubLink: '',
    linkedInLink: '',
    address: '',
    imageUrl: '',
    domains: [] as string[],
    stack: [] as StackItem[],
    mainType: 'DEVELOPER' as 'DEVELOPER' | 'PM',
    disclosure: true,
  });

  // 프로필 데이터가 로드되면 상태 업데이트
  useEffect(() => {
    if (profileData?.result) {
      const profile = profileData.result;
      const nicknameValue = profile.member?.nickname || '';
      const introductionValue = profile.member?.body || '';
      const addressValue = profile.member?.address || '';
      const imageUrlValue = profile.member?.imageUrl || '';
      // API에서 받은 영문 도메인을 한글로 변환
      const domainsValue = (profile.domains || []).map((d) => DOMAIN_REVERSE_MAP[d] || d);
      const mainTypeValue = profile.member?.mainType === 'PM' ? 'PM' : 'DEVELOPER';
      const disclosureValue = profile.member?.disclosure ?? true;

      // 연락처 정보
      const emailContact = profile.contacts?.find((c) => c.type === 'EMAIL');
      const githubContact = profile.contacts?.find((c) => c.type === 'GITHUB');
      const linkedInContact = profile.contacts?.find((c) => c.type === 'LINKEDIN');
      const emailValue = emailContact?.value || '';
      const githubLinkValue = githubContact?.link || githubContact?.value || '';
      const linkedInLinkValue = linkedInContact?.link || linkedInContact?.value || '';

      // 현재 상태 설정
      setNickname(nicknameValue);
      setIntroduction(introductionValue);
      setAddress(addressValue);
      setImageUrl(imageUrlValue);
      setDomains(domainsValue);
      setMainType(mainTypeValue);
      setDisclosure(disclosureValue);
      setEmail(emailValue);
      setGithubLink(githubLinkValue);
      setLinkedInLink(linkedInLinkValue);

      // 원본 데이터 저장
      setOriginalData({
        nickname: nicknameValue,
        introduction: introductionValue,
        email: emailValue,
        githubLink: githubLinkValue,
        linkedInLink: linkedInLinkValue,
        address: addressValue,
        imageUrl: imageUrlValue,
        domains: domainsValue,
        stack: [],
        mainType: mainTypeValue,
        disclosure: disclosureValue,
      });
    }
  }, [profileData]);

  // API 이름을 드롭다운 키로 변환하는 함수
  const convertApiNameToKey = (apiName: string): string => {
    // REACT_NATIVE -> ReactNative, SPRING_BOOT -> Springboot 등
    return apiName
      .split('_')
      .map((word, index) => {
        if (index === 0) {
          // 첫 단어: 첫 글자만 대문자, 나머지 소문자
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        // 나머지 단어: 전체 소문자 (Springboot, Reactnative 형태)
        return word.toLowerCase();
      })
      .join('');
  };

  // 기술 스택 데이터가 로드되면 상태 업데이트
  useEffect(() => {
    if (techStackData?.result?.techstacks) {
      const stackItems: StackItem[] = techStackData.result.techstacks.map(
        (item: { name: string; source: 'AUTO' | 'MANUAL' }) => ({
          key: convertApiNameToKey(item.name),
          source: item.source,
        }),
      );
      setStack(stackItems);
      setOriginalData((prev) => ({ ...prev, stack: stackItems }));
    }
  }, [techStackData]);

  // 프로필 수정 mutation
  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      alert('프로필이 성공적으로 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['member'] });
      navigate('/my-info');
    },
    onError: (error) => {
      console.error('프로필 수정 실패:', error);
      alert('프로필 수정에 실패했습니다.');
    },
  });

  // 데이터 변경 여부 확인
  const hasChanges = () => {
    const arraysEqual = (a: string[], b: string[]) => {
      if (a.length !== b.length) return false;
      const sortedA = [...a].sort();
      const sortedB = [...b].sort();
      return sortedA.every((val, idx) => val === sortedB[idx]);
    };

    return (
      nickname !== originalData.nickname ||
      introduction !== originalData.introduction ||
      email !== originalData.email ||
      githubLink !== originalData.githubLink ||
      linkedInLink !== originalData.linkedInLink ||
      address !== originalData.address ||
      imageUrl !== originalData.imageUrl ||
      mainType !== originalData.mainType ||
      disclosure !== originalData.disclosure ||
      !arraysEqual(domains, originalData.domains) ||
      !arraysEqual(
        stack.map((s) => s.key),
        originalData.stack.map((s) => s.key),
      )
    );
  };

  const isButtonDisabled = !hasChanges() || updateMutation.isPending;

  const toggleDomain = (value: string) => {
    setDomains((prev) => {
      if (prev.indexOf(value) !== -1) {
        return prev.filter((item) => item !== value);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, value];
    });
  };

  const handleDeleteStack = async (stackKey: string) => {
    const item = stack.find((s) => s.key === stackKey);
    try {
      const stackIds = getTechstackIdsByKeys([stackKey]);
      if (stackIds.length > 0) {
        await deleteMyTechStacks(stackIds, item?.source ?? 'MANUAL');

        setStack((prev) => prev.filter((s) => s.key !== stackKey));
        setOriginalData((prev) => ({
          ...prev,
          stack: prev.stack.filter((s) => s.key !== stackKey),
        }));

        queryClient.invalidateQueries({ queryKey: ['member/techstacks'] });
      }
    } catch (error) {
      console.error('기술 스택 삭제 실패:', error);
      alert('기술 스택 삭제에 실패했습니다.');
    }
  };

  const handleStackChange = (selectedStacks: string[]) => {
    setStack((prev) =>
      selectedStacks.map((key) => {
        const existing = prev.find((s) => s.key === key);
        return existing ?? { key, source: 'MANUAL' as const };
      }),
    );
  };

  const handleStackApply = async () => {
    try {
      // 원본 스택과 현재 선택된 스택 비교
      const originalKeySet = new Set(originalData.stack.map((s) => s.key));
      const currentKeySet = new Set(stack.map((s) => s.key));

      // 추가된 스택 (현재에는 있지만 원본에는 없는 것)
      const addedKeys = stack.filter((s) => !originalKeySet.has(s.key)).map((s) => s.key);

      // 삭제된 스택 (원본에는 있지만 현재에는 없는 것)
      const deletedKeys = originalData.stack.filter((s) => !currentKeySet.has(s.key)).map((s) => s.key);

      // 추가할 스택이 있으면 추가 API 호출
      if (addedKeys.length > 0) {
        const addedIds = getTechstackIdsByKeys(addedKeys);
        if (addedIds.length > 0) {
          await addMyTechStacks(addedIds);
          console.log('기술 스택 추가 성공:', addedKeys);
        }
      }

      // 삭제할 스택이 있으면 삭제 API 호출
      if (deletedKeys.length > 0) {
        const deletedIds = getTechstackIdsByKeys(deletedKeys);
        if (deletedIds.length > 0) {
          await deleteMyTechStacks(deletedIds, 'MANUAL');
          console.log('기술 스택 삭제 성공:', deletedKeys);
        }
      }

      // 원본 데이터 업데이트
      setOriginalData((prev) => ({ ...prev, stack }));

      // 기술 스택 쿼리 무효화하여 최신 데이터 가져오기
      queryClient.invalidateQueries({ queryKey: ['member/techstacks'] });
    } catch (error) {
      console.error('기술 스택 업데이트 실패:', error);
      alert('기술 스택 업데이트에 실패했습니다.');
      // 실패 시 원래 상태로 복원
      setStack(originalData.stack);
    } finally {
      setIsStackDropdownOpen(false);
    }
  };

  // 이미지 파일 선택 핸들러
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 선택할 수 있습니다.');
      return;
    }

    // 파일 크기 체크 (예: 5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    try {
      setIsUploadingImage(true);

      // 1. 미리보기를 위해 로컬 URL 생성
      const localUrl = URL.createObjectURL(file);
      setImageUrl(localUrl);

      // 2. 토큰 가져오기
      const token = await getToken();
      if (!token) {
        throw new Error('인증 토큰을 가져올 수 없습니다.');
      }

      // 3. Presigned URL 요청
      const {
        imageId,
        presignedUrl,
        imageUrl: finalImageUrl,
      } = await createPresignedUrl(
        {
          imageType: 'PROFILE',
          fileName: file.name,
        },
        token,
      );

      // 4. S3에 이미지 업로드
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('이미지 업로드에 실패했습니다.');
      }

      // 5. 업로드 확인
      await confirmImageUpload(imageId, finalImageUrl, token);

      // 6. 최종 이미지 URL 설정
      setImageUrl(finalImageUrl);

      // 로컬 URL 해제
      URL.revokeObjectURL(localUrl);

      console.log('이미지 업로드 성공:', finalImageUrl);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
      // 실패 시 원래 이미지로 복원
      setImageUrl(originalData.imageUrl);
    } finally {
      setIsUploadingImage(false);
      // 파일 입력 초기화 (같은 파일 재선택 가능하도록)
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = () => {
    const contacts = [];
    if (email) {
      contacts.push({
        type: 'EMAIL',
        value: email,
        link: '',
      });
    }
    if (githubLink) {
      contacts.push({
        type: 'GITHUB',
        value: githubLink,
        link: githubLink,
      });
    }
    if (linkedInLink) {
      contacts.push({
        type: 'LINKEDIN',
        value: linkedInLink,
        link: linkedInLink,
      });
    }

    // 한글 도메인을 영문으로 변환
    const englishDomains = domains.map((d) => DOMAIN_MAP[d] || d);

    const updateData: UpdateProfileRequest = {
      nickname,
      ...(imageUrl && { imageUrl }),
      address,
      body: introduction,
      domains: englishDomains,
      contacts,
      mainType,
      disclosure,
      proposalAlarm: profileData?.result?.member?.proposalAlarm ?? false,
    };

    updateMutation.mutate(updateData);
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">로딩 중...</div>;
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1180px] py-8">
        <div className="flex items-center gap-3">
          <BackIcon className="h-12 w-12 cursor-pointer text-ui-700" onClick={() => navigate(-1)} />
          <p className="font-bold text-4xl text-ui-900">프로필 수정</p>
        </div>
        <div className="w-full flex-col items-center">
          <div className="w-[550px]">
            <p className="font-bold text-2xl text-ui-900">프로필 사진</p>
            <div className="flex w-full justify-center pb-10">
              <div className="relative w-fit">
                <ImagePreview isExist={!!imageUrl} imageUrl={imageUrl} className="h-40 w-40" />
                {isUploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                    <p className="text-sm text-white">업로드 중...</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleImageClick}
                  disabled={isUploadingImage}
                  className="absolute right-0 bottom-0 cursor-pointer rounded-full bg-ui-200 transition-colors hover:bg-ui-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <PlusNolineIcon className="h-10 w-10 p-2 text-white" />
                </button>
                {/* 숨겨진 파일 입력 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isUploadingImage}
                />
              </div>
            </div>
            <div className="flex-col gap-[4rem]">
              <MyInfoProfileItem
                type={'text'}
                title={'닉네임'}
                text={nickname}
                setText={setNickname}
                disabled={true}
              />
              <hr className="border-ui-200" />
              <div className="flex-col gap-[2.4rem]">
                <MyInfoProfileItem
                  type={'text'}
                  title={'한줄 소개'}
                  text={introduction}
                  setText={setIntroduction}
                />
                <p className="font-semibold text-2xl text-ui-1000">연락처</p>
                <MyInfoProfileItem
                  type={'text'}
                  title={'이메일'}
                  text={email}
                  setText={setEmail}
                  className="font-semibold text-ui-600 text-xl"
                />
                <MyInfoProfileItem
                  type={'text'}
                  title={'GitHub 링크'}
                  text={githubLink}
                  setText={setGithubLink}
                  className="font-semibold text-ui-600 text-xl"
                />
                <MyInfoProfileItem
                  type={'text'}
                  title={'LinkedIn 링크'}
                  text={linkedInLink}
                  setText={setLinkedInLink}
                  className="font-semibold text-ui-600 text-xl"
                />
              </div>

              <div className="flex-col gap-[1.6rem]">
                <div className="flex-col gap-[1.6rem]">
                  <p className="font-bold text-2xl text-ui-900">보유 스택</p>
                  <MyInfoInput
                    type={'search'}
                    placeholder={'보유 스택을 검색해주세요'}
                    onClick={() => setIsStackDropdownOpen(true)}
                  />
                </div>
                <div className="flex-col gap-[1.6rem]">
                  <StackChips stacks={stack} onRemove={handleDeleteStack} />
                  <hr className="border-ui-200" />
                </div>
              </div>

              <div className="flex-col gap-[2.4rem]">
                <p className="flex items-center gap-[0.4rem] font-semibold text-2xl text-ui-1000">
                  관심 도메인
                  <span className="block text-base text-ui-600">(최대 3개)</span>
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {DOMAIN_OPTIONS.map((domain) => {
                    const selected = domains.indexOf(domain) !== -1;
                    return (
                      <button
                        key={domain}
                        type="button"
                        onClick={() => toggleDomain(domain)}
                        className="flex items-center gap-3 text-[var(--ui-900)]"
                        aria-pressed={selected}
                      >
                        {selected ? (
                          <CheckboxCheckedIcon
                            className="h-7 w-7 shrink-0 text-[#4E49FF]"
                            aria-hidden="true"
                          />
                        ) : (
                          <CheckboxUncheckedIcon className="h-7 w-7 shrink-0" aria-hidden="true" />
                        )}
                        <span className="Body1">{domain}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={isButtonDisabled}
                className={`w-full rounded-2xl py-[1.6rem] font-semibold text-2xl transition-colors ${
                  isButtonDisabled
                    ? 'cursor-not-allowed bg-ui-50 text-ui-500'
                    : 'cursor-pointer bg-primary text-white hover:bg-primary/90'
                }`}
              >
                {updateMutation.isPending ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 보유 스택 드롭다운 모달 */}
      {isStackDropdownOpen && (
        <>
          {console.log('모달 열림 - 현재 스택:', stack.map((s) => s.key))}
          <PositionTechStackDropdown
            open={isStackDropdownOpen}
            value={stack.map((s) => s.key)}
            onChange={handleStackChange}
            onApply={handleStackApply}
            onReset={() => setStack([])}
            onClose={() => setIsStackDropdownOpen(false)}
            asModal={true}
            title="보유 스택 선택"
            showCloseButton={true}
          />
        </>
      )}
    </>
  );
};

export default MyInfoProfileEdit;
