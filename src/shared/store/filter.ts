import type { AppliedFilters } from '@t/project/api';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const defaultApplied: AppliedFilters = {
  projectTypes: [],
  domains: [],
  expectedPeriods: [],
  techStacks: [],
};

interface FilterState {
  // 추천 개발자
  recommendDeveloper: {
    myProjects: string[];
    interestDomains: string[];
    techStacks: string[];
  };
  setRecommendDeveloper: (slice: Partial<FilterState['recommendDeveloper']>) => void;

  // 추천 프로젝트
  recommendProject: {
    domains: string[];
    expectedPeriods: string[];
    projectTypes: string[];
    techStacks: string[];
  };
  setRecommendProject: (slice: Partial<FilterState['recommendProject']>) => void;

  // 프로젝트 검색
  projectSearch: {
    projectTypes: string[];
    domains: string[];
    expectedPeriods: string[];
    techStacks: string[];
    applied: AppliedFilters;
  };
  setProjectSearch: (slice: Partial<FilterState['projectSearch']>) => void;
  applyProjectSearchFilters: () => void;
  resetProjectSearchFilter: (key: '프로젝트 유형' | '도메인' | '예상 기간' | '포지션 / 기술스택') => void;

  // 개발자 검색
  developerSearch: {
    interestDomains: string[];
    myProjects: string[];
    techStacks: string[];
  };
  setDeveloperSearch: (slice: Partial<FilterState['developerSearch']>) => void;
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      recommendDeveloper: {
        myProjects: [],
        interestDomains: [],
        techStacks: [],
      },
      setRecommendDeveloper: (slice) =>
        set((s) => ({
          recommendDeveloper: { ...s.recommendDeveloper, ...slice },
        })),

      recommendProject: {
        domains: [],
        expectedPeriods: [],
        projectTypes: [],
        techStacks: [],
      },
      setRecommendProject: (slice) =>
        set((s) => ({
          recommendProject: { ...s.recommendProject, ...slice },
        })),

      projectSearch: {
        projectTypes: [],
        domains: [],
        expectedPeriods: [],
        techStacks: [],
        applied: defaultApplied,
      },
      setProjectSearch: (slice) =>
        set((s) => ({
          projectSearch: { ...s.projectSearch, ...slice },
        })),
      applyProjectSearchFilters: () =>
        set((s) => ({
          projectSearch: {
            ...s.projectSearch,
            applied: {
              projectTypes: s.projectSearch.projectTypes,
              domains: s.projectSearch.domains,
              expectedPeriods: s.projectSearch.expectedPeriods,
              techStacks: s.projectSearch.techStacks,
            },
          },
        })),
      resetProjectSearchFilter: (key) =>
        set((s) => {
          const next = { ...s.projectSearch };
          if (key === '프로젝트 유형') {
            next.projectTypes = [];
            next.applied = { ...next.applied, projectTypes: [] };
          }
          if (key === '도메인') {
            next.domains = [];
            next.applied = { ...next.applied, domains: [] };
          }
          if (key === '예상 기간') {
            next.expectedPeriods = [];
            next.applied = { ...next.applied, expectedPeriods: [] };
          }
          if (key === '포지션 / 기술스택') {
            next.techStacks = [];
            next.applied = { ...next.applied, techStacks: [] };
          }
          return { projectSearch: next };
        }),

      developerSearch: {
        interestDomains: [],
        myProjects: [],
        techStacks: [],
      },
      setDeveloperSearch: (slice) =>
        set((s) => ({
          developerSearch: { ...s.developerSearch, ...slice },
        })),
    }),
    {
      name: 'filter-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
