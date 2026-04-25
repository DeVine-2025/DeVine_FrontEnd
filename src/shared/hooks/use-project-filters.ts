import type { ProjectFilterKey } from '@components/project/ProjectFilterBar';
import { useFilterStore } from '@store/filter.store';
import { useState } from 'react';

export function useProjectFilter() {
  const [openFilter, setOpenFilter] = useState<ProjectFilterKey | null>(null);
  const [page, setPage] = useState(1);

  const {
    projectSearch,
    setProjectSearch,
    applyProjectSearchFilters,
    resetProjectSearchFilter,
  } = useFilterStore();

  const { projectTypes, domains, expectedPeriods, techStacks, applied } = projectSearch;

  const setProjectTypes = (v: string[]) => setProjectSearch({ projectTypes: v });
  const setDomains = (v: string[]) => setProjectSearch({ domains: v });
  const setExpectedPeriods = (v: string[]) => setProjectSearch({ expectedPeriods: v });
  const setTechStacks = (v: string[]) => setProjectSearch({ techStacks: v });

  const applyFilters = () => {
    setPage(1);
    applyProjectSearchFilters();
  };

  const resetFilter = (key: ProjectFilterKey) => {
    setPage(1);
    resetProjectSearchFilter(key);
  };

  return {
    openFilter,
    setOpenFilter,
    projectTypes,
    setProjectTypes,
    domains,
    setDomains,
    expectedPeriods,
    setExpectedPeriods,
    techStacks,
    setTechStacks,
    applied,
    page,
    setPage,
    applyFilters,
    resetFilter,
  };
}
