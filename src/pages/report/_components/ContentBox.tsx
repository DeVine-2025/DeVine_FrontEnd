type ContentBoxProps = {
  children: React.ReactNode;
};

const ContentBox = ({ children }: ContentBoxProps) => {
  return (
    <div className="report-print-block rounded-3xl bg-ui-50 px-7 py-3">{children}</div>
  );
};

export default ContentBox;
