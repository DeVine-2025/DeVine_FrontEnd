import LoadingSpinner from '@components/common/LoadingSpinner';

type Props = {
  type: 'loading' | 'error' | 'empty';
  onRetry?: () => void;
};

export default function ProjectListState({ type, onRetry }: Props) {
  if (type === 'loading') {
    return (
      <div className="flex justify-center pt-48 pb-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="py-30 text-center">
        <p className="mb-8 text-3xl text-red-500">프로젝트를 불러오는 중 문제가 발생했어요.</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="cursor-pointer rounded-lg border px-4 py-2 text-2xl hover:bg-ui-bg"
          >
            다시 시도
          </button>
        )}
      </div>
    );
  }

  return (
    <p className="mb-100 py-30 text-center text-3xl text-card-muted">
      선택하신 조건에 맞는 프로젝트가 없습니다.
    </p>
  );
}
