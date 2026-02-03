type NormalButtonProps = {
  label: string;
}

const NormalButton = ({label}: NormalButtonProps) => {
  return (
    <button type='button' className='bg-ui-50 rounded-2xl bg-ui-50 border border-1 border-ui-200 w-full py-[1.1rem]'>
      <p className="text-ui-800 text-xl font-medium ">{label}</p>
    </button>
  );
};

export default NormalButton;