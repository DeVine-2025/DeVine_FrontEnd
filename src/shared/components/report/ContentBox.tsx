type ContentBoxProps = {
  children: React.ReactNode;
};

const ContentBox = ({ children }: ContentBoxProps) => {
  return <div className="rounded-3xl bg-ui-50 px-7 py-3">{children}</div>;
};

export default ContentBox;
