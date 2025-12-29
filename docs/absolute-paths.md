# absolute-paths.md

프로젝트 절대 경로(alias) 사용 가이드

이 문서는 Vite + TypeScript 환경에서 **절대 경로(모듈 alias)** 를 설정/사용/테스트 도구와 동기화하는 표준을 설명합니다.  
우리 컨벤션은 **shared 하위는 `@...`**, **pages는 `@pages`** 로 고정합니다.  
별칭은 **tsconfig의 `paths`를 단일 소스**로 관리하고, Vite는 플러그인으로 따라갑니다.

---

## 1) 우리가 쓰는 규칙

- `@styles`, `@routes`, `@mocks`, `@libs`, `@layouts`, `@hooks`, `@constants`, `@utils`, `@apis`, `@assets`, `@components`, `@types` → 각 `src/shared/*`
- `@pages` → `src/pages`

> ex) `@styles/custom-utilities` (✅) / `@pages/onboarding/onboarding-page` (✅)

---

## 2) tsconfig 설정(단일 소스)

> **tsconfig.json**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "moduleResolution": "Bundler",
    "types": ["vite/client"],
    "paths": {
      "@styles/*": ["src/shared/styles/*"],
      "@routes/*": ["src/shared/routes/*"],
      "@mocks/*": ["src/shared/mocks/*"],
      "@libs/*": ["src/shared/libs/*"],
      "@layouts/*": ["src/shared/layouts/*"],
      "@hooks/*": ["src/shared/hooks/*"],
      "@constants/*": ["src/shared/constants/*"],
      "@utils/*": ["src/shared/utils/*"],
      "@apis/*": ["src/shared/apis/*"],
      "@assets/*": ["src/shared/assets/*"],
      "@components/*": ["src/shared/components/*"],
      "@types/*": ["src/shared/types/*"],
      "@pages/*": ["src/pages/*"]
    }
  }
}
```
