import { getMemberTerm, type MemberTermsItem } from '@apis/terms';
import TermsDetailScreen from '@pages/signup/TermsDetailScreen';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const TermsPage = () => {
  const navigate = useNavigate();
  const { termsId } = useParams();
  const [selectedTerms, setSelectedTerms] = useState<MemberTermsItem | null>(null);
  const [isTermsLoading, setIsTermsLoading] = useState(true);

  useEffect(() => {
    const parsedId = Number(termsId);
    let active = true;
    setIsTermsLoading(true);

    if (!Number.isFinite(parsedId)) {
      setSelectedTerms(null);
      setIsTermsLoading(false);
      return () => {
        active = false;
      };
    }

    void getMemberTerm(parsedId)
      .then((item) => {
        if (!active) return;
        setSelectedTerms(item);
      })
      .catch((error) => {
        if (!active) return;
        console.warn('[terms-page] API terms fetch failed', error);
        setSelectedTerms(null);
      })
      .finally(() => {
        if (!active) return;
        setIsTermsLoading(false);
      });

    return () => {
      active = false;
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
      onLogoClick={() => navigate('/')}
    />
  );
};

export default TermsPage;
