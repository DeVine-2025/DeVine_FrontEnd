import { useEffect, useMemo, useState } from 'react';
import { getMemberTerms, type MemberTermsItem } from '@apis/terms';
export function useSignupTerms(preview: boolean) {
  const [terms, setTerms] = useState<MemberTermsItem[]>([]);
  const [agreedByTermsId, setAgreedByTermsId] = useState<Record<number, boolean>>({});
  const [activeTermsId, setActiveTermsId] = useState<number | null>(null);
  const [isTermsLoading, setIsTermsLoading] = useState(true);
  const requiredTerms = useMemo(() => terms.filter((term) => term.required), [terms]);
  const requiredAgreed = useMemo(
    () =>
      requiredTerms.length > 0 &&
      requiredTerms.every((term) => agreedByTermsId[term.termsId] === true),
    [agreedByTermsId, requiredTerms],
  );
  const allChecked = useMemo(
    () => terms.length > 0 && terms.every((term) => agreedByTermsId[term.termsId] === true),
    [agreedByTermsId, terms],
  );
  const activeTerm = useMemo(
    () => terms.find((term) => term.termsId === activeTermsId) ?? null,
    [activeTermsId, terms],
  );

  useEffect(() => {
    if (preview) {
      const sampleTerms: MemberTermsItem[] = [
        { termsId: 1, title: '서비스 이용약관 동의', content: '', required: true },
        { termsId: 2, title: '개인정보 수집 및 이용 동의', content: '', required: true },
        { termsId: 3, title: '마케팅 정보 수신 동의', content: '', required: false },
      ];
      setTerms(sampleTerms);
      setAgreedByTermsId(Object.fromEntries(sampleTerms.map((term) => [term.termsId, false])));
      setIsTermsLoading(false);
      return;
    }
    const controller = new AbortController();
    setIsTermsLoading(true);

    void getMemberTerms(controller.signal)
      .then((items) => {
        setTerms(items);
        setAgreedByTermsId(Object.fromEntries(items.map((item) => [item.termsId, false])));
      })
      .catch((error) => {
        if ((error as Error)?.name !== 'AbortError') {
          console.warn('[terms] API terms fetch failed', error);
        }
        setTerms([]);
        setAgreedByTermsId({});
      })
      .finally(() => {
        setIsTermsLoading(false);
      });

    return () => controller.abort();
  }, [preview]);

  const handleAllChange = (checked: boolean) => {
    setAgreedByTermsId(Object.fromEntries(terms.map((term) => [term.termsId, checked])));
  };

  return {
    terms,
    agreedByTermsId,
    setAgreedByTermsId,
    activeTermsId,
    setActiveTermsId,
    isTermsLoading,
    requiredAgreed,
    allChecked,
    activeTerm,
    handleAllChange,
  };
}
