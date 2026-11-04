type Props = {
  current: number;
  total: number;
  className: string;
  filledClassName: string;
  segment?: 'span' | 'i';
  container?: 'span' | 'div';
  maxSegments?: number;
  accessible?: boolean;
};

export default function RecruitmentProgress({ current, total, className, filledClassName, segment: Segment = 'span', container: Container = 'div', maxSegments, accessible = false }: Props) {
  const count = Math.max(0, Math.min(total, maxSegments ?? total));
  if (!count) return null;
  return <Container className={className} aria-hidden={accessible ? undefined : true} aria-label={accessible ? `${total}명 중 ${current}명 모집` : undefined}>
    {Array.from({ length: count }, (_, index) => <Segment key={index} className={index / count < current / total ? filledClassName : undefined} />)}
  </Container>;
}
