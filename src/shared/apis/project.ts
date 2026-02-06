export type WeeklyBestProjectPosition = {
  position: string;
  positionName: string;
  count: number;
  currentCount: number;
  techStacks: string[];
};

export type WeeklyBestProject = {
  projectId: number;
  title: string;
  projectFieldName: string;
  categoryName: string;
  modeName: string;
  durationMonths: number;
  location: string;
  daysUntilDeadline: number;
  thumbnailUrl?: string | null;
  positions: WeeklyBestProjectPosition[];
};

type WeeklyBestResponse = {
  isSuccess: boolean;
  result?: {
    projects?: WeeklyBestProject[];
  };
};

export async function getWeeklyBestProjects() {
  const res = await fetch('https://api.devine.kr/api/v1/projects/weekly-best', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`weekly best failed: ${res.status}`);
  }

  const data = (await res.json()) as WeeklyBestResponse;
  return data.result?.projects ?? [];
}
