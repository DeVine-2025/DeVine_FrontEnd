# 작업 위치 지도
실제 소스 확인일: 2026-11-12. 이 문서는 진입점 안내이며 소스보다 우선하지 않는다.

## 먼저 찾을 곳
라우트: `src/shared/routes/routers.tsx`. 관리자: `src/admin/routes/admin-router.tsx`.
앱 구성: `src/main.tsx`, `src/App.tsx`. 공통 레이아웃: `src/shared/layouts/`.

| 작업 | 우선 확인 |
| --- | --- |
| 홈 /home | src/pages/home/home-page.tsx, home-live-sections.tsx, home-mock-data.ts |
| 랜딩 /service | src/pages/landing/service-page.tsx, launch-ui/components/sections/hero/default.tsx |
| 로그인 /login | src/pages/login/login-page.tsx |
| 회원가입 /signup, /signup-preview | src/pages/signup/AgreementList.tsx, signup-agreements.tsx, use-signup-terms.ts; 프로필 단계는 src/pages/login/profile-page.tsx |
| 탐색 /search/projects, /search/developers | src/pages/search/project/project-explore-page.tsx, developer/developer-explore-page.tsx |
| 추천 /recommend/project, /recommend/developer | src/pages/recommend/recommendation-layout.tsx, recommendation-projects.tsx, recommendation-developers.tsx |
| 프로젝트 등록 /project/create | src/pages/project-create/project-create-page.tsx |
| 등록 검증·변환·임시저장 | 같은 폴더 project-form-validation.ts, project-form-mapper.ts, project-draft.store.ts |
| 등록 에디터 | 같은 폴더 project-content-editor.tsx, use-project-content-editor.ts |
| 프로젝트 상세 /project/:projectId | src/pages/project-detail/project-detail-page.tsx, hooks/useProjectDetail.ts, sample-project-detail.ts |
| 개발자 상세 | src/pages/developer-detail/ |
| 내 프로필 /my-info, 편집 /profile-edit | src/pages/my-info/my-info-profile.tsx, my-info-profile-edit.tsx, use-profile-edit-form.ts |
| 지원 현황 /my-project/pm, /my-project/dev | src/pages/my-project/matching-view.tsx, pm/my-pm-page.tsx, developer/my-developer-page.tsx; UI는 src/shared/components/myProject/ |
| 이용권 /pay | src/pages/pay/pay-page.tsx, use-pass-payment.ts, components/report-preview.tsx |
| 리포트 /report, /report/detail/:reportId | src/pages/report/report-page.tsx, report-detail-page.tsx; 렌더러는 src/shared/components/report/ |
| 채팅 | src/shared/components/chat/FloatingChatWidget.tsx, chat-room-list.tsx, chat-message-list.tsx, use-chat-panel-geometry.ts |
| 관리자 | src/admin/pages/, apis/, components/ |

## 데이터·이전 코드
- 모드 설정: `src/shared/config/data-mode.ts`. 개발 기본 목데이터, `VITE_DATA_MODE=api`로 전환 후 서버 재시작. 모든 화면에 적용되는 설정은 아니다.
- API·쿼리: `src/shared/apis/`. 공통 요청: `instance.ts`, `base/api.ts`. 상태 저장: `src/shared/store/`.
- 이전 홈 /home-original, 이전 탐색 /search/project·/search/developer, 기존 매칭 /matching/*는 여전히 라우팅되어 있다.
- 이전 추천 구현도 실제 연결 보존 여부를 확인하고 다룬다. “이전”이라는 이유만으로 삭제하지 않는다.
- 변경 전 필요한 데이터 규칙만 `design-data-migration.md`에서 읽는다. 큰 구조 설명은 `project-structure-report.md` 참조.
