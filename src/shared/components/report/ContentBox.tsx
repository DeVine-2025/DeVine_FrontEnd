type ContentBoxProps = {
  children: React.ReactNode;
};

const ContentBox = ({ children }: ContentBoxProps) => {
  return <div className="bg-ui-50 rounded-3xl">{children}</div>;
};

export default ContentBox;
