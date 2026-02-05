type MyInfoInputProps = {
  text: string;
  setText: (text: string) => void;
}

const MyInfoInput = ({text,setText} : MyInfoInputProps) => {
  return (
    <div>
      <input type="text" className="w-full bg-ui-50 p-[1.4rem] rounded-2xl text-ui-1000 text-lg" value={text} onChange={(e) => setText(e.target.value)}/>
    </div>
  );
};

export default MyInfoInput;