# DeVine 파일 구조 및 컨벤션 가이드

이 문서는 DeVine 프론트엔드에서 파일을 어디에 두고, 어떤 이름으로 만들고, 어떤 방향으로 import해야 하는지 정리한 팀 컨벤션입니다.

목표는 단순합니다.

- 처음 보는 팀원도 파일 위치를 예측할 수 있어야 합니다.
- 한 화면에서만 쓰는 코드는 해당 화면 근처에 두고, 여러 화면에서 쓰는 코드만 `shared`로 올립니다.
- API, 상태, UI, 유틸의 역할을 섞지 않습니다.
- 새 파일을 만들 때 “어디에 둬야 하지?”라는 고민을 최소화합니다.

## 1. 최상위 구조

```text
src/
├── app/          # 앱 실행, 전역 Provider, 라우터
├── pages/        # 라우트 단위 화면
├── shared/       # 여러 화면에서 공유하는 코드와 자산
└── vite-env.d.ts
```

### `src/app`

앱이 실행되기 위해 필요한 전역 설정만 둡니다.

- `main.tsx`: React 앱 진입점
- `App.tsx`: 전역 Provider 연결
- `router.tsx`: 전체 라우트 선언

`app`에는 특정 페이지의 비즈니스 로직이나 UI 컴포넌트를 두지 않습니다.

### `src/pages`

사용자가 실제로 접근하는 화면 단위 코드입니다. URL, 라우트, 화면 흐름을 기준으로 폴더를 나눕니다.

예시:

```text
pages/
├── main/
├── signup/
├── search/
├── project-create/
├── project-detail/
├── developer-detail/
├── report/
└── my-info/
```

페이지 내부에 둘 수 있는 파일은 다음과 같습니다.

```text
pages/[feature]/
├── [feature]-page.tsx     # 라우트에 직접 연결되는 페이지
├── _components/           # 이 feature에서만 쓰는 컴포넌트
├── _hooks/                # 이 feature에서만 쓰는 훅
├── _constants/            # 이 feature에서만 쓰는 상수
├── _types/                # 이 feature에서만 쓰는 타입
└── index.ts               # 필요한 경우에만 export 정리
```

신규 페이지 전용 폴더는 `_components`, `_hooks`, `_constants`, `_types`처럼 언더스코어 접두사를 사용합니다. 언더스코어는 “라우트가 아니라 내부 구현 폴더”라는 의미입니다.

### `src/shared`

두 개 이상의 화면에서 재사용되는 코드만 둡니다. 한 화면에서만 쓰는 코드를 미리 `shared`에 올리지 않습니다.

```text
shared/
├── apis/          # 서버 통신 함수, API 타입, query/mutation
├── assets/        # 이미지, 아이콘, Lottie, 정적 파일
├── components/    # 도메인 의미가 있는 공용 컴포넌트
├── constants/     # 여러 화면에서 쓰는 상수
├── hooks/         # 여러 화면에서 쓰는 훅
├── layouts/       # RootLayout, Header, Footer 등 레이아웃
├── libs/          # 순수 유틸, 외부 라이브러리 설정
├── mappers/       # API 데이터와 UI 데이터 간 변환
├── store/         # Zustand 등 전역 상태
├── styles/        # 전역 CSS, 디자인 토큰
├── types/         # 여러 화면에서 공유하는 타입
└── ui/            # 도메인에 의존하지 않는 순수 UI
```

## 2. 파일을 어디에 둘지 결정하는 기준

새 파일을 만들 때는 아래 순서로 판단합니다.

### 1단계: 특정 페이지에서만 쓰는가?

특정 페이지 또는 특정 라우트 묶음에서만 사용하면 `pages/[feature]/_components`, `pages/[feature]/_hooks` 등에 둡니다.

예시:

- 회원가입 단계 안에서만 쓰는 입력 섹션
- 프로젝트 생성 화면에서만 쓰는 에디터 버튼
- 리포트 화면 내부에서만 쓰는 카드 스켈레톤

### 2단계: 여러 페이지에서 쓰는가?

두 개 이상의 feature에서 실제로 재사용되면 `shared`로 올립니다.

단, “나중에 쓸 것 같아서” 미리 올리지 않습니다. 실제 재사용이 생겼을 때 이동합니다.

### 3단계: 도메인 의미가 있는가?

도메인 의미가 없으면 `shared/ui`에 둡니다.

예시:

- `Button`
- `Modal`
- `Skeleton`
- `Pagination`
- `Loading`

프로젝트, 개발자, 리포트, 북마크처럼 서비스 도메인을 알고 있으면 `shared/components`에 둡니다.

예시:

- `ProjectCard`
- `DeveloperCard`
- `BookmarkButton`
- `ReportRequiredCard`

## 3. 네이밍 컨벤션

### 폴더명

폴더명은 `kebab-case`를 사용합니다.

```text
project-create/
developer-detail/
my-info/
```

페이지 내부 구현 폴더는 언더스코어 접두사를 사용합니다.

```text
_components/
_hooks/
_constants/
_types/
```

### 페이지 파일

라우트에 직접 연결되는 페이지 파일은 `kebab-case` + `-page.tsx`를 사용합니다.

```text
main-page.tsx
project-create-page.tsx
developer-detail-page.tsx
report-detail-page.tsx
```

### 컴포넌트 파일

React 컴포넌트 파일은 `PascalCase.tsx`를 사용합니다.

```text
ProjectCard.tsx
DeveloperCard.tsx
SearchTabs.tsx
BasicProfileSection.tsx
```

### 훅, 스토어, 타입, 유틸 파일

```text
use-projects.ts          # hook
theme.store.ts           # Zustand store
project.types.ts         # type
storage.ts               # utility
query-string.ts          # utility
```

### API 파일

API 파일은 도메인 기준 `kebab-case.ts`를 사용합니다.

```text
projects.ts
project-detail.ts
github-repos.ts
nickname-check.ts
```

도메인이 커지면 폴더로 분리합니다.

```text
apis/report/
├── report.ts
├── report-queries.ts
└── report-mutation.ts
```

## 4. Import 규칙

프로젝트 내부 import는 가능한 alias를 사용합니다.

```ts
import { axiosInstance } from '@apis/instance';
import { cn } from '@libs/cn';
import ProjectCard from '@components/project/ProjectCard';
import Loading from '@ui/Loading';
```

가까운 같은 폴더 내부 파일은 상대경로를 허용합니다.

```ts
import SearchTabs from './_components/SearchTabs';
import useProjectCreateForm from './_hooks/useProjectCreateForm';
```

### 의존 방향

허용되는 방향:

```text
app -> pages -> shared
app -> shared
pages -> shared
```

금지되는 방향:

```text
shared -> pages
shared -> app
```

`shared`는 전역 공용 레이어이므로 특정 페이지를 import하면 안 됩니다. `shared`에서 페이지 코드가 필요해지는 경우, 해당 코드가 정말 공용인지 다시 판단하고 `shared` 내부로 분리합니다.

페이지끼리 직접 import하는 것도 최소화합니다. 다른 페이지에서도 필요한 컴포넌트라면 `shared/components` 또는 `shared/ui`로 옮깁니다.

## 5. API 계층 컨벤션

API 코드는 `src/shared/apis` 아래에 둡니다.

기본 원칙:

- 서버 통신 함수는 `shared/apis`에 둡니다.
- 화면 컴포넌트 안에서 URL 문자열을 직접 만들지 않습니다.
- 인증 토큰, base URL, 에러 처리 방식은 가능한 공통 인스턴스에서 관리합니다.
- 신규 API는 기존 패턴을 확인한 뒤 같은 도메인 근처에 추가합니다.

권장 구조:

```text
apis/
├── instance.ts           # axios 인스턴스, 공통 인증 처리
├── base/                 # 공통 응답 타입, 공통 API 유틸
├── projects.ts           # 프로젝트 API
├── members.ts            # 회원 API
├── github-repos.ts       # 깃허브 레포 API
└── report/               # 리포트처럼 커진 도메인
    ├── report.ts
    ├── report-queries.ts
    └── report-mutation.ts
```

### API 추가 기준

작은 도메인은 단일 파일로 시작합니다.

```text
apis/bookmarks.ts
apis/terms.ts
apis/nickname-check.ts
```

아래 조건 중 하나라도 해당하면 폴더로 분리합니다.

- query와 mutation이 함께 있다.
- 타입, mapper, 여러 endpoint가 섞여 파일이 길어진다.
- 같은 도메인을 여러 페이지에서 사용한다.
- React Query key를 별도로 관리해야 한다.

## 6. 상태와 데이터 변환

### `shared/store`

여러 화면에서 공유하는 상태만 둡니다.

예시:

- 로그인/회원 상태
- 테마
- 알림
- 전역 필터

한 페이지에서만 쓰는 상태는 해당 페이지 컴포넌트 또는 페이지 전용 훅에 둡니다.

### `shared/mappers`

API 응답을 UI에서 쓰기 좋은 형태로 바꾸는 로직을 둡니다.

컴포넌트 안에서 복잡한 데이터 변환을 직접 하지 않습니다. 같은 변환이 두 번 이상 필요하면 mapper로 분리합니다.

### `shared/libs`

순수 함수 또는 외부 라이브러리 설정을 둡니다.

예시:

- `cn.ts`
- `storage.ts`
- `query-client.ts`
- `query-string.ts`

React 상태나 DOM에 의존하는 코드는 `libs`가 아니라 `hooks` 또는 컴포넌트에 둡니다.

## 7. Assets 규칙

정적 자산은 기본적으로 `shared/assets`에 둡니다.

```text
assets/
├── icons/
├── images/
├── stackBadge/
└── lottie/
```

특정 페이지에서만 쓰고 다른 곳에서 재사용할 가능성이 낮은 JSON/Lottie 파일은 페이지 옆에 둘 수 있습니다. 다만 같은 성격의 자산이 늘어나면 `shared/assets`로 이동합니다.

SVG를 React 컴포넌트처럼 사용할 때는 SVGR import를 사용합니다.

```ts
import ChevronLeftIcon from '@assets/icons/chevron-left.svg?react';
```

## 8. 라우트와 페이지 export

라우트 등록은 `src/app/router.tsx`에서 관리합니다.

페이지 export는 `src/pages/index.ts`에서 정리합니다. 새 페이지를 라우터에 연결할 때는 다음 순서를 지킵니다.

1. `src/pages/[feature]/[feature]-page.tsx`를 만든다.
2. `src/pages/index.ts`에 export를 추가한다.
3. `src/app/router.tsx`에 route를 추가한다.

`pages/index.ts`는 라우터에서 페이지를 모아 가져오기 위한 진입점입니다. 일반 컴포넌트 재사용 목적으로 `@pages`를 남용하지 않습니다.

## 9. 리팩터링 체크리스트

파일을 옮기거나 새로 만들 때 아래를 확인합니다.

- 이 파일이 한 페이지에서만 쓰이면 `pages/[feature]` 내부에 있는가?
- 두 개 이상의 페이지에서 쓰이면 `shared`에 있는가?
- 도메인 없는 UI는 `shared/ui`, 도메인 있는 공용 UI는 `shared/components`에 있는가?
- `shared`에서 `pages`를 import하지 않는가?
- API 호출 URL과 인증 처리가 컴포넌트에 직접 흩어져 있지 않은가?
- 파일명과 폴더명이 이 문서의 네이밍 규칙을 따르는가?
- 문서와 실제 구조가 달라졌다면 이 문서도 함께 수정했는가?

## 10. 현재 구조에서 정리하면 좋은 항목

아래 항목은 신규 코드 작성 시 우선적으로 맞춰가야 할 부분입니다.

- 페이지 전용 컴포넌트 폴더명을 `_components`로 통일합니다.
- 페이지 전용 훅 폴더명을 `_hooks`로 통일합니다.
- 신규 API는 `shared/apis/instance.ts`의 공통 인증/base URL 정책을 우선 사용합니다.
- 같은 도메인의 API가 루트 파일과 하위 폴더에 나뉘어 있으면 한쪽으로 모읍니다.
- `image.ts`와 `images.ts`처럼 이름만 다른 유사 API 파일은 역할을 분리하거나 통합합니다.
- 여러 페이지에서 쓰는 페이지 내부 컴포넌트는 `shared/components` 또는 `shared/ui`로 이동합니다.

이 문서는 “완료된 상태”를 설명하는 문서가 아니라, 앞으로 코드가 커질 때 구조가 흔들리지 않도록 기준을 제공하는 문서입니다.
