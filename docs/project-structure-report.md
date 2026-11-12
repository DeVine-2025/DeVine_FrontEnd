# DeVine 파일 구조 및 TypeScript 설정 점검
점검일: 2026-11-12

## 결론
페이지별 기능과 공통 코드, 관리자 영역이 구분되어 있으며, 주요 대형 화면의 상태·처리 로직을 훅으로 분리한 상태다.
TypeScript 검사는 통과하지만 빌드 검사 경로와 환경변수 선언은 후속 정리가 필요하다.
이번 점검에서는 TypeScript 설정과 폴더 위치를 변경하지 않았다.

## 파일 구조
아래 트리는 실제 파일과 폴더를 기준으로 주요 책임을 표시했다. 이미지·아이콘 개별 파일과 빈 폴더는 생략했다.

```text
devine/
├── AGENTS.md                         # 프로젝트 작업 규칙
├── docs/
│   ├── design-data-migration.md       # 목데이터/API 전환 및 보존 규칙
│   └── project-structure-report.md    # 이 보고서
├── public/                           # 정적 이미지·파비콘·랜딩 정적 자료
├── tests/
│   ├── auth-api.test.ts               # 인증 API 테스트
│   ├── auth-flow.test.tsx             # 인증 흐름 테스트
│   └── bookmark.browser.test.tsx      # 북마크 브라우저 테스트
├── .storybook/                       # Storybook 설정
├── src/
│   ├── main.tsx                      # React·Clerk·Helmet 진입점
│   ├── App.tsx                       # 앱 구성
│   ├── vite-env.d.ts                 # Vite 환경변수·SVG 타입
│   ├── animation-preview.tsx          # 독립 애니메이션 미리보기
│   ├── folder-prototype/             # 독립 폴더 프로토타입
│   ├── admin/                        # 관리자 전용 영역
│   │   ├── apis/                     # 관리자 API
│   │   ├── app/
│   │   ├── components/
│   │   │   └── common/               # 관리자 표·목록·모달 프레임
│   │   ├── constants/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── contents/
│   │   │   ├── coupons/
│   │   │   ├── dashboard/
│   │   │   ├── payments/
│   │   │   ├── reports/
│   │   │   ├── settings/
│   │   │   └── users/
│   │   ├── routes/                   # 관리자 라우트·접근 제어
│   │   └── styles/
│   ├── pages/                        # 사용자 화면별 구성
│   │   ├── index.ts                  # 페이지 export
│   │   ├── auth/                     # 인증 콜백
│   │   ├── home/                     # 현재 홈·배너·목/API 섹션
│   │   ├── main/                     # 라우트가 남아 있는 이전 홈
│   │   ├── landing/
│   │   │   ├── service-page.tsx
│   │   │   ├── use-section-reveal.ts
│   │   │   └── launch-ui/            # 사용 중인 히어로·배경·스타일
│   │   ├── login/                    # 로그인·프로필 입력 단계
│   │   ├── signup/                   # 약관·가입 단계·알림·약관 훅
│   │   ├── search/
│   │   │   ├── project/
│   │   │   └── developer/
│   │   ├── recommend/                # 현재 추천 화면·목데이터
│   │   │   ├── project/              # 기존 추천 API 화면
│   │   │   └── developer/
│   │   ├── project-create/
│   │   │   ├── project-create-page.tsx
│   │   │   ├── project-create-complete-page.tsx
│   │   │   ├── project-form-validation.ts
│   │   │   ├── project-form-mapper.ts
│   │   │   ├── project-draft.store.ts
│   │   │   ├── project-content-editor.tsx
│   │   │   ├── use-project-content-editor.ts
│   │   │   ├── LinkCardNode.tsx
│   │   │   └── project-create-colors.css
│   │   ├── project-detail/           # 상세 화면·모달·상세 훅·샘플
│   │   ├── developer-detail/
│   │   ├── my-info/                  # 프로필·설정·북마크·편집 훅
│   │   ├── my-project/               # PM/개발자 지원 현황·공통 전환
│   │   ├── matching/                 # 기존 매칭 흐름
│   │   ├── pay/
│   │   │   ├── pay-page.tsx
│   │   │   ├── use-pass-payment.ts
│   │   │   └── components/           # 이용권 선택·리포트 미리보기
│   │   ├── report/                   # 리포트 목록·생성·상세·결과
│   │   └── terms/
│   └── shared/
│       ├── apis/                     # 서비스 API·응답 타입·쿼리
│       │   ├── base/
│       │   ├── member/
│       │   ├── myInfo/
│       │   ├── payment/
│       │   ├── project/
│       │   └── report/
│       ├── assets/                   # 애니메이션·아이콘·이미지·스택
│       ├── components/
│       │   ├── cards/                # 공통 프로젝트·개발자 카드
│       │   ├── chat/                 # 채팅·목록·메시지·위치 훅
│       │   ├── common/               # 배지·버튼·로딩·필터 등
│       │   ├── myProject/
│       │   ├── profileDetail/
│       │   ├── recommend/
│       │   ├── report/
│       │   └── tab/
│       ├── config/                   # 목데이터/API 모드
│       ├── constants/                # 도메인 아이콘·스택 등
│       ├── hooks/
│       ├── layouts/                  # 헤더·푸터·루트
│       ├── libs/
│       ├── mappers/                  # API/UI 변환
│       ├── routes/                   # 사용자 라우트
│       ├── store/                    # auth·notification·filter·chat
│       ├── styles/
│       │   └── tokens/               # 전역·공통 토큰
│       ├── templates/
│       ├── types/
│       └── utils/
├── index.html
├── animation-preview.html
├── folder-prototype.html
├── tsconfig.json                     # 현재 빌드가 사용하는 루트 검사
├── tsconfig.app.json                 # 앱의 엄격한 설정
├── tsconfig.node.json                # vite.config.ts 검사
├── vite.config.ts
├── vitest.auth.config.ts
├── vitest.bookmark.config.ts
├── package.json
├── yarn.lock
└── package-lock.json
```

## TypeScript 설정 결과

| 항목 | 확인 결과 |
| --- | --- |
| strict | 루트·앱·Node 설정 모두 true |
| 앱 모듈 해석 | bundler, Vite에 적합 |
| 앱 보호 옵션 | noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch, noUncheckedSideEffectImports 활성 |
| import/export | 앱·Node에서 verbatimModuleSyntax 활성 |
| 출력 | noEmit으로 Vite 번들링과 역할 분리 |
| 경로 별칭 | 루트 paths를 앱이 상속, Vite는 vite-tsconfig-paths 사용 |
| 대소문자 | forceConsistentCasingInFileNames 활성 |
| 루트 검사 | yarn build의 tsc -b는 루트 tsconfig.json 사용. references가 없어 app/node 설정을 자동 검사하지 않음 |
| 검사 범위 | app은 src, node는 vite.config.ts. tests·Storybook·Vitest 설정은 이 두 검사에 포함되지 않음 |
| JS 검사 | 루트 allowJs=true, checkJs=false. 현재 src에 JS/JSX 구현 파일은 확인되지 않음 |
| 선언 파일 검사 | skipLibCheck=true. 선언 파일 내부의 타입 충돌은 별도 점검 필요 |
| 환경변수 | src/vite-env.d.ts에서 VITE_API_BASE_URL이 필수/선택으로 중복 선언됨 |
| include | 루트 include의 vite-env.d.ts는 실제 루트에 없지만 src/vite-env.d.ts가 src 범위로 포함됨 |

### 검증
- yarn tsc -p tsconfig.app.json --noEmit --pretty false: 통과
- yarn tsc -p tsconfig.node.json --noEmit --pretty false: 통과
- 직전 정리 후 yarn build: 통과 (번들 크기·baseline 데이터 경고 존재)
- 인증 테스트: 20개 통과
- git diff --check: 통과

### 후속 정리 후보
1. 빌드가 앱·Node 설정을 명시적으로 검사하도록 스크립트 또는 프로젝트 참조 구성 정리.
2. 환경변수 중복 선언을 실제 런타임 필수 여부에 맞게 통일.
3. 테스트·도구 설정의 타입 검사 범위 별도 정의.
위 사항은 현재 타입 검사가 실패한다는 의미가 아니며, 이번 커밋에서는 설정을 변경하지 않았다.

## 구조 평가
- 적절한 점: 사용자 pages, 관리자 admin, 공통 shared의 경계가 있고 에디터·가입·채팅·결제 로직이 분리되어 있다.
- 남은 점: PascalCase·camelCase·케밥 케이스 파일명이 혼재한다. myInfo/myProject/profileDetail처럼 폴더명도 혼재한다.
- shared/components/common은 카드·입력·알림·로딩 등 책임 범위가 넓다. 실제 재사용 관계에 따라 점진적으로 정리하는 편이 안전하다.
- 이전 홈·탐색·추천·매칭 화면은 라우트와 API 보존 때문에 남아 있다. 단순 중복으로 간주해 삭제하면 안 된다.
- package-lock.json과 yarn.lock이 함께 존재한다. 패키지 매니저 기준을 정한 뒤 정리할 항목이며 이번에는 기존 변경사항을 보존했다.
