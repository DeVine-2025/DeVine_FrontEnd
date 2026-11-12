import { useDevProjects } from '@hooks/useDevProjects';
import { useRespondProposal } from '@hooks/useRespondProposal';
import MatchingInbox, { type MatchingRow } from './MatchingCards';

export default function MyDevTopSection() {
  const incoming = useDevProjects('suggested');
  const outgoing = useDevProjects('applied');
  const { mutateAsync } = useRespondProposal();

  const rows = [incoming, outgoing].flatMap((query, index) =>
    query.data?.pages.flatMap((page) => page.content.map((item): MatchingRow => ({
      id: item.matchingId,
      incoming: index === 0,
      title: item.projectName,
      subtitle: [item.categoryName, item.modeName, item.durationRangeName].filter(Boolean).join(' / '),
      image: item.thumbnailUrl,
      href: '/project/' + item.projectId,
      message: item.content?.trim(),
      createdAt: item.createdAt,
      decision: item.decision,
    }))) ?? [],
  );

  return <MatchingInbox role="developer" rows={rows}
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
