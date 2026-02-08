import type { ProjectFilterKey } from '@components/common/ProjectFilterBar';
import type { AppliedFilters } from '@t/project/api';
import { useState } from 'react';

export function useProjectFilter() {
  // 드롭다운 오픈 상태
  const [openFilter, setOpenFilter] = useState<ProjectFilterKey | null>(null);

  // 필터 선택 상태
  const [projectTypes, setProjectTypes] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [expectedPeriods, setExpectedPeriods] = useState<string[]>([]);
  const [techStacks, setTechStacks] = useState<string[]>([]);

  // 필터 적용 상태
  const [applied, setApplied] = useState<AppliedFilters>({
    projectTypes: [],
    domains: [],
    expectedPeriods: [],
    techStacks: [],
  });

  const [page, setPage] = useState(1);

  const applyFilters = () => {
    setPage(1);
    setApplied({
      projectTypes,
      domains,
      expectedPeriods,
      techStacks,
    });
  };

  const resetFilter = (key: ProjectFilterKey) => {
    setPage(1);

    if (key === '프로젝트 유형') setProjectTypes([]);
    if (key === '도메인') setDomains([]);
    if (key === '예상 기간') setExpectedPeriods([]);
    if (key === '포지션 / 기술스택') setTechStacks([]);

    setApplied((prev) => {
      const next = { ...prev };
      if (key === '프로젝트 유형') next.projectTypes = [];
      if (key === '도메인') next.domains = [];
      if (key === '예상 기간') next.expectedPeriods = [];
      if (key === '포지션 / 기술스택') next.techStacks = [];
      return next;
    });
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
