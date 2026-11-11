# 03 — 프런트엔드 기능 구현 지침

## HTML 구조
- 시맨틱 `<header>`, `<nav>`, `<main>`, `<section>`, `<form>`, `<footer>`를 사용한다.
- `#about`, `#analyze` 앵커를 만든다.
- `#sentiment-form`, `#sentiment-text`, `#char-count`, `#analyze-button`, `#feedback`, `#result` ID를 고정한다.
- 결과 내부는 `#result-label`, `#result-confidence`, `#result-reason` 요소로 구성한다.
- `textarea`는 `maxlength="1000"`와 `aria-describedby="char-count"`를 설정한다.

## 클라이언트 상태
```text
idle → loading → success
             ↘ error
success/error → loading (재분석)
```
- `idle`: 결과/오류 숨김, 입력 가능.
- `loading`: 중복 요청 방지, 버튼 disabled, 로딩 안내.
- `success`: 결과 표시, 오류 숨김.
- `error`: 오류 표시, 결과 숨김, 재시도 가능.

## 제출 처리 순서
1. `submit` 이벤트에서 `preventDefault()`.
2. 입력값을 읽고 `trim()`으로 공백 여부 확인. 원본 텍스트의 줄바꿈은 보존하여 전송한다.
3. 공백만 있으면 `분석할 문장을 입력해 주세요.` 표시.
4. 원문 길이 1,000자 초과면 `1,000자 이하로 입력해 주세요.` 표시(서버에서도 재검증).
5. `loading` 전환 후 `fetch('/api/analyze', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text}) })`.
6. HTTP 상태와 JSON 형식을 확인한다. `response.ok`가 아니면 `error.message`를 표시한다.
7. 성공 응답의 `sentiment`, `confidence`, `reason`을 검증하고 한국어 라벨로 매핑한다.
8. DOM 업데이트는 반드시 `textContent`를 사용한다.
9. `finally`에서 버튼을 다시 활성화한다.

## 라벨 매핑
| API 값 | 한글 표시 | 시각적 스타일 |
|---|---|---|
| `positive` | 긍정 | 잔잔한 녹색 |
| `negative` | 부정 | 차분한 로즈색 |
| `neutral` | 중립 | 웜 그레이 |

## 표시 규칙
- `confidence`는 정수 0~100이며 화면에는 `88%`처럼 출력한다.
- 화면 라벨은 반드시 `AI 추정 신뢰도`로 표기한다.
- `reason`은 API가 준 문장을 그대로 텍스트로 표시하되 HTML로 해석하지 않는다.
- 분석 시작 시 이전 결과는 숨긴다.
- 네트워크 단절은 `네트워크 연결을 확인한 뒤 다시 시도해 주세요.`로 표시한다.
- 서버 오류는 서버가 반환한 안전한 `error.message`를 사용하고, 형식이 잘못된 경우 일반 오류 메시지를 사용한다.
- 글자 수는 `input` 이벤트에서 `textarea.value.length`를 기준으로 갱신한다. JavaScript UTF-16 길이와 서버 검증 기준을 동일하게 사용한다.

## 구현하지 않을 기능
- 입력 텍스트 로컬 스토리지 저장, 분석 이력, 소셜 공유, 클립보드 복사, 실시간 입력 중 자동 분석.

## 검증 기준
- 공백 입력 시 API 호출 0회.
- 연속 클릭 시 동일 시점 API 호출 1회.
- 결과 3종이 정확한 한글 라벨로 표시된다.
- 실패 후 버튼이 활성화되고 재시도할 수 있다.
- 사용자 입력에 `<script>` 문자열이 있어도 실행되지 않는다.
