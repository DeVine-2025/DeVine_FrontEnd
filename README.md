###

## 👨‍👩‍👧 팀원 소개

| [<img src="https://github.com/seongmin-noh.png" width="200px">](https://github.com/seongmin-noh) | [<img src="https://github.com/OhDongI.png" width="200px">](https://github.com/OhDongI) | [<img src="https://github.com/sjmd117.png" width="200px">](https://github.com/sjmd117) | [<img src="https://github.com/choikyungsoo.png" width="200px">](https://github.com/choikyungsoo) |
| :------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------: |
| [노승민](https://github.com/seongmin-noh) | [오동이](https://github.com/OhDongI) | [이주석](https://github.com/sjmd117) | [최경수](https://github.com/choikyungsoo) |


<br>

## 🛠 Tech Stack

| 역할                     | 종류                                                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| **Library**              | ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)                         |
| **Programming Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)          |
| **Styling**              | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)     |
| **Data Fetching**        | ![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=flat&logo=react-query&logoColor=white) |
| **Formatting**           | ![Biome](https://img.shields.io/badge/Biome-5A56F7?style=flat&logo=biome&logoColor=white)                         |
| **Package Manager**      | ![yarn](https://img.shields.io/badge/yarn-F69220?style=flat&logo=yarn&logoColor=white)                            |
| **Deployment**           | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)                      |

---

<br>

<details>
<summary><b style="font-size:1.7rem">📁 파일/폴더 컨벤션</b></summary>

- **폴더/파일명**: kebab-case
- **컴포넌트**: PascalCase
- **함수/훅/유틸**: camelCase
- **상수**: UPPER_SNAKE_CASE
- **역할 접미사** 권장: `-page`, `-layout`, `-view`, `-card`, `-modal` …
- **훅 파일명**: `use-*.ts`

> 상세: [`coding.md`](./docs/coding.md), [`file-folder.md`](./docs/file-folder.md)

</details>

<br>

<details>
<summary><b style="font-size:1.7rem">🎨 스타일 가이드</b></summary>

- 전역 기준: `10px = 1rem`
- 전역 스타일 진입점
  - `theme.css` → 컬러/타이포/그라데이션/레이어 토큰
  - `custom-utilities.css` → 자주 쓰는 Tailwind 조합 축약
- Inline style 금지 → 새 유틸 추가 또는 CSS 변수 활용
- **z-index**: 의미 기반 유틸 사용, 임의 숫자 금지
- **단위**: rem 사용 (단, border-radius는 px 유지)

> 상세: [`style-guide.md`](./docs/style-guide.md)

</details>

<br>

<details>
<summary><b style="font-size:1.7rem">📁 절대 경로(alias)</b></summary>

- `@pages` → `src/pages`
- `@styles`, `@components`, `@hooks`, `@libs`, `@constants`, `@utils`, `@apis`, `@assets`, `@types` → `src/shared/*`
- 단일 소스: `tsconfig.json`의 `paths` 기준, Vite 플러그인으로 동기화

> 상세: [`absolute-paths.md`](./docs/absolute-paths.md)
</details>
<br />

<details>
<summary><b style="font-size:1.7rem">📑 Commit Convention</b></summary>
우리 프로젝트는 다음과 같은 커밋 규칙을 따릅니다.
<br />

| 타입           | 의미                      |
| ------------ | ----------------------- |
| **feat**     | 새로운 기능 추가               |
| **fix**      | 버그 수정                   |
| **chore**    | 빌드/도구/패키지 설정 등 잡무 변경    |
| **style**    | 코드 스타일 변경 (포맷팅, 세미콜론 등) |
| **hotfix**   | 긴급 버그 수정                |
| **docs**     | 문서 관련 변경 (README 등)     |
| **refactor** | 코드 리팩터링 (기능 변화 없음)      |
| **test**     | 테스트 코드 추가/수정            |
| **init**     | 프로젝트 초기 설정/세팅           |
| **build**    | 빌드 관련 변경 (배포, 빌드 설정 등)  |

- scope: 선택 (비워도 허용)
- subject: 마침표 금지
- header: 최대 100자

</details>