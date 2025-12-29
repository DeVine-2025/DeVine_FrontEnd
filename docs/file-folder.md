# file-folder.md

우리 프로젝트에서 폴더와 파일명은 **항상 케밥 케이스(kebab-case)** 를 사용합니다.  
컴포넌트/타입/함수 이름 등 **파일 내부의 식별자**는 별도 규칙(컴포넌트: PascalCase, 훅/유틸: camelCase, 상수: UPPER_SNAKE_CASE)을 따릅니다.

---

## 1) 기본 규칙

- **폴더/파일명 = kebab-case**
  - 예) `payment-complete-view.tsx`, `user-profile`, `order-item.ts`
- **대소문자 혼용 금지** (CI/Linux는 대소문자 구분)
- **역할 접미사 권장**
  - `-page`(페이지), `-layout`(레이아웃), `-view`/`-section`(페이지 내 구역), `-card`/`-modal`/`-button`(UI 단위)
- **훅 파일명은 `use-*.ts`**
  - 예) `use-payment-stats.ts`
- **테스트/스토리 파일**
  - 테스트: `*.test.ts` / `*.test.tsx`
  - 스토리: `*.stories.tsx`
- **배럴 파일**
  - 각 디렉터리 공개 API만 `index.ts`로 export (내부 구현 노출 금지)
- **환경 파일**
  - `.env`, `.env.local`, `.env.development` 등 **점으로 시작**

> 별칭(alias)은 `absolute-paths.md`의 규칙을 따르세요. `@pages`(= `src/pages`), `@components`·`@hooks` 등은 `src/shared/*`에 매핑됩니다.

---

## 2) 폴더 구조 원칙

- **페이지 단위 콜로케이션**: 특정 페이지에서만 쓰는 컴포넌트/훅/유틸은 페이지 폴더 안에 보관
- **공용은 shared로 승격**: 2곳 이상에서 쓰이면 `src/shared/*`로 이동
- **폴더명은 의미 중심의 단수/복수 선택** (일관성 유지)

---

## 3) 예시 구조 (권장 템플릿)

```text
.
├── .github/
├── node_modules/
├── public/
├── src/
│   ├── pages/                         # 라우팅 엔트리 (alias: @pages)
│   │   ├── main/
│   │   │   ├── main-page.tsx          # 페이지 컴포넌트 (접미사: -page)
│   │   │   ├── components/
│   │   │   │   ├── hero-section.tsx
│   │   │   │   └── stats-card.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-main-stats.ts
│   │   │   ├── constants/
│   │   │   │   └── main-keys.ts
│   │   │   ├── utils/
│   │   │   │   └── map-main-response.ts
│   │   │   └── index.ts                # (선택) 배럴
│   │   ├── login/
│   │   │   ├── login-page.tsx
│   │   │   └── components/
│   │   │       └── login-form.tsx
│   │   └── my-page/
│   │       └── my-page.tsx
│   │
│   └── shared/                         # 공용 레이어 (alias: @styles,@components,@hooks,...)
│       ├── components/
│       │   ├── button/
│       │   │   ├── button.tsx
│       │   │   └── index.ts
│       │   ├── search-bar/
│       │   │   ├── search-bar.tsx
│       │   │   └── index.ts
│       │   └── empty-state.tsx
│       ├── layouts/
│       │   └── root-layout.tsx
│       ├── hooks/
│       │   └── use-splash.ts
│       ├── utils/
│       │   ├── format-number.ts
│       │   └── cn.ts
│       ├── constants/
│       │   └── storage-keys.ts
│       ├── types/
│       │   ├── order-item.ts
│       │   └── user.ts
│       ├── routes/
│       │   └── router.tsx
│       ├── libs/
│       │   └── query-client.ts
│       ├── apis/
│       │   ├── factory.ts
│       │   └── auth/
│       │       ├── auth.ts
│       │       └── auth-queries.ts
│       ├── styles/
│       │   ├── theme.css
│       │   └── custom-utilities.css
│       ├── assets/
│       │   ├── images/
│       │   │   └── empty-state.svg
│       │   └── icons/
│       └── mocks/
│           └── handlers.ts
│
├── .env                                  # 환경 파일 (점 시작)
├── index
```
