# 📂 DeVine 프론트엔드 파일 구조 개편 계획서

> **작성일**: 2025-04-25  
> **목적**: 코드를 처음 보는 팀원도 쉽게 파악할 수 있는 구조로 개선  
> **원칙**: 화면·기능 변경 없이 파일 위치와 이름만 정리

---

## 📌 왜 해야 하나요?

현재 구조에서 **"프로젝트 카드를 수정해 주세요"** 라고 하면 아래 7개 파일 중 어디를 고쳐야 하는지 알 수 없습니다:

```
shared/components/common/MainProjectCard.tsx      ← 메인 페이지 그리드
shared/components/common/ProjectLg.tsx             ← 검색 리스트
shared/components/common/ProjectMd.tsx             ← 미사용 ❌
shared/components/common/ProjectSm.tsx             ← 검색 추천 미리보기
shared/components/common/RecommendProjectCard.tsx  ← 추천 프로젝트
shared/components/common/RecommendProjectBase.tsx  ← 미사용 ❌
pages/main/components/MainProjectLg.tsx            ← 미사용 ❌
```

또한 `shared/components/common/` 폴더 하나에 **31개 파일**이 섞여 있어서 원하는 컴포넌트를 찾기가 어렵습니다.

---

## 🔍 현재 구조의 문제점 요약

| # | 문제 | 영향 |
|:--|:--|:--|
| 1 | `common/` 폴더에 31개 파일 혼재 (범용 UI + 도메인 카드 + 필터바) | 파일 찾기 어려움 |
| 2 | 같은 역할의 카드가 여러 이름으로 분산 (프로젝트 7개, 개발자 6개) | 어디를 수정해야 할지 혼란 |
| 3 | `normalizeTechKey` 함수가 6곳에 복사-붙여넣기 | 수정 시 6곳 모두 변경 필요 |
| 4 | 특정 페이지에서만 쓰는 컴포넌트가 `shared/`에 있음 | "공용"의 의미 상실 |
| 5 | 폴더명·파일명 네이밍 규칙 불일치 (camelCase, kebab-case 혼용) | 일관성 부재 |
| 6 | `image.ts`와 `images.ts`가 **같은 API를 2번 구현** | 어느 파일을 써야 하는지 혼란 |
| 7 | `utils/`와 `libs/` 폴더 역할이 모호하게 분리됨 | 유틸을 어디에 넣어야 할지 불명확 |
| 8 | 파일명에 공백 포함 (`Data _ Bundling.json`) | import 불편, 실수 유발 |

---

## 🏗️ 개편 후 구조

> 핵심: **"여러 페이지에서 쓰면 `shared/`, 한 페이지에서만 쓰면 해당 페이지 안의 `_components/`"**

```
src/
├── app/                              # 앱 초기화
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx
│
├── pages/                            # 페이지별 정리
│   ├── main/
│   │   ├── MainPage.tsx
│   │   └── _components/              # ← 메인 전용 컴포넌트
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   └── _components/              # ← 회원가입 Section 등
│   ├── project/                       # 프로젝트 탐색/상세
│   │   ├── ProjectSearchPage.tsx
│   │   ├── ProjectDetailPage.tsx
│   │   └── _components/              # ← ApplyModal, ImageLightbox 등
│   │   └── _hooks/                   # ← useProjectDetail
│   ├── project-create/                # 프로젝트 생성 (독립 분리)
│   │   ├── ProjectCreatePage.tsx      # ← 59KB 거대 파일
│   │   ├── ProjectCreateCompletePage.tsx
│   │   └── _components/              # ← LinkCardNode, DatePicker, TechStackDropdown
│   ├── developer/
│   │   ├── DeveloperSearchPage.tsx
│   │   ├── DeveloperDetailPage.tsx
│   │   └── _components/              # ← 프로필 상세 컴포넌트
│   ├── recommend/
│   │   └── _components/              # ← 추천 드롭다운 등
│   ├── report/
│   │   └── _components/              # ← 리포트 카드, 체크박스 등
│   ├── my-info/
│   │   └── _components/
│   ├── my-project/
│   │   └── _components/
│   ├── matching/
│   ├── search/
│   ├── pay/
│   ├── terms/
│   └── landing/
│
└── shared/                           # 💡 여러 페이지에서 공유하는 것만
    ├── ui/                           # 순수 범용 UI
    │   ├── Skeleton.tsx
    │   ├── LoadingSpinner.tsx
    │   ├── Pagination.tsx
    │   ├── BookmarkButton.tsx
    │   ├── LoginRequiredCard.tsx
    │   └── ...
    │
    ├── components/
    │   ├── project/                  # 프로젝트 카드 (통합)
    │   │   ├── ProjectCard.tsx       # ← 7개 → 1개로 통합
    │   │   ├── ProjectBase.tsx
    │   │   └── ProjectFilterBar.tsx
    │   ├── developer/                # 개발자 카드 (통합)
    │   │   ├── DeveloperCard.tsx     # ← 6개 → 1개로 통합
    │   │   ├── ProfileBase.tsx
    │   │   └── DeveloperFilterBar.tsx
    │   └── layout/
    │       ├── Header.tsx
    │       ├── Footer.tsx
    │       └── RootLayout.tsx
    │
    ├── api/                          # API 함수
    ├── hooks/                        # 커스텀 훅
    ├── store/                        # Zustand 상태
    ├── lib/                          # 유틸리티
    │   ├── tech-stack-utils.ts       # ← 6곳 중복 코드 통합
    │   └── storage.ts                # ← utils/ 폴더 해체 후 이동
    ├── constants/
    ├── types/
    ├── mappers/
    ├── styles/
    └── assets/
```

---

## 🔄 Phase별 작업 내용

### Phase 1. 중복 코드 제거
> ⏱ 예상 시간: 30분 | 🔴 충돌 위험: 낮음 | 🖥️ 화면 변경: 없음

**무엇을 하나요?**  
6곳에 복사-붙여넣기 되어 있는 `normalizeTechKey`, `findBadge`, `ALL_TECH_STACK_BADGES` 코드를 `shared/lib/tech-stack-utils.ts` 한 곳으로 모읍니다.

**변경 파일:**

| 파일 | 변경 내용 |
|:--|:--|
| `shared/lib/tech-stack-utils.ts` | 🆕 신규 생성 |
| `shared/components/common/RecommendDeveloperCard.tsx` | 중복 코드 → import로 교체 |
| `shared/components/common/BookmarkDeveloperCard.tsx` | 중복 코드 → import로 교체 |
| `shared/components/common/ProfileBase.tsx` | 중복 코드 → import로 교체 |
| `shared/components/profileDetail/TechStackChips.tsx` | 중복 코드 → import로 교체 |
| `pages/project-create/project-create-page.tsx` | 중복 코드 → import로 교체 |
| `shared/apis/image.ts` + `images.ts` | 🔗 같은 API 2개를 `images.ts` 1개로 통합 |

**효과:**
- 기술스택 배지 로직 수정 시 **1곳만 고치면 전체 반영**
- 이미지 업로드 API가 **1개 파일에서 관리**되어 혼란 제거

---

### Phase 2. 미사용 파일 삭제
> ⏱ 예상 시간: 5분 | 🔴 충돌 위험: 없음 | 🖥️ 화면 변경: 없음

**무엇을 하나요?**  
어디서도 import 하지 않는 파일 4개를 삭제합니다.

| 삭제 파일 | 사유 |
|:--|:--|
| `shared/components/common/ProjectMd.tsx` | 어디서도 사용 안 됨 |
| `shared/components/common/RecommendProjectBase.tsx` | 어디서도 사용 안 됨 |
| `pages/main/components/MainProjectLg.tsx` | 어디서도 사용 안 됨 |
| `shared/auth/useAuth.ts` | 개발용 mock 코드, 실제로는 Clerk `useAuth` 사용 중 |

---

### Phase 3. 페이지 전용 컴포넌트 이동 (Colocation)
> ⏱ 예상 시간: 1~2시간 | 🔴 충돌 위험: 중간 | 🖥️ 화면 변경: 없음

**무엇을 하나요?**  
특정 페이지에서만 사용하는 컴포넌트를 `shared/` 밖으로 빼서 해당 페이지 폴더의 `_components/`로 이동합니다.

| 현재 위치 | 이동 위치 | 파일 수 |
|:--|:--|:--:|
| `shared/components/myInfo/*` | `pages/my-info/_components/` | 4 |
| `shared/components/myProject/*` | `pages/my-project/_components/` | 3 |
| `shared/components/recommend/*` | `pages/recommend/_components/` | 5 |
| `shared/components/report/*` | `pages/report/_components/` | 9 |
| `shared/components/profileDetail/*` | `pages/developer/_components/` | 8 |
| `shared/components/tab/SearchTabs.tsx` | `pages/search/_components/` | 1 |
| `shared/components/tab/MyProjectTabs.tsx` | `pages/my-project/_components/` | 1 |
| `shared/components/common/DatePickerPopover.tsx` | `pages/project-create/_components/` | 1 |
| `shared/components/common/PositionBasedTechStackDropdown.tsx` | `pages/project-create/_components/` | 1 |
| `pages/project-create/LinkCardNode.tsx` | `pages/project-create/_components/` | 1 |
| `shared/templates/profileDetail.tsx` | `shared/components/developer/ProfileDetail.tsx` | 1 |
| `shared/utils/storage.ts` | `shared/lib/storage.ts` (utils 폴더 해체) | 1 |

**변경되는 것:** 파일 위치 + import 경로 (코드 내용은 동일)

> `templates/profileDetail.tsx`는 my-info와 developer-detail 2곳에서 쓰이므로 `shared/components/developer/`로 이동합니다.  
> `utils/` 폴더는 `libs/`와 역할이 겹치므로 `lib/`로 합칩니다.

---

### Phase 4. 공용 UI 분리
> ⏱ 예상 시간: 30분 | 🔴 충돌 위험: 중간 | 🖥️ 화면 변경: 없음

**무엇을 하나요?**  
진짜 여러 페이지에서 공유하는 범용 UI 컴포넌트를 `shared/ui/` 폴더로 이동합니다.

| 파일 | 사용 횟수 | 이동 위치 |
|:--|:--:|:--|
| `Skeleton.tsx` | 6곳 | `shared/ui/` |
| `LoadingSpinner.tsx` | 7곳 | `shared/ui/` |
| `Pagination.tsx` | 2곳 | `shared/ui/` |
| `BookmarkButton.tsx` | 전역 | `shared/ui/` |
| `LoginRequiredCard.tsx` | 4곳 | `shared/ui/` |
| `ReportRequiredCard.tsx` | 3곳 | `shared/ui/` |
| `ListStateUI.tsx` | 3곳 | `shared/ui/` |
| `SelectDropdown.tsx` | 2곳 | `shared/ui/` |
| `NotificationModal.tsx` | 레이아웃 | `shared/ui/` |
| `Loading.tsx` | 1곳 | `shared/ui/` |

---

### Phase 5. Card 컴포넌트 통합
> ⏱ 예상 시간: 2~3시간 | 🔴 충돌 위험: 높음 | 🖥️ 화면 변경: 없음 (렌더링 JSX 동일)

**무엇을 하나요?**  
이름만 다르고 비슷한 역할의 카드 컴포넌트를 `variant` prop으로 통합합니다.

#### 프로젝트 카드: 4개 → 1개

```
Before                              After
──────────────                      ──────────────
MainProjectCard.tsx     ──→   <ProjectCard variant="grid" />
ProjectLg.tsx           ──→   <ProjectCard variant="list" />
ProjectSm.tsx           ──→   <ProjectCard variant="compact" />
RecommendProjectCard.tsx──→   <ProjectCard variant="recommend" />
```

#### 개발자 카드: 3개 → 1개

```
Before                              After
──────────────                      ──────────────
ProfileCard.tsx (Lg/Md/Sm) ──→  <DeveloperCard variant="search" size="lg|md|sm" />
RecommendDeveloperCard.tsx ──→  <DeveloperCard variant="recommend" />
BookmarkDeveloperCard.tsx  ──→  <DeveloperCard variant="bookmark" />
```

**사용 예시 (변경 전 → 변경 후):**

```tsx
// ❌ Before: 어떤 카드를 써야 하는지 헷갈림
import MainProjectCard from '@components/common/MainProjectCard';
import ProjectLg from '@components/common/ProjectLg';
import RecommendProjectCard from '@components/common/RecommendProjectCard';

// ✅ After: 하나만 import, variant로 구분
import { ProjectCard } from '@shared/components/project/ProjectCard';

<ProjectCard variant="grid" ... />      // 메인 페이지 그리드
<ProjectCard variant="list" ... />      // 검색 리스트
<ProjectCard variant="recommend" ... /> // 추천 (적합도 점수 포함)
```

---

### Phase 6. 진입점 및 네이밍 정리
> ⏱ 예상 시간: 30분 | 🔴 충돌 위험: 중간 | 🖥️ 화면 변경: 없음

**무엇을 하나요?**

| 작업 | 내용 |
|:--|:--|
| 진입점 이동 | `src/App.tsx`, `main.tsx` → `src/app/` 폴더로 |
| 라우터 이동 | `shared/routes/routers.tsx` → `app/router.tsx` |
| 잘못된 위치 수정 | `pages/login/profile-page.tsx` → `pages/auth/` 아래로 |
| 파일명 공백 수정 | `Data _ Bundling.json` → `report-loading.json` |
| 네이밍 통일 | 아래 규칙으로 파일명 일괄 변경 |

#### 네이밍 규칙

| 종류 | 규칙 | 예시 |
|:--|:--|:--|
| 폴더 | kebab-case | `my-info/`, `project-detail/` |
| React 컴포넌트 | PascalCase | `ProjectCard.tsx`, `Header.tsx` |
| 훅 | kebab-case + `use-` | `use-bookmarks.ts` |
| 스토어 | kebab-case + `.store` | `auth.store.ts` |
| 타입 | kebab-case + `.types` | `project.types.ts` |
| 페이지 | PascalCase + `Page` | `MainPage.tsx`, `LoginPage.tsx` |

---

## ⚠️ 주의사항

1. **화면·기능은 변경되지 않습니다.** 파일 위치와 이름만 바꾸는 작업입니다.
2. **Phase 3~6은 파일 이동이 포함**되어 있어서, 다른 브랜치에서 같은 파일을 수정 중이면 merge 충돌이 발생할 수 있습니다. **팀원 모두 현재 작업을 develope에 merge한 후** 진행하는 것을 권장합니다.
3. **Phase 1~2는 충돌 위험이 거의 없어서** 먼저 진행 가능합니다.

---

## 📅 권장 일정

| 시점 | 작업 | 비고 |
|:--|:--|:--|
| **즉시 가능** | Phase 1~2 (중복 제거 + 미사용 삭제) | 충돌 위험 거의 없음 |
| **팀 조율 후** | Phase 3~6 (파일 이동 + 통합) | 일정 잡고 한 번에 처리 |

---

## ✅ 최종 효과

| Before | After |
|:--|:--|
| `common/` 폴더에 31개 파일 | 역할별로 분리 (ui/ project/ developer/) |
| 프로젝트 카드 7개 파일 | `ProjectCard` 1개 (variant로 구분) |
| 개발자 카드 6개 파일 | `DeveloperCard` 1개 (variant로 구분) |
| 같은 함수 6곳 복사 | 유틸 1곳에서 관리 |
| 같은 이미지 API 2개 파일 | `images.ts` 1개로 통합 |
| 페이지 전용 컴포넌트가 shared에 | 해당 페이지 `_components/` 안으로 |
| `utils/`와 `libs/` 분리 모호 | `lib/` 하나로 합침 |
| 미사용 mock 코드 잔존 | 깔끔하게 삭제 |
| 네이밍 규칙 혼재 | 전체 통일 |
