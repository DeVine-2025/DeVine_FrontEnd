import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TermsDetailScreen from '@pages/signup/TermsDetailScreen';
import { TERMS_CONTENT } from '@pages/signup/terms-content';

const TermsPage = () => {
  const navigate = useNavigate();
  const { type } = useParams();

  const terms = useMemo(() => {
    if (type === 'service' || type === 'privacy') {
      return TERMS_CONTENT[type];
    }
    return null;
  }, [type]);

  useEffect(() => {
    if (!terms) {
      navigate('/', { replace: true });
    }
  }, [navigate, terms]);

  if (!terms) return null;

  return (
    <TermsDetailScreen
      open
      title={terms.title}
      content={terms.content}
      onClose={() => navigate(-1)}
    />
  );
};

export default TermsPage;
