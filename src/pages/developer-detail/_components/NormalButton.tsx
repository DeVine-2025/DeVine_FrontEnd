type NormalButtonProps = {
  label: string;
  onClick?: () => void;
}

const NormalButton = ({label, onClick}: NormalButtonProps) => {
  return (
    <button type='button' onClick={onClick} className='cursor-pointer bg-ui-50 rounded-2xl bg-ui-50 border border-1 border-ui-200 w-full py-[1.1rem]'>
      <p className="text-ui-800 text-xl font-medium ">{label}</p>
    </button>
  );
};

export default NormalButton;