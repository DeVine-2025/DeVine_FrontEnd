# coding.md

프로젝트 코딩 컨벤션 (이름 규칙 중심)

이 문서는 **폴더/파일/코드 요소의 네이밍 규칙**을 한 번에 이해할 수 있게 정리했습니다.  
핵심: **폴더/파일은 kebab-case**, 파일 안의 **컴포넌트는 PascalCase**, **함수/훅/유틸은 camelCase**, **상수는 UPPER_SNAKE_CASE**.

---

## 1) 테이블

| 대상                      | 규칙                                 | 예시 (✅)                                           | 잘못된 케이스 (❌)                              |
| ------------------------- | ------------------------------------ | --------------------------------------------------- | ----------------------------------------------- |
| **폴더명**                | `kebab-case`                         | `payment-history`, `user-profile`                   | `PaymentHistory`, `user_profile`                |
| **파일명(공통)**          | `kebab-case`                         | `payment-complete-view.tsx`, `use-payment-stats.ts` | `PaymentCompleteView.tsx`, `usePaymentStats.ts` |
| **페이지 컴포넌트 파일**  | `kebab-case + -page` 권장            | `checkout-page.tsx`                                 | `CheckoutPage.tsx`                              |
| **뷰/섹션 컴포넌트 파일** | `kebab-case + -view`/`-section` 권장 | `payment-complete-view.tsx`                         | `PaymentCompleteView.tsx`                       |
| **훅 파일**               | `use-*.ts`                           | `use-payment-stats.ts`                              | `payment-stats-hook.ts`                         |
| **유틸 파일**             | `kebab-case`                         | `format-number.ts`                                  | `formatNumber.ts`                               |
| **타입/인터페이스 파일**  | `kebab-case`                         | `order-item.ts`                                     | `OrderItem.ts`                                  |
| **CSS/자원 파일**         | `kebab-case`                         | `custom-utilities.css`, `empty-state.svg`           | `CustomUtilities.css`                           |

> 폴더/파일은 **항상 kebab-case**입니다. “내부에서 export 하는 이름”만 케이스가 달라질 수 있습니다.

---

## 2) 코드 내부 네이밍

### 2.1 컴포넌트

- **함수/컴포넌트 이름**: `PascalCase`
- **파일명**: `kebab-case`(역할 접미사 권장: `-page`, `-layout`, `-view`, `-card`, `-modal`…)

```tsx
// src/pages/main/main-page.tsx
export default function MainPage() {
  // PascalCase
  return <div>...</div>;
}
```
