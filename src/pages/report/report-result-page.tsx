import React from 'react';
import { useLocation } from 'react-router-dom';

const ReportResultPage = () => {
  const location = useLocation();
  console.log(location);
  return (
    <div>
      결과페이지
    </div>
  );
};

export default ReportResultPage;