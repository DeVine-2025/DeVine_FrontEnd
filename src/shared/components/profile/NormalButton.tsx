type NormalButtonProps = {
  label: string;
  onClick?: () => void;
};

const NormalButton = ({ label, onClick }: NormalButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full cursor-pointer rounded-2xl border border-1 border-ui-200 bg-ui-50 py-[1.1rem]"
    >
      <p className="font-medium text-ui-800 text-xl">{label}</p>
    </button>
  );
};

export default NormalButton;
