import { usePmDevelopers } from '@hooks/usePmDevelopers';
import { useRespondApplication } from '@hooks/useRespondApplication';
import MatchingInbox, { type MatchingRow } from './MatchingCards';

export default function MyPMTopSection() {
  const incoming = usePmDevelopers('applied');
  const outgoing = usePmDevelopers('suggested');
  const { mutateAsync } = useRespondApplication();

  const rows = [incoming, outgoing].flatMap((query, index) =>
    query.data?.pages.flatMap((page) => page.content.map((item): MatchingRow => ({
      id: item.matchingId,
      incoming: index === 0,
      title: item.developerNickname,
      projectName: item.projectName,
      subtitle: item.partName,
      image: item.developerImageUrl,
      href: '/developer-detail/' + encodeURIComponent(item.developerNickname),
      createdAt: item.createdAt,
      decision: item.decision,
    }))) ?? [],
  );

  return <MatchingInbox role="pm" rows={rows}
    loading={incoming.isLoading || outgoing.isLoading}
    loadError={incoming.isError || outgoing.isError}
    loadingMore={incoming.isFetchingNextPage || outgoing.isFetchingNextPage}
    onRetry={() => { if (incoming.isError) void incoming.refetch(); if (outgoing.isError) void outgoing.refetch(); }}
    onLoadMore={incoming.hasNextPage || outgoing.hasNextPage ? () => {
      if (incoming.hasNextPage) void incoming.fetchNextPage();
      if (outgoing.hasNextPage) void outgoing.fetchNextPage();
    } : undefined}
    onRespond={(matchingId, decision) => mutateAsync({ matchingId, decision })}
  />;
}
