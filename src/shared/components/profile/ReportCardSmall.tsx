import { useNavigate } from 'react-router-dom';

type ReportCardSmallProps = {
  gitRepoId: number;
  reportType: string;
  label?: string;
  title?: string;
  description?: string;
};

const ReportCardSmall = ({
  gitRepoId,
  reportType,
  label,
  title,
  description,
}: ReportCardSmallProps) => {
  const navigate = useNavigate();

  const handleReportCard = () => {
    if (reportType === '') return;
    navigate(`/report/detail/${gitRepoId}?type=${reportType}`);
  };

  return (
    <div
      className="flex-col w-full min-w-64 cursor-pointer gap-[0.8rem] rounded-3xl border border-ui-200 p-[2.4rem]"
      onClick={handleReportCard}
    >
      {label && (
        <div className="flex-col-center w-fit rounded-lg bg-badge-bg-primary px-[0.8rem] py-[0.4rem]">
          <p className="Label1 text-badge-text-primary">{label}</p>
        </div>
      )}
      <div className="flex-col gap-[1rem]">
        <p className="truncate font-semibold text-2xl text-ui-1000">{title}</p>
        <p className="min-h-[6.4rem] line-clamp-4 text-ui-600 text-xl">{description}</p>
      </div>
    </div>
  );
};

export default ReportCardSmall;
