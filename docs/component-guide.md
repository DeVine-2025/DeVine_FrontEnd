# 공통 UI와 디자인 작업 기준
실제 소스 확인일: 2026-11-12. 컴포넌트 이름이 비슷하면 사용 화면의 import부터 확인한다.

| 요소 | 우선 재사용 |
| --- | --- |
| 기술 배지 | src/shared/components/common/TechStackChip.tsx |
| 기술 선택 | src/shared/components/common/TechStackPicker.tsx |
| 도메인 배지 | src/shared/components/common/DomainBadge.tsx |
| 포지션 배지 | src/shared/components/cards/PositionBadge.tsx |
| 프로젝트·개발자 카드 | src/shared/components/cards/ProjectCard.tsx, DeveloperCard.tsx |
| 추천 프로젝트 카드 | src/shared/components/cards/RecommendedProjectCard.tsx |
| 모집 인원·진행 표시 | src/shared/components/cards/RecruitmentProgress.tsx |
| 북마크 | src/shared/components/common/BookmarkButton.tsx |
| 정렬·리스트/그리드 | src/shared/components/common/SortMenu.tsx, ViewToggle.tsx |
| 탭 | src/shared/components/tab/; 기존 사용처의 변형·애니메이션 확인 |
| 공통 로딩 | src/shared/components/common/Skeleton.tsx, LoadingLayouts.tsx, AuthLoadingScreen.tsx |
| 리포트 폴더 | src/shared/components/report/folder/ReportFolderEntry.tsx, ReportFolder.tsx |
| 관리자 모달 프레임 | src/admin/components/common/admin-modal-frame.tsx |

범용 사용자 모달은 하나의 프레임으로 완전히 통일된 상태가 아니다. 기존 화면에 맞는 컴포넌트를 확인하고 관리자 프레임을 사용자 화면에 임의 적용하지 않는다.
common 안의 ProjectLg·ProfileBase 등 이전 카드도 실제 사용처가 있으므로 일괄 교체하지 않는다.

## 디자인 고정 기준
- Tailwind CSS v4 우선. 복잡한 애니메이션·외부 라이브러리·필요한 상태 CSS는 유지.
- 토큰 진입점: `src/shared/styles/index.css`, `theme.css`, `tokens/`.
- 기본 브랜드 보라색은 `--project-accent` (#A69BFF). 제어·체크·진행용 토큰과 혼동하지 않는다. 새 색상 하드코딩보다 기존 토큰을 우선한다.
- 다크 전용 제품이다. 새 테마 전환 기능을 추가하지 않는다.
- 전역 `font-size: 62.5%`를 변경하지 않는다.
- 노트북 조정 구간은 1024~1535px. 공통 너비 기준은 `src/shared/styles/desktop-content.css`. 전체 화면 scale 금지.
- 반응형 수정 시 >=1536px 데스크톱 및 <=1023px 기존 레이아웃을 보존한다. 사용자의 명시적 재설계 요청은 예외다.
- 스타일 정리·리팩터링에서는 hover·focus·애니메이션·UI 최종 적용값을 보존한다.
