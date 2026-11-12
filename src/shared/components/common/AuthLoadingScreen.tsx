import DevineSymbol from '@assets/images/devine-symbol.png';
import './auth-loading-screen.css';

export default function AuthLoadingScreen({ message }: { message: string }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[100svh] flex-col items-center justify-center bg-[#101116] px-6 text-center">
      <img src={DevineSymbol} alt="" className="h-auto w-[108px]" />
      <div aria-hidden="true" className="auth-loading-track mt-7">
        <span className="auth-loading-light" />
      </div>
      <p className="mt-8 text-base font-medium text-[#a9aab6]">{message}</p>
    </div>
  );
}
