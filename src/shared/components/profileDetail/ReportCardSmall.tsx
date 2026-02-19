import { useNavigate } from 'react-router-dom';

type ReportCardSmallProps = {
  gitRepoId: number;
  reportType: string;
  label?: string;
  title?: string;
  description?: string;
}
const ReportCardSmall = ({gitRepoId,reportType, label, title, description}: ReportCardSmallProps) => {
  const navigate = useNavigate();

  const handleReportCard = () => {
    if(reportType === "") return;
    else navigate(`/report/detail/${gitRepoId}?type=${reportType}`);
  }
  return (
    <div className="min-w-64 w-fit cursor-pointer rounded-3xl border border-ui-200 p-[2.4rem] gap-[0.8rem] flex-col w-full" onClick={handleReportCard}>
      {label && <div className="flex-col-center rounded-lg bg-badge-bg-primary px-[0.8rem] py-[0.4rem] w-fit">
        <p className="Label1 text-badge-text-primary">{label}</p>
      </div>}
      <div className="flex-col gap-[1rem]">
        <p className="text-ui-1000 text-2xl font-semibold truncate">{title}</p>
        <p className="text-ui-600 text-xl line-clamp-4 min-h-[6.4rem]">{description}</p>
      </div>

    </div>
  );
};

export default ReportCardSmall;