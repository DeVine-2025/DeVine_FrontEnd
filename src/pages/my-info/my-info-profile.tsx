import ProfileDetail from '../../shared/templates/profileDetail';
import type { Contribution } from '@apis/myInfo/myInfo';
import { myInfoQueries } from '@apis/myInfo/myInfo-queries';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { projectQueries } from '@apis/project/project-queries';

const MyInfoProfile = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data } = useQuery(myInfoQueries.profile());
  const { data: techStack } = useQuery(myInfoQueries.getMyTechStacks());
  const { data: contributions } = useQuery(myInfoQueries.getMyContributions(year));
  const {
    data: gitRepos,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(myInfoQueries.reposInfinite());
  const { data: projectInprogress } = useQuery(projectQueries.getMYProjectInprogress());
  const { data: projectCompleted } = useQuery(projectQueries.getMYProjectCompleted());

  console.log(projectInprogress, projectCompleted)

  const techStackNames = useMemo(() => {
    if (!techStack?.result?.techstacks) return [];
    return techStack.result.techstacks.map((item: { name: string }) => item.name);
  }, [techStack]);

  const contributionsData = useMemo((): Contribution[] => {
    const result = contributions?.result;
    if (Array.isArray(result)) return result as Contribution[];
    const list = result && typeof result === 'object' && 'contributionList' in result
      ? (result as { contributionList: Contribution[] }).contributionList
      : undefined;
    return Array.isArray(list) ? list : [];
  }, [contributions]);

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
  };




  return (
    <div>
      <ProfileDetail
        type={'내 정보'}
        profile={data?.result}
        techStack={techStackNames}
        contributions={contributionsData}
        gitRepos={gitRepos}
        year={year}
        onYearChange={handleYearChange}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  );
};

export default MyInfoProfile;