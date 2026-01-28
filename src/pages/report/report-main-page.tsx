import { Outlet } from 'react-router-dom';

const ReportMainPage = () => {
  return (
    <div>
      <div className="w-full">
        <div className="max-w-[144rem] px-[8rem]">
          <Outlet/>
        </div>
      </div>
    </div>
  );
};

export default ReportMainPage;