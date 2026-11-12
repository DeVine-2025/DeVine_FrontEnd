import { confirmImageUpload, createPresignedUrl } from '@apis/images';
import type { UpdateProfileRequest } from '@apis/myInfo/myInfo';
import {
  addMyTechStacks,
  deleteMyTechStacks,
  myInfoQueries,
  updateMyProfile,
} from '@apis/myInfo/my-info.queries';
import { isTechnologySkill } from '@apis/techstacks';
import { useAuth } from '@clerk/clerk-react';
import { DOMAIN_MAP, DOMAIN_REVERSE_MAP } from '@constants/domain';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useProfileEditForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  // API로 프로필 정보 가져오기
  const { data: profileData, isLoading } = useQuery(myInfoQueries.profile());
  const techStackQuery = myInfoQueries.getMyTechStacks();
  const { data: techStackData } = useQuery(techStackQuery);
  const stack = techStackData?.result?.techstacks.filter(isTechnologySkill) ?? [];

  // 상태 관리
  const [nickname, setNickname] = useState<string>('');
  const [introduction, setIntroduction] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [githubLink, setGithubLink] = useState<string>('');
  const [linkedInLink, setLinkedInLink] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [domains, setDomains] = useState<string[]>([]);
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
      setOriginalData((prev) => ({
        ...prev,
        nickname: nicknameValue,
        introduction: introductionValue,
        email: emailValue,
        githubLink: githubLinkValue,
        linkedInLink: linkedInLinkValue,
        address: addressValue,
        imageUrl: imageUrlValue,
        domains: domainsValue,
        mainType: mainTypeValue,
        disclosure: disclosureValue,
      }));
    }
  }, [profileData]);

  const stackMutation = useMutation({
    mutationFn: async ({ added, removed }: { added: number[]; removed: number[] }) => {
      if (removed.length > 0) {
        await deleteMyTechStacks(removed);
        queryClient.setQueryData(
          techStackQuery.queryKey,
          (current: typeof techStackData) =>
            current && {
              ...current,
              result: {
                techstacks: current.result.techstacks.filter(
                  (item) => !removed.includes(item.techstackId),
                ),
              },
            },
        );
      }
      if (added.length > 0) {
        const updated = await addMyTechStacks(added);
        queryClient.setQueryData(techStackQuery.queryKey, updated);
      }
    },
    onError: () => alert('보유 스택을 변경하지 못했습니다. 다시 시도해 주세요.'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: techStackQuery.queryKey }),
  });
  // 프로필 수정 mutation
  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      alert('프로필이 성공적으로 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['member'] });
      navigate('/my-info');
    },
    onError: (error) => {
      const response = isAxiosError<{ code?: string; message?: string }>(error)
        ? error.response
        : undefined;
      console.error('프로필 수정 실패:', response?.status, response?.data?.code);
      const message = response?.data?.message;
      alert(
        typeof message === 'string' && message.trim() ? message : '프로필 수정에 실패했습니다.',
      );
    },
  });

  const domainsChanged =
    domains.length !== originalData.domains.length ||
    domains.some((domain) => !originalData.domains.includes(domain));

  // 데이터 변경 여부 확인
  const hasChanges = () => {
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
      domainsChanged
    );
  };

  const isButtonDisabled =
    !hasChanges() || updateMutation.isPending || stackMutation.isPending || isUploadingImage;

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

  const openStackPicker = () => {
    setIsStackDropdownOpen(true);
  };

  const handleStackApply = (selectedStackIds: string[]) => {
    const currentIds = new Set(stack.map((item) => item.techstackId));
    const selectedIds = new Set(selectedStackIds.map(Number));
    const added = [...selectedIds].filter((id) => !currentIds.has(id));
    const removed = [...currentIds].filter((id) => !selectedIds.has(id));
    if (added.length || removed.length) {
      stackMutation.mutate({ added, removed });
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
    if (domainsChanged && domains.length === 0) {
      alert('관심 도메인을 최소 1개 선택해 주세요.');
      return;
    }

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

    const updateData: UpdateProfileRequest = {
      nickname,
      ...(imageUrl !== originalData.imageUrl && { imageUrl }),
      address,
      body: introduction,
      ...(domainsChanged && { domains: domains.map((domain) => DOMAIN_MAP[domain] || domain) }),
      contacts,
      mainType,
      disclosure,
      proposalAlarm: profileData?.result?.member?.proposalAlarm ?? false,
    };

    updateMutation.mutate(updateData);
  };

  return {
    isLoading,
    nickname,
    introduction,
    setIntroduction,
    email,
    setEmail,
    githubLink,
    setGithubLink,
    linkedInLink,
    setLinkedInLink,
    imageUrl,
    domains,
    isStackDropdownOpen,
    setIsStackDropdownOpen,
    isUploadingImage,
    fileInputRef,
    techStackData,
    stack,
    updateMutation,
    stackMutation,
    isButtonDisabled,
    handleSave,
    handleImageClick,
    handleImageChange,
    openStackPicker,
    handleStackApply,
    toggleDomain,
  };
}
