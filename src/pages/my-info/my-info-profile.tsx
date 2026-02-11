import ProfileDetail from '../../shared/templates/profileDetail';
import { myInfoQueries } from '@apis/myInfo/myInfo-queries';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

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


  const techStackNames = useMemo(() => {
    if (!techStack?.result?.techstacks) return [];
    return techStack.result.techstacks.map((item: { name: string }) => item.name);
  }, [techStack]);

  const contributionsData = useMemo(() => {
    const result = contributions?.result?.contributionList;
    return Array.isArray(result) ? result : [];
  }, [contributions]);

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
  };


  console.log(gitRepos?.pages);

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