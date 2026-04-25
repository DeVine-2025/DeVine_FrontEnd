# 🏗️ DeVine 프로젝트 아키텍처 및 디렉토리 가이드

이 문서는 2025년 4월 진행된 대규모 파일 구조 리팩토링의 결과와 새롭게 정의된 아키텍처 구조를 설명합니다. 기존의 파편화된 구조를 개선하여 팀원 모두가 직관적으로 코드를 관리할 수 있도록 설계되었습니다.

---

## 🔍 기존 구조 대비 주요 개선점

| 구분 | 기존 구조 (Legacy) | 개선된 구조 (Refactored) | 개선 효과 |
|:---|:---|:---|:---|
| **진입점** | `src/` 최상위에 설정 파일 산재 | **`src/app/`** 폴더로 모든 설정 응집 | 앱의 뼈대와 비즈니스 로직을 명확히 분리 |
| **순수 UI** | `shared/components/common/`에 혼재 | **`src/shared/ui/`** | 프로젝트 의존성 없는 Atomic UI 독립 관리 |
| **카드 컴포넌트** | 13개 개별 파일 (Project 7개, Profile 6개) | **`ProjectCard`**, **`DeveloperCard`** | 단 2개의 통합 컴포넌트로 모든 형태 제어 |
| **컴포넌트 위치** | 거의 모든 컴포넌트가 `shared/`에 위치 | **Colocation (상황별 배치)** 적용 | 공용인 것만 `shared`, 전용인 것은 `pages/` 내부로 |
| **네이밍** | camelCase, kebab-case 혼용 | **kebab-case** 로 전체 통일 | 일관된 파일 검색 및 리눅스/윈도우 환경 호환성 확보 |
| **중복 로직** | 유틸리티 함수가 여러 곳에 복사됨 | **`src/shared/libs/`** 로 통합 | 유지보수 포인트 1개로 단축 |

---

## 📁 새로운 디렉토리 구조 및 역할

### 상세 디렉토리 맵

```text
src/
├── app/                              # 앱 초기화 및 전역 설정
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx
│
├── pages/                            # 페이지별 독립 폴더 (Colocation)
│   ├── main/
│   ├── auth/                         # login, profile-page 등 통합
│   ├── project-detail/
│   └── ...                           # 각 폴더 내 _components, _hooks 포함
│
└── shared/                           # 💡 여러 페이지에서 공유하는 자산
    ├── ui/                           # 순수 범용 UI (Atomic)
    │   ├── Skeleton.tsx
    │   ├── LoadingSpinner.tsx
    │   ├── Pagination.tsx
    │   └── ...
    │
    ├── components/
    │   ├── project/                  # 프로젝트 관련 공유 컴포넌트
    │   │   ├── ProjectCard.tsx       # ← 통합 카드
    │   │   └── ProjectFilterBar.tsx
    │   ├── developer/                # 개발자 관련 공유 컴포넌트
    │   │   ├── DeveloperCard.tsx     # ← 통합 카드
    │   │   └── ProfileBase.tsx
    │   └── layout/                   # Header, Footer 등
    │
    ├── libs/                         # 유틸리티 (기존 utils 통합)
    ├── hooks/                        # 전역 공용 훅 (use-*.ts)
    ├── store/                        # 전역 상태 (*.store.ts)
    ├── types/                        # 전역 타입 (*.types.ts)
    ├── api/                          # API 함수 호출 로직
    └── ...
```

### 1. `src/app/` (Global Config)
애플리케이션의 설정 및 초기화를 담당합니다.
- `main.tsx`: 앱 진입점
- `App.tsx`: 전역 Provider 및 라우터 연결
- `router.tsx`: 모든 페이지 경로 설정

### 2. `src/pages/` (Feature/Domain Pages)
각 화면을 담당하며, **해당 화면에서만 사용하는 유효한 로직**을 포함합니다.
- `[page-name]/`: 페이지별 독립 폴더 (예: `auth`, `main`, `project-detail`)
- `_components/`: 이 페이지에서만 쓰는 전용 컴포넌트 (Shared 오염 방지)
- `_hooks/`: 이 페이지 전용 로직을 담은 훅

### 3. `src/shared/` (Shared Assets)
전체 프로젝트에서 공통으로 쓰이는 자산입니다.
- **`ui/`**: 순수 UI 컴포넌트 (Button, Pagination, Skeleton 등)
- **`components/`**: 도메인 성격이 가미된 공유 컴포넌트 (ProjectCard, FilterBar 등)
- **`libs/`**: 유틸리티 함수, 전역 라이브러리 설정 (기존 `utils` 통합)
- **`store/`**: Zustand 전역 상태 (`*.store.ts`)
- **`types/`**: 전역 타입 정의 (`*.types.ts`)
- **`hooks/`**: 전역 공용 훅 (`use-*.ts`)

---

## 🛠️ 핵심 변경 및 개발 규칙

### 1. 통합 카드 컴포넌트 활용
기존에 13개로 흩어져 있던 카드들을 `variant`와 `size` 속성으로 통합했습니다.
- 예: `<ProjectCard variant="grid" />` (메인용), `<ProjectCard variant="list" />` (검색용)
- 예: `<DeveloperCard variant="recommend" />` (추천용)

### 2. 파일 네이밍 규칙 (Standard)
- **React 컴포넌트/페이지**: `PascalCase.tsx`
- **폴더/유틸/훅/스토어/타입**: `kebab-case.ts` (훅은 `use-` 프리픽스, 스토어는 `.store.ts`)

### 3. 컴포넌트 배치 원칙
- **"이 컴포넌트가 다른 페이지에서도 쓰이는가?"**
  - **YES**: `src/shared/components/` 또는 `src/shared/ui/`
  - **NO**: 해당 페이지 폴더 안의 `_components/`

---

## 🏁 구조 탐색 가이드
- **UI 부품을 찾을 때**: `src/shared/ui/`
- **특정 페이지의 기능을 수정할 때**: `src/pages/[페이지명]/`
- **전역 상태나 유틸리티를 수정할 때**: `src/shared/store/` 또는 `src/shared/libs/`
- **데이터 흐름/매핑 로직을 수정할 때**: `src/shared/mappers/`
