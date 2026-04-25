import Lottie from "lottie-react";
import LoadingAnimation from "@assets/animation/loading.json";

type LoadingProps = {
  className?: string;
}

const Loading = ({ className }: LoadingProps) => {
  return (
    <div className="flex items-center justify-center w-full h-full overflow-hidden">
      <Lottie
        animationData={LoadingAnimation}
        loop
        className={`scale-250 ${className ?? ""}`}
      />
    </div>
  );
};

export default Loading;
