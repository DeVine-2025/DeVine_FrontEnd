type ImageLightboxProps = {
  imageUrls: string[];
  currentIndex: number;
  title: string;
  onClose: () => void;
  onChangeIndex: (updater: (i: number | null) => number | null) => void;
};

export default function ImageLightbox({
  imageUrls,
  currentIndex,
  title,
  onClose,
  onChangeIndex,
}: ImageLightboxProps) {
  const validImages = imageUrls.filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="대표 사진 확대"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex items-center justify-center rounded-none border-none bg-transparent p-0 text-white/80 shadow-none outline-none ring-0 transition-colors hover:text-white focus:outline-none focus:ring-0"
        aria-label="닫기"
      >
        <svg
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {validImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChangeIndex((i) => {
                if (i === null) return null;
                for (let k = 1; k <= 3; k++) {
                  const prev = (i - k + 3) % 3;
                  if (imageUrls[prev]) return prev;
                }
                return i;
              });
            }}
            className="-translate-y-1/2 absolute top-1/2 left-4 z-10 flex h-14 w-14 items-center justify-center rounded-full text-white/90 transition-all hover:bg-white/10 hover:text-white focus:outline-none active:scale-95"
            aria-label="이전 이미지"
          >
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChangeIndex((i) => {
                if (i === null) return null;
                for (let k = 1; k <= 3; k++) {
                  const next = (i + k) % 3;
                  if (imageUrls[next]) return next;
                }
                return i;
              });
            }}
            className="-translate-y-1/2 absolute top-1/2 right-4 z-10 flex h-14 w-14 items-center justify-center rounded-full text-white/90 transition-all hover:bg-white/10 hover:text-white focus:outline-none active:scale-95"
            aria-label="다음 이미지"
          >
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0"
        aria-label="배경 클릭 시 닫기"
      />
      <div className="relative z-10 max-h-[90vh] max-w-[90vw] drop-shadow-2xl">
        <img
          src={imageUrls[currentIndex]}
          alt={`${title} 이미지 ${currentIndex + 1}`}
          className="max-h-[90vh] max-w-full rounded-lg object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
