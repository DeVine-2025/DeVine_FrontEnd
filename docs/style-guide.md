# style-guide.md ✨

### 마음 ON Client 스타일 가이드

이 문서는 우리 프로젝트의 **스타일 작성 원칙**과 **실전 예시**를 모아둔 가이드입니다. 반드시 아래 순서대로 확인해주세요.

<br />

## 0) 전제 & 가져오기

- 전역에서 `10px = 1rem` 으로 설정되어 있습니다. (예: `html { font-size: 62.5%; }`)
- 전역 스타일 진입점에서 다음 파일이 로드됩니다.
  - `@/styles/theme.css` — **타이포/컬러 등 토큰(디자인 시스템 대행)**
  - `@/styles/custom-utilities.css` — **반복되는 Tailwind 조합을 축약한 유틸리티**

⚠️ `inline style`(예: `<div style={{ ... }}>`)은 **금지**입니다. 토큰/유틸로 표현 안 되면 **새 유틸리티를 추가**하거나 **CSS 변수**를 활용하세요.

<br />

## 1) 커스텀 유틸 사용하기 (`@/styles/custom-utilities.css`)

Tailwind 클래스 나열이 길어지는 문제를 줄이기 위해 **프로젝트 표준 축약 유틸**을 제공합니다.  
이미 정의된 것은 **유틸 이름 그대로** 쓰세요. (새 조합이 반복되면 유틸에 추가 요청)

### 1-1. 왜 쓰나요?

- **가독성**: `flex flex-col items-center gap-4` → `flex-col-center gap-4`
- **일관성**: 팀 전원이 같은 축약어를 사용
- **변경 용이**: 유틸 하나만 바꾸면 전역 반영

### 1-2. 자주 쓰는 예시

> 아래는 **예시**입니다. 실제 제공 유틸 이름은 `custom-utilities.css`를 기준으로 사용하세요.

- 수직 정렬: `flex flex-col` -> `flex-col`
- 중앙 정렬(수직/수평): `flex items-center justify-center` -> `flex-row-center`

> 유틸이 없으면 **반복 3회 이상**일 때 추가하세요. 한 번/두 번 쓰는 경우엔 그냥 Tailwind로...

### 1-3. z-index 레이어 규칙

z-index는 충돌을 막기 위해 **레이어 구조**를 고정합니다. 다음 **의미 기반 유틸**만 사용하세요.

> (예시) `z-base` < `z-sticky` < `z-nav` < `z-dropdown` < `z-modal` < `z-toast`

- 새 요소가 필요하면 **기존 레이어 중 어디에 속하는지** 먼저 판단하세요.
- **임의 숫자**(`z-[9999]`) 사용 금지.
- 불가피하면 유틸 새로 정의 후 사용.

---

## 2) `theme.css` 사용하기 (디자인 토큰)

디자인 시스템 정식 도입 전까지 **임시 토큰**을 제공하며, **원시 Tailwind 토큰 사용을 지양**합니다.

### 2-1. 타이포그래피는 **디자인 시스템 이름**으로

- ❌ `text-base font-medium`
- ✅ `body2`

> 예시 토큰(가정): `display1`, `headline1`, `title3`, `body1`, `body2`, `caption` …

### 2-2. 컬러도 **디자인 시스템 이름**으로

- ❌ `text-red-500`, `bg-gray-100`
- ✅ `text-primary`, `text-danger`, `bg-surface`, `border-subtle`

> 목적이 분명한 이름을 쓰면 테마 전환/디자인 개편 시 **코드 수정 최소화**

### 2-3. 예시

```tsx
// X
<h2 className="text-xl font-semibold text-red-500">경고</h2>
<p className="text-base text-gray-600">내용…</p>

// O
<h2 className="title3 text-danger">경고</h2>
<p className="body2 text-secondary">내용…</p>
```

### 2-4. px vs rem

px은 절댓값을 사용하는 단위입니다. 즉, 고정된 물리적 크기에 해당하며, 화면 해상도에 따라 달라질 수 있습니다. 반면, rem은 루트 글꼴 크기에 비례하여 상대적으로 바뀌는 단위이기에 일관된 사용자 경험을 제공할 수 있습니다. 따라서 저희는 10px 대신 1rem, 1.5px 대신 1.5rem을 사용합니다.(ex. px-[1.6rem]) 이미 10px를 1rem으로 정의해 두었기 때문에 바로 사용하시면 됩니다.

단, border-radius의 경우 rem 단위 대신, px를 사용해 주세요
둥근 정도는 픽셀 단위로 의도가 정확합니다. 화면 배율/접근성 변화와 무관하게 디자인 윤곽을 고정합니다.
