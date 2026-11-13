# 현재 디자인과 데이터 연결 가이드

최종 확인: 2026-11-13

## 작업 원칙

- 현재 목데이터로 완성한 화면과 상호작용을 디자인 기준으로 유지한다. 실제 API에 아직 없는 데이터라는 이유만으로 카드나 필터 등 화면 요소를 임의로 없애지 않는다.
- 목데이터는 개발 중 디자인을 확인하기 위한 예시다. 실제 회원의 정보나 실제 분석·추천 결과로 오인하지 않도록 한다. 목데이터 ID나 북마크·응답을 실제 API에 보내지 않는다.
- 실제 데이터는 추후 백엔드 준비 및 응답 확인 후 현재 디자인에 연결한다. API에 없는 값은 백엔드 계약을 확인하고, 예시와 실제 결과의 구분을 유지한 채 처리한다. 임의의 점수나 추천 근거를 실제 결과처럼 만들지 않는다.
- 현재 화면과 예전 화면의 API 연결, 라우팅, 상태 및 사용자 기능을 비교하고 필요한 기능을 검증하기 전에는 예전 코드를 삭제하지 않는다. 미사용으로 보이는 코드라도 라우트와 간접 참조를 먼저 확인한다.

## 데이터 모드

`src/shared/config/data-mode.ts`의 `useMockData`를 사용하는 화면은 개발 서버에서 기본적으로 목데이터 또는 미리보기를 사용한다. 개발 서버 실행 시 `VITE_DATA_MODE=api`를 설정하면 해당 화면의 실제 데이터 경로를 확인할 수 있다. Vite 환경 변수 변경 후 개발 서버를 재시작해야 한다.

PowerShell 예시:

```powershell
$env:VITE_DATA_MODE = 'api'
yarn dev
```

기본 목데이터 모드로 되돌리려면 해당 환경 변수를 제거하고 다시 실행한다.

```powershell
Remove-Item Env:VITE_DATA_MODE -ErrorAction SilentlyContinue
yarn dev
```

**QA 임시 미리보기:** 로컬 개발 서버와 정확한 `qa.devine.kr` 호스트에서는 `useMockData`가 기본 true다. QA에서 실제 API로 전환하려면 빌드 환경변수 `VITE_DATA_MODE=api`를 지정하고 다시 배포한다. 운영 및 그 외 호스트에서는 `VITE_DATA_MODE=mock`이어도 false다.

**주의:** 이 전환은 공통 설정을 사용하는 화면에만 적용된다. 앱 전체가 완전한 목데이터 모드인 것은 아니다. 개발자 탐색·인증·결제·프로필 등 실제 API 연결은 유지된다. QA의 리포트 샘플 및 알림 예시도 공통 설정을 사용하며, 회원가입·로딩 개발 전용 미리보기 라우트는 QA에 노출하지 않는다.

## 화면별 현황

| 화면 | 현재 목데이터 및 디자인 | 실제 연결과 확인할 곳 |
| --- | --- | --- |
| 홈 `/home` | `src/pages/home/home-page.tsx`, `home-mock-data.ts`의 카드와 배너 | `home-live-sections.tsx`에 주목 프로젝트, 최신 프로젝트, 추천 API 연결이 있다. 실제 계정으로 빈 상태, 추천, 북마크 및 상세 이동 검증 필요. |
| 프로젝트 탐색 `/search/projects` | `src/pages/search/project/project-explore-page.tsx`에서 홈의 프로젝트 예시를 사용한다. 검색·필터·목데이터 북마크·상세 미리보기를 유지한다. | 같은 파일의 `getProjects`, API 매핑, 북마크 및 상세 이동을 사용한다. 실제 응답으로 모든 필터, 정렬, 페이징, 북마크 확인 필요. |
| 개발자 탐색 `/search/developers` | 현재 디자인과 카드 컴포넌트를 사용한다. | `src/pages/search/developer/developer-explore-page.tsx`는 `getDevelopers` 등 실제 API를 사용하며 공통 데이터 모드에 연결된 목데이터 화면이 아니다. |
| 프로젝트 추천 `/recommend/project` | `src/pages/recommend/recommendation-projects.tsx`, `recommendation-mock-data.ts`, `RecommendationProjectCard.tsx` | 실제 추천은 `src/shared/apis/recommend.ts`. 리포트 유무, 추천 근거·점수, 필터, 북마크 및 상세 이동을 실제 응답으로 확인한다. |
| 개발자 추천 `/recommend/developer` | `recommendation-developers.tsx`, `recommendation-team-samples.ts`. 프로젝트에 따라 예시 개발자가 바뀐다. | `src/shared/apis/members.ts`의 `getRecommendMembers`, `useMyRecruitingProjects` 사용. 현재 API 경로에서 협업 시간·방식은 응답에 없으므로 숨겨져 있다. 백엔드 필드가 준비되면 예시 디자인과 필터에 실제 값을 연결한다. |
| 리포트 목록·상세 | `report-page.tsx`는 개발 모드에서 Eternal-FE 샘플을 실제 목록에 추가할 수 있다. 상세 샘플은 `report-sample-data.ts`, `report-detail-page.tsx`의 `preview=sample`. | 목록과 상세는 실제 리포트 API도 사용한다. 이 화면은 완전히 분리된 목데이터 모드가 아니다. 샘플 URL과 실제 결과를 혼동하지 않게 확인한다. |
| 지원 현황 | `src/pages/my-project/pm/my-pm-page.tsx`, `developer/my-developer-page.tsx`의 개발용 예시 화면 | 개발 환경의 버튼으로 실제 내역과 예시 내역을 바꿀 수 있다. 실제 응답 전송 여부와 전체 흐름 검증 필요. |
| 내 프로필·북마크 | `my-info-profile.tsx`, `my-info-bookmark.tsx`에 개발용 예시가 일부 포함된다. | 실제 프로필·북마크 데이터와 혼합될 수 있다. 화면 전체가 목데이터 전용은 아니다. |

라우트의 기준은 `src/shared/routes/routers.tsx`다. 예전 홈은 `/home-original`, 예전 탐색은 `/search/project` 및 `/search/developer`에 여전히 연결되어 있다. 추천 예전 화면도 `src/pages/recommend/project/`, `developer/`에 남아 있으므로 삭제하기 전에 참조와 기능을 확인한다.

## 연결 전후 검증

1. 목데이터 모드에서 현재 레이아웃, 카드·필터, 빈 상태와 예시 상호작용이 유지되는지 확인한다.
2. 실제 데이터 모드에서 인증, 로딩·오류·빈 상태, 데이터 매핑 및 프로젝트별 추천을 확인한다.
3. 검색·필터·정렬·페이지 추가 로딩, 북마크 추가/해제, 상세 이동 및 기존 사용자 기능을 이전 화면과 대조한다. API에 아직 없는 항목과 서버 측 제약을 기록한다.
4. 서로 다른 프로젝트·계정과 긴 데이터, 데이터 없음, API 실패를 검증한다. 목데이터와 실제 요청이 섞이지 않는지도 확인한다.
5. 타입 검사와 적절한 테스트·빌드를 실행한다. 실제 백엔드 또는 인증이 없어 검증하지 못한 항목은 완료로 간주하지 않는다.
6. 기능과 라우팅의 대체가 확인된 코드만 정리한다. 작업 범위 밖의 기존 변경사항은 보존한다.

이 문서는 현재 구현을 설명하며 API의 실제 가용성이나 기능 완전성을 보증하지 않는다. 연결 방식이나 검증 결과가 바뀌면 함께 갱신한다.
