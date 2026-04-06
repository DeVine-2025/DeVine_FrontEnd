import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TermsDetailScreen from '@pages/signup/TermsDetailScreen';
import { getMemberTerms, type MemberTermsItem } from '@apis/terms';

const TermsPage = () => {
  const navigate = useNavigate();
  const { termsId } = useParams();
  const [selectedTerms, setSelectedTerms] = useState<MemberTermsItem | null>(null);
  const [isTermsLoading, setIsTermsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const parsedId = Number(termsId);
    let active = true;
    setIsTermsLoading(true);

    if (!Number.isFinite(parsedId)) {
      setSelectedTerms(null);
      setIsTermsLoading(false);
      return () => controller.abort();
    }

    void getMemberTerms(controller.signal)
      .then((items) => {
        if (!active) return;
        const found = items.find((item) => item.termsId === parsedId) ?? null;
        setSelectedTerms(found);
      })
      .catch((error) => {
        if (!active || (error as Error)?.name === 'AbortError') return;
        console.warn('[terms-page] API terms fetch failed', error);
        setSelectedTerms(null);
      })
      .finally(() => {
        if (!active) return;
        setIsTermsLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [termsId]);

  useEffect(() => {
    if (!isTermsLoading && !selectedTerms) {
      navigate('/', { replace: true });
    }
  }, [isTermsLoading, navigate, selectedTerms]);

  if (isTermsLoading || !selectedTerms) return null;

  return (
    <TermsDetailScreen
      open
      title={selectedTerms.title}
      content={selectedTerms.content}
      onClose={() => navigate(-1)}
    />
  );
};

export default TermsPage;
