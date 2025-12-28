# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Biome 설정 및 사용 방법

이 프로젝트는 코드 포맷팅과 린팅을 위해 [Biome](https://biomejs.dev/)을 사용합니다.

### 📋 주요 기능

- **코드 포맷팅**: 일관된 코드 스타일 유지
- **린팅**: 코드 품질 및 오류 검사
- **자동 정렬**: Import 문 및 CSS 클래스 자동 정렬
- **자동 수정**: 수정 가능한 문제 자동 해결

### 🚀 사용 방법

#### 1. 명령어로 실행

```bash
# 코드 검사 (오류 확인만)
yarn lint

# 코드 검사 및 자동 수정
yarn lint:fix

# 포맷팅 및 정렬 (포맷팅 + 린트 수정)
yarn format
```

#### 2. 저장 시 자동 포맷팅

파일을 저장하면 자동으로 포맷팅 및 정렬이 적용됩니다.

**필수 조건**: Cursor 또는 VS Code에서 **Biome 확장 프로그램**이 설치되어 있어야 합니다.

- [Biome 확장 프로그램 설치 (VS Code)](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
- Cursor에서는 VS Code 확장 프로그램과 동일하게 설치 가능

### ⚙️ 설정 파일

- `biome.json`: Biome 설정 파일
- `.vscode/settings.json`: 에디터 자동 포맷팅 설정

### 📝 주요 규칙

현재 프로젝트에서 적용된 주요 Biome 규칙:

- ✅ Import 문 자동 정렬
- ✅ CSS 클래스 자동 정렬 (Tailwind CSS)
- ✅ 사용하지 않는 import 제거
- ✅ Non-null assertion 금지
- ✅ Button 요소에 명시적 type 속성 필수
- ✅ 단일 따옴표 사용
- ✅ Trailing comma 사용

### 🔧 설정 커스터마이징

`biome.json` 파일을 수정하여 규칙을 커스터마이징할 수 있습니다.

```json
{
  "linter": {
    "rules": {
      "recommended": true,
      // 여기에 추가 규칙 설정
    }
  }
}
```

자세한 설정 옵션은 [Biome 공식 문서](https://biomejs.dev/reference/configuration)를 참고하세요.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
