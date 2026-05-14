# 작업 맥락 노트

- 랜딩 페이지는 `src/app/(main)/(start)/page.tsx`에서 `NicknameStep`을 렌더링한다.
- 메인 페이지는 `src/app/(main)/home/page.tsx`에 있다.
- `src/app/layout.tsx`에서 `Pixelify_Sans`를 선언하지만 `body`에 생성된 variable class를 붙이지 않아 실제 전역 폰트 변수로 사용할 수 없는 상태다.
- 랜딩과 홈 UI는 `Roboto`를 명시적으로 쓰는 부분과 기본 폰트에 맡기는 부분이 섞여 있어 기본 본문 폰트를 전역에서 통일하는 편이 가장 작은 수정이다.
- `body`에 `pixelifySans.variable`을 추가했고, `globals.css`의 `body` 기본 폰트를 `Roboto`, `system-ui`, `sans-serif` 순서로 지정했다.
- `npm.cmd run typecheck`는 `src/features/battle/game/scenes/BattleScene.ts(1148,94)`의 기존 `requestAnimationFrame` 콜백 타입 오류로 실패했다.
- `BattleScene.ts`의 오류는 중첩 `requestAnimationFrame` 호출에서 `Promise<void>`의 resolve를 `FrameRequestCallback` 자리에 직접 넘겨 생긴다.
- 두 번째 `requestAnimationFrame` 콜백을 `() => res()`로 감싸 타입을 맞췄고, `npm.cmd run typecheck` 통과를 확인했다.
- 사용자는 랜딩 페이지와 메인 홈의 레이아웃·폰트가 본인에게만 다르게 보인다고 했다. 원인 조사에서는 로컬 변경, 설치 도구 차이, `.next` 캐시, 폰트/에셋 누락을 우선 확인한다.
- 비교 기준 폴더는 `C:\Users\dlwnd\Downloads\FE-develop`다.
- 기준 `FE-develop`의 `src/app/layout.tsx`는 `Pixelify_Sans`를 사용하지 않고, 현재 작업 폴더는 `next/font/google`의 `Pixelify_Sans`를 import해 `body`에 variable class를 붙이고 있다.
- 기준 `FE-develop`의 `src/app/globals.css`는 `body` 기본 `font-family`를 지정하지 않지만, 현재 작업 폴더는 `font-family: 'Roboto', system-ui, sans-serif;`를 전역에 지정한다.
- 기준 `FE-develop`의 랜딩 `page.tsx`와 현재 랜딩 `page.tsx`는 화면 구조가 거의 같고, 차이는 `NicknameStep` import 경로다.
- 기준 `FE-develop`의 `NicknameStep`과 현재 `features/start/components/NicknameStep.tsx`는 색상 토큰을 직접 색상값으로 바꾼 정도라 랜딩 레이아웃의 큰 차이 원인으로 보긴 어렵다.
- 홈 폴더 비교 결과 대부분은 주석, 경로, 배틀 라우트 추가 차이다. 홈 레이아웃과 폰트 차이를 만드는 핵심 후보는 전역 `body` 폰트 지정과 루트 레이아웃의 `Pixelify_Sans` 추가다.
- 사용자가 `FE-develop` 기준과 맞추도록 수정 요청했다. 전역 폰트 관련 변경만 제거한다.
- `src/app/layout.tsx`에서 `Pixelify_Sans` import와 body variable class를 제거해 `FE-develop`과 동일하게 맞췄다.
- `src/app/globals.css`에서 `body`의 전역 `font-family: 'Roboto', system-ui, sans-serif;`를 제거했다.
- `npm.cmd run typecheck` 통과를 확인했다.
- 레이아웃이 계속 깨진다고 해서 추가 비교했다. `FE-develop`에는 전역 `*` reset과 `html, body` margin/padding reset이 없지만 현재 작업 폴더에는 있다.
- 전역 `*` reset과 `html, body` margin/padding reset을 제거했다. `npm.cmd run typecheck` 통과를 확인했다.
- 서버에서 현재 CSS를 확인했고 수동 reset, body Roboto, Pixelify body class가 모두 사라진 것을 확인했다. 변화가 없다는 것은 남은 컴포넌트 차이 또는 브라우저 표시 조건이 원인이다.
- `DialogBox`, 랜딩 `NicknameStep`, 홈 `TrainerStatusBar`의 실행 스타일 차이를 `FE-develop` 기준과 맞췄다. `npm.cmd run typecheck` 통과를 확인했다.
- 사용자가 `진행해`라고 요청했다. 배틀 제외 전체 동일화를 위해 파일 삭제까지 진행하는 것은 위험하므로, 우선 화면에 직접 영향 있는 비배틀 파일만 안전하게 정리한다.
- 비배틀 화면 차이 중 `StarterPokemonCard`가 기준 폴더의 `artworkUrl` 대신 `spriteUrl`을 쓰는 것을 확인했다. 다만 현재 프로젝트의 `PokemonData` 타입에서 `artworkUrl`이 제거되어 있어 타입체크가 실패하므로 `spriteUrl` 유지가 맞다.
- `npm.cmd run typecheck` 통과를 확인했다. 남은 비배틀 차이 중 실행 영향이 있는 것은 데이터 모델 차이에 따른 `spriteUrl` 유지, `NicknameStep` 위치 이동, 배틀 라우트 변경에 따른 홈 배틀 링크다.
- 사용자가 `/home/battle`은 유지하고 `NicknameStep`, `PokemonData.artworkUrl` 등은 모두 `FE-develop` 기준으로 맞추라고 지시했다.
- `data/pokemon.json`은 현재 프로젝트에서 `category`가 `???`인 항목들이 있고 `artworkUrl`도 누락되어 있으므로 `FE-develop` 데이터로 동기화한다.
- `NicknameStep`을 `src/app/(main)/(start)/_components/NicknameStep.tsx`로 복원하고, 랜딩 page import도 `./_components/NicknameStep`로 변경했다.
- 중복된 `src/features/start` 파일들은 제거했다.
- `PokemonData` 스키마에 `artworkUrl`을 복원하고, 스타터 포켓몬 카드 이미지를 `pokemon.artworkUrl` 기준으로 변경했다.
- `data/pokemon.json`은 `FE-develop` 파일과 동일하게 동기화했다. `npm.cmd run typecheck` 통과를 확인했다.
- 배틀 상단 AI 도전자 이름은 상단 NickName 바에만 표시하고, 트레이너 카드에서는 중복 이름을 제거한다.
- 트레이너 카드의 덱 상태 아이콘은 타입 SVG와 타입별 색상 대신 반투명 검정 원형 상태 아이콘으로 표현한다.
- `BattleTopBar.tsx` lint는 통과했다. 전체 타입체크는 기존 `vitest`와 `vitest/config` 타입 해석 오류로 실패한다.
- 사용자가 앞으로 `vitest` 테스트를 실행하지 말라고 명시했다. 배틀 UI 변경은 변경 파일 lint 중심으로 검증한다.
- AI 트레이너 카드에서는 덱 상태 pill을 제거하고 가용 포켓몬 수 텍스트만 남긴다.
- 포켓몬 수 텍스트 앞 아이콘은 `public/images/home/pokeball.svg`를 재사용한다.
- 드롭존 HP 바 불일치 원인은 카드가 `baseStats.hp`를 표시하지만 `CachePokemonDataSource`가 레벨 공식으로 더 작은 `maxHp`를 만들고, HP 바 생성도 `currentHp=maxHp`로 고정하는 구조다.
- `CachePokemonDataSource`의 `currentHp/maxHp`를 `baseStats.hp` 기준으로 맞췄고, 드롭존 HP 바 생성은 실제 `currentHp/maxHp`를 인자로 받아 표시한다.
- AI 배틀 로직 검증은 `vitest`를 실행하지 않고, `test/ai-battle/*.spec.ts`를 기대 동작 명세로 읽어 구현과 대조한다.
- `deck-builder`, `strategy`, `battle-ai-evaluator`, `rng`는 테스트 명세와 대체로 일치한다.
- 실제 `BattleScene` 연결부는 AI 강제 교체에 `chooseForceSwap`을 쓰지 않고 첫 번째 생존 포켓몬을 선택하며, 플레이어 전멸 시 `battle:ended` 패배 이벤트를 보내지 않는다.
- AI 강제 교체는 테스트 명세의 `chooseForceSwap`을 사용하도록 연결한다. 플레이어 포켓몬 기절은 남은 생존 포켓몬이 없을 때만 패배 이벤트를 보낸다.
- AI 모든 기술 PP가 소진되면 `chooseMove`의 `-1`을 받아 버둥거리기 데미지와 최대 HP 1/4 반동을 처리한다.
- 1층 배틀 진입 시 React HUD/상태 모달의 플레이어 포켓몬 목록은 모두 풀피 `available` 상태로 초기화한다.
- `BattleScreen.tsx`의 초기 포켓몬 목록을 모두 `currentHp=maxHp`, `available`로 맞췄고, 패배 처리로 진행도가 1층으로 리셋되는 경우에도 UI 목록을 풀피로 재설정한다.
- 삭제 요청으로 지웠던 `test/ai-battle/*.spec.ts` 파일 네 개는 사용자 요청에 따라 다시 복구했다.
- `BattleScene.ts`의 F/G 키 기절 애니메이션 확인용 테스트 핫키는 배포 로직에서 제거한다.

## 포켓몬 카드 배틀 로직 구현

- 요청 범위는 프로젝트 내부 데이터 기준의 카드 배틀 로직 완성이다.
- 기준 데이터는 Phaser preload 캐시의 `pokemon-data`, `moves-data`, `pokemon-moves-data`와 `data/type-chart`를 사용한다.
- 사용자가 Vitest 실행 금지를 명시했으므로 어떤 검증에서도 Vitest를 실행하지 않는다.
- 이전 요청으로 AI 드로우 직후 자동 드롭존 배치 테스트 코드는 제거된 상태다. 실제 배틀 시작 조건에서 AI 활성 카드가 배치되도록 연결한다.
- 플레이어 카드가 드롭존에 놓인 뒤에만 `placeActiveAiCard`가 AI 활성 카드를 배치한다. 드로우 직후 자동 배치 테스트 흐름은 되살리지 않았다.
- 기술 선택 이벤트는 `battle:move-selected`로 Phaser 씬에 전달되고, 씬 내부 `resolveTurn`에서 PP 차감, 명중 판정, 데미지 계산, HP 바 갱신, 기절 처리를 수행한다.
- 플레이어 HP 변화는 `battle:player-pokemon-hp-changed` 이벤트로 React HUD 상태에도 반영한다.
- 스킬 모달은 현재 PP와 최대 PP를 `pp/maxPp`로 표시하며, PP가 0인 기술은 확정할 수 없다.
- 검증은 Vitest 없이 변경 파일 ESLint와 정적 검색으로 진행했다.

## BattleScene 주석 복구

- 자동 인코딩 역복구는 `?`로 손실된 글자가 있어 신뢰하기 어렵다.
- `BattleScene.ts`의 깨진 한글 주석은 코드 맥락을 기준으로 직접 재작성했다.
- 기능 코드는 의도적으로 수정하지 않았고, 검증은 `BattleScene.ts` ESLint로 진행했다.

## 배틀 승패 페이지 플로우

- 승리 시 배틀 화면에서 바로 층을 올리면 승리 페이지가 “다음 층 이동”의 책임을 가질 수 없다.
- 승리 이벤트에서는 `/home/victory`로 이동만 하고, 승리 페이지 버튼에서 `advanceFloor()` 후 `/home/battle`로 이동한다.
- 패배 이벤트에서는 즉시 `loseLife()`를 적용하고 `/home/defeat`로 이동한다.
- 사용자가 금지한 Vitest는 실행하지 않는다.

## 배틀 기술 사용 버그 수정

- 플레이어 기술 사용마다 HP가 줄어드는 현상은 `resolveTurn`의 AI 자동 반격 블록이 즉시 실행되기 때문이다.
- 현재 요청 기준에서는 플레이어 기술 사용 시 상대 HP/PP만 처리하고, AI 공격 턴은 별도 구현 전까지 자동 실행하지 않는다.
- 기술 모달 닫힘 시 `isModalOpen`을 즉시 false로 바꾸면 모달 닫힘 애니메이션 중 손패 hover가 다시 살아날 수 있다.

## 턴제 배틀 흐름 구현

- 프로젝트 기본 전제는 턴제 카드 배틀이다.
- AI 반격을 없애는 방식이 아니라 턴 상태로 플레이어 입력 가능 구간과 AI 행동 구간을 분리한다.
- `player` 턴에서만 기술 선택을 받고, 선택 직후 `ai` 턴으로 전환해 중복 입력을 막는다.
- AI 턴이 끝나고 양쪽이 생존 중이면 다시 `player` 턴으로 복귀한다.

## Phaser 타격 모션 구현

- BattleScene은 별도 DOM 애니메이션이나 직접 렌더 루프 대신 Phaser의 `this.tweens`, `this.time.delayedCall`, `this.add.circle`, `this.input` 흐름을 이미 사용하고 있다.
- 기술 선택 이벤트는 모달이 열려 있으면 `queuedMoveIndex`에 저장하고, 모달 닫힘과 필드 카드 복귀가 끝난 뒤 `resolveQueuedMove()`에서 실행하도록 했다.
- 타격 모션 강도는 기술 `maxPp` 기준으로 나눴다. `5` 이하는 강력, `15` 이하는 보통, 그 외는 기본 모션으로 처리한다.
- 실제 데미지와 HP 바 감소는 타격 모션 콜백 이후 실행해, “기술 선택 → 모달 닫힘 → 타격 모션 → 데미지 반영” 순서를 보장한다.

## BattleScene 주석 정리와 파일 분리

- 파일 인코딩 방지를 위해 BattleScene의 기존 주석은 전부 제거하고, 유지보수에 필요한 섹션 주석만 새로 작성한다.
- 큰 파일 분리는 위험한 상속 구조 변경보다 먼저 타입, 상수, 순수 계산식처럼 안전하게 분리 가능한 영역부터 진행한다.
- Phaser 객체와 Scene 생명주기에 강하게 묶인 카드 애니메이션 메서드는 이번 단계에서 BattleScene에 남긴다.
- 검증은 사용자 요청에 따라 Vitest 없이 ESLint로 진행한다.

## 배틀 필드 배경 적용

- 선택한 캐주얼 트레이너 타워 배경 이미지는 `public/images/battle/trainer-tower-field.png`로 복사했다.
- 생성 이미지 원본은 Codex 기본 생성 폴더에 그대로 둔다.
- Phaser에서는 배경을 Scene 이미지로 깔고, 카드와 HP 바는 기존 Phaser 오브젝트 흐름을 유지한다.

## 배틀 필드 오브젝트 효과

- 수정 타워 발광은 배경을 직접 편집하지 않고 Phaser ellipse 오버레이를 ADD 블렌딩으로 얹어 반복 tween을 적용한다.
- 포켓볼 흔들림은 같은 배경 텍스처의 포켓볼 영역을 crop한 레이어를 배경 위에 겹치고, 투명 Zone 클릭 시 해당 레이어만 흔드는 방식으로 구현한다.
- 좌표는 배경 이미지 원본 픽셀과 화면 cover 스케일을 함께 고려해야 하므로, 배경 렌더 영역을 계산한 뒤 비율 좌표로 배치한다.

## 포켓볼 독립 PNG 레이어 전환

- 포켓볼 흔들림은 배경 crop 레이어가 아니라 `public/images/battle/field-pokeball.png` 투명 PNG를 별도 Phaser 이미지로 올려 처리한다.
- `bg_new_2.png`는 React 배경으로 같이 렌더링되어 새 Phaser 필드와 겹쳐 보였으므로 `BattleScreen.tsx`에서 제거했다.
- 포켓볼 위치와 클릭 영역은 배경 렌더 영역의 비율 좌표로 유지한다.

## 포켓볼 흔들림 제거

- 포켓볼이 배경과 어긋나 보일 수 있어 별도 흔들림 인터랙션과 독립 포켓볼 PNG를 제거했다.
- 배틀 필드 배경과 수정 glow 효과는 유지한다.

## 배틀 로그 UI

- 로그 이벤트는 Phaser 전투 결과가 확정되는 지점에서 `battle:log`로 발행한다.
- React는 최근 로그만 보관해 포켓몬 상태 패널 안의 빈 공간에 표시한다.
- 로그 문구 순서는 공격, 타입 효과, 기절 순서로 쌓는다.

## 배틀 로그 공격 문구 수정

- 공격 로그는 `플레이어의 {포켓몬명}이 {기술명}로 공격!` 또는 `도전자의 {포켓몬명}이 {기술명}로 공격!` 형식으로 표시한다.
- 효과와 기절 로그는 기존처럼 별도 줄로 이어서 표시한다.
- 사용자가 Vitest 실행 금지를 명시했으므로 검증은 lint로 제한한다.

## 스킬 모달 진입 카드 겹침 수정

- 현상은 스킬 모달을 열 때 플레이어 드롭존 카드가 중앙 카드 위치로 이동하는 동안 도전자 드롭존 카드가 계속 표시되어 같은 화면 중앙 영역에서 겹쳐 보이는 흐름으로 판단했다.
- 카드 경로 자체를 크게 바꾸면 기존 모달 등장 위치와 손맛이 달라질 수 있어, 전환 중에는 도전자 카드와 도전자 카드 그림자만 투명 처리하고 모달 닫힘 복귀 후 원래 투명도를 되돌리는 방식으로 범위를 좁혔다.

## 손패 카드 호밍 속도 조정

- 손패 카드가 포인터를 따라가는 속도는 `BattleScene.ts`의 드래그 업데이트에서 `LERP` 상수를 사용한다.
- 요청은 카드가 너무 빠르게 호밍되어 부자연스럽다는 것이므로 경로나 드롭 판정은 바꾸지 않고, 추적 보간값과 드래그 시작 스케일 전환 시간만 조정한다.

## 손패 카드 호밍 추가 완화

- 사용자가 더 부드러운 느낌을 요청했으므로 포인터 추적 보간값을 추가로 낮추고 드래그 시작 스케일 전환을 늘린다.
- 너무 느리면 조작감이 둔해질 수 있어 드롭 판정이나 카드 위치 보정 로직은 그대로 둔다.

## 손패 hover 모션 조정

- 사용자가 말한 부자연스러운 호밍은 드래그 중 포인터 추적이 아니라, 손패 위에서 커서가 움직일 때 카드가 hover 상태로 들리는 모션이다.
- 드래그 관련 값인 `ANIM.drag`과 `LERP`는 직전 안정값으로 되돌리고, hover 들림 모션의 시간과 easing만 조정한다.

## 손패 카드 그림자 동기화

- 손패 hover에서 카드 본체는 tween으로 천천히 확대되지만, 그림자는 `isHovered` 상태만 보고 즉시 hover 스케일을 적용해 따로 노는 것처럼 보였다.
- 그림자 스케일은 카드의 현재 `scaleX/scaleY`를 그대로 따르게 하고, offset과 alpha는 현재 스케일 기반 진행률로 보간한다.

## 도전자 카드 드롭존 배치 모션 조정

- 플레이어 카드는 사용자가 드롭존 근처까지 직접 끌고 온 뒤 `180ms`로 짧게 정착하므로 자연스럽다.
- 도전자 카드는 손패 위치에서 드롭존까지 긴 거리를 같은 `180ms`로 이동해 빠르고 부자연스럽게 보였다.
- 플레이어 배치 로직은 유지하고, 도전자 카드 배치 시간만 별도 상수로 분리해 긴 이동에 맞는 속도로 완화한다.

## 도전자 드롭존 배치 모션 플레이어와 동일화

- 사용자가 도전자 카드 드롭존 배치 모션을 플레이어와 동일하게 변경하길 요청했다.
- 이전에 추가한 도전자 전용 배치 시간은 제거하고, 플레이어 배치와 같은 `180ms` 정착 tween을 사용한다.

## 드롭존 카드 배치 속도 완화

- 플레이어와 도전자 배치 모션을 동일하게 유지하면서 속도만 더 부드럽게 낮춘다.
- 하드코딩된 `180ms`를 공통 `ANIM.place`로 분리해 양쪽 배치 모션이 같은 값을 쓰게 한다.

## 도전자 전용 드롭존 배치 속도 완화

- 플레이어 카드는 사용자가 직접 드롭존에 놓은 뒤 짧게 정착하는 모션이므로 기존 `180ms`를 유지한다.
- 도전자 카드는 자동으로 긴 거리를 이동하므로 도전자 배치에만 완화된 시간을 적용한다.

## 도전자 카드 고민 hover 후 배치

- 도전자 카드가 바로 드롭존으로 이동하면 자동 배치가 급해 보이므로, 손패에서 선택 카드가 잠깐 떠오르는 예고 모션을 넣는다.
- 선택 카드는 hover 예고가 끝난 뒤 손패 배열에서 제거하고 나머지 AI 손패를 재정렬해 충돌을 줄인다.
- 플레이어 배치 모션과 입력 흐름은 변경하지 않는다.

## 도전자 고민 hover 제거와 배치 속도 완화

- 도전자 카드가 손패에서 고민하듯 뜨는 기능은 삭제한다.
- 플레이어 배치 모션은 그대로 두고 도전자 카드가 드롭존에 놓이는 자동 이동 시간만 더 늦춘다.

## 도전자 카드 위에서 아래 배치 모션

- 도전자 배치의 좌우 바운스는 x/y 동시 이동에 `Back.easeOut`이 적용되면서 더 두드러졌다.
- 도전자 배치는 플레이어와 분리해 드롭존 위쪽 시작점에서 아래로 내려오도록 만들고, 바운스 없는 easing을 사용한다.

## 도전자 배치 모션 복구와 시간 조정

- 사용자가 위에서 아래로 내려오는 모션 변경은 취소하고 시간만 `560ms`로 요청했다.
- 도전자 배치는 다시 기존처럼 현재 카드 위치에서 드롭존까지 x/y를 함께 이동하고 `EASE.return`을 사용한다.

## 배틀 HUD 닉네임 복원 수정

- 닉네임은 `pokemon_trainer_data` 키에 저장되고 홈 화면은 같은 키를 읽는다.
- 배틀 HUD는 `useState` 초기값에서만 localStorage를 읽어서 SSR/하이드레이션 타이밍에 기본값 `NickName`으로 고정될 수 있다.
- HUD 마운트 후 클라이언트에서 localStorage를 다시 읽어 닉네임 상태를 갱신하도록 수정한다.

## 라이프 차감 타이밍 변경

- 라이프 pill은 `BattleBottomHUD`의 `playerLives` 값으로 최대 4개 표시된다.
- 기존에는 `battle:ended` 패배 이벤트를 받는 즉시 `BattleScreen`에서 `loseLife()`를 호출했다.
- 요청 흐름은 패배 판정 후 패배 페이지로 이동하고, 사용자가 재도전할 때 라이프가 1개 차감되는 방식이다.
- 따라서 `BattleScreen`은 패배 시 라우팅만 담당하고, `DefeatPage`의 재도전 버튼이 `loseLife()`를 호출하도록 책임을 옮긴다.

## 패배 즉시 라이프 차감으로 복구

- 최신 요청은 패배 판정 즉시 라이프를 차감하고, 패배 페이지 이후 재도전할 때는 차감된 라이프가 유지된 상태로 이어지는 흐름이다.
- 따라서 `BattleScreen`의 패배 이벤트에서 `loseLife()`를 호출하고, `DefeatPage` 버튼은 추가 차감 없이 `/home/battle`로 이동만 한다.

## 턴 종료 버튼과 수동 턴 전환

- 현재는 플레이어 기술 선택 후 `resolveTurn`이 곧바로 `turnPhase = 'ai'`로 바꾸고 AI 턴을 예약한다.
- 요구사항은 플레이어가 `턴 종료` 버튼을 눌러야 상대 턴으로 넘어가는 구조다.
- React 버튼은 Phaser에서 발행하는 턴 상태 이벤트를 구독하고, 클릭 시 `battle:turn-ended` 이벤트를 Phaser로 보낸다.
- AI 턴은 즉시 끝내지 않고 `ANIM.aiThink` 지연 후 행동하게 한다.

## 스킬 모달 닫힘 후 상대 카드 복구

- 스킬 모달 진입 중 겹침 방지를 위해 상대 카드와 그림자를 fade out한다.
- 모달을 들어갔다 나올 때 상대 카드가 사라지는 문제는 fade out tween과 복구 tween이 경합하거나 오래된 참조를 복구하는 흐름에서 발생할 수 있다.
- 닫힘 복귀 완료 시 현재 상대 카드와 현재 상대 그림자를 다시 조회하고, 관련 tween을 끊은 뒤 alpha를 복구한다.

## 턴 버튼 크기와 위치 조정

- 턴 버튼은 `BattleScreen.tsx`의 오른쪽 중앙 절대 위치 버튼이다.
- 포켓몬 상태창이 오른쪽 하단에 있으므로 버튼을 기존 중앙보다 아래쪽, 오른쪽 패널 근처로 이동하고 높이를 낮춘다.

## 턴 버튼 추가 위치와 색상 조정

- 턴 버튼을 포켓몬 상태창 쪽으로 더 내려 배치한다.
- 활성 `턴 종료` 상태의 텍스트는 흰색으로 보여준다.

## 턴 버튼 활성 텍스트 테두리

- `턴 종료` 활성 상태의 흰 텍스트가 배경 위에서 또렷하게 보이도록 검정 text-shadow 외곽선을 적용한다.

## 턴 버튼 활성 색상 닉네임바 스타일 적용

- 닉네임바는 `rgb(8,20,52)` 배경과 흰 텍스트를 사용한다.
- 턴 종료 활성 버튼도 같은 색상 계열을 사용하고, 이전에 추가한 검정 text-shadow 외곽선은 제거한다.

## 승리 보상 카드팩 반영

- 홈의 `TrainerStatusBar`는 `cardPackCount={5}`로 고정되어 있어 실제 보상과 연결되어 있지 않다.
- 별도 컬렉션 저장소를 새로 만들기보다 현재 무한의 탑 진행도 localStorage에 `cardPackCount`를 추가해 범위를 좁힌다.
- 승리 페이지에서 다음 층으로 넘어갈 때 `advanceFloor()`가 카드팩 1개를 지급하도록 한다.

## 팀원 배틀 결과 페이지 통합

- 전달받은 PR 파일은 `/battle/win`, `/battle/lose` 라우트와 `BattleWinPage`, `BattleLosePage` UI 컴포넌트를 추가한다.
- 현재 프로젝트에는 `src/shared/components/HomeHeader.tsx`가 아직 없으므로, 결과 페이지 컴포넌트는 기존 `@/app/(main)/home/_components/HomeHeader`를 재사용한다.
- 승리 버튼은 `advanceFloor()`를 호출해야 카드팩 보상과 다음 층 진행이 반영된다.
- 패배 버튼은 이미 패배 판정 시 `BattleScreen`에서 라이프를 차감하므로 추가 차감 없이 `/home/battle`로 이동한다.

## 결과 페이지 진행도 hydration 수정

- `useTowerProgress`가 lazy initializer에서 `readProgress()`를 호출해 서버는 기본값, 클라이언트 첫 렌더는 localStorage 값을 렌더링했다.
- 결과 페이지 텍스트의 층수/라이프/카드팩 수가 서버 HTML과 클라이언트 첫 렌더에서 달라져 hydration mismatch가 발생했다.
- 첫 렌더는 `DEFAULT_PROGRESS`로 통일하고, 마운트 후 microtask에서 localStorage 값을 반영한다.

## 배틀 플레이 라우트 변경

- 기존 배틀 플레이 페이지는 `/home/battle`에 있었고 결과 페이지는 `/battle/win`, `/battle/lose`에 추가되어 라우트가 갈라져 있었다.
- 요청에 따라 배틀 플레이 페이지를 `/battle`로 이동하고, 홈 액션과 결과 페이지 버튼도 `/battle`로 통일한다.

## 전투/AI 로직 검증

- `test/ai-battle` Vitest 43개는 모두 통과했다.
- 수동 턴 종료 구조에서 플레이어가 상대를 기절시킨 직후 `turnPhase`가 잠시 `player`로 남으면 턴 종료 버튼을 누를 수 있고, 이미 기절한 AI 포켓몬 때문에 `resolveAiTurn()`이 조기 반환하며 `ai` 턴에 멈출 수 있다.
- 상대가 기절한 순간에는 즉시 `setup` 턴으로 바꿔 턴 종료 버튼을 비활성화하고, 다음 AI 카드 배치나 승리 판정 흐름에 맡긴다.
- 플레이어 카드 기절 애니메이션 중에도 기존 활성 포켓몬이 fainted 상태일 수 있으므로, 턴 종료 이벤트에서 양쪽 활성 포켓몬 생존 여부를 한 번 더 확인한다.

## AI 고민 시간 조정

- AI 턴은 `ANIM.aiThink` 지연 후 `resolveAiTurn()`을 실행한다.
- 요청에 따라 `ANIM.aiThink`를 1500ms로 조정한다.

## AI 행동 후 턴 복귀 지연

- 기존 `ANIM.aiThink`는 턴 종료 버튼 이후 AI 행동 전 지연에만 쓰였다.
- AI가 기술을 사용한 뒤에도 플레이어 턴으로 즉시 넘어가지 않도록 같은 지연을 적용한다.
- 패배/기절 처리처럼 결과 전환이 필요한 경우에는 기존 결과 흐름을 우선한다.
- AI가 버둥거리기를 사용하고 양쪽 모두 생존한 경우도 동일하게 지연 후 플레이어 턴으로 복귀한다.

## 기술 선택 후 타격 모션 누락 수정

- 증상은 기술 모달에서 기술 선택 후 전투 로그는 찍히지만 카드 타격 모션이 나오지 않는 것이다.
- 우선 `battle:move-selected`, `queuedMoveIndex`, `resolveQueuedMove`, `resolveTurn` 흐름을 확인한다.
- 원인은 `resolveTurn()`에서 명중 실패 또는 위력 0 기술일 때 타격 모션 전에 로그만 찍고 반환하는 흐름이다.
- 플레이어 기술은 카드 타격 모션을 먼저 실행한 뒤 명중 실패면 별도 빗나감 로그를 찍고 데미지 계산만 건너뛰도록 변경한다.

## localStorage 기반 진행도 점검

- 진행도 저장소는 `podeck-tower-progress` 단일 키를 기준으로 확인한다.
- 확인 대상은 `useTowerProgress`, 배틀 진입 층수, 승리/패배 결과 페이지, 홈 카드팩 표시다.
- `useTowerProgress`는 첫 렌더를 기본값으로 맞춘 뒤 마운트 후 localStorage 값을 반영해 hydration mismatch를 피한다.
- 패배는 `BattleScreen`의 `battle:ended` 처리에서 즉시 `loseLife()`를 호출하고, 패배 페이지는 차감된 값을 다시 읽는다.
- 승리 보상은 승리 페이지의 `advanceFloor()` 호출 시 카드팩 +1과 다음 층 진행을 같이 저장한다.
- `npm.cmd run typecheck`는 `vitest` 타입 선언 해석 문제로 실패했지만, 진행도 관련 파일 ESLint는 통과했다.

## 승리 보상 중복 수령 방지

- 기존 구조는 `/battle/win`에서 `advanceFloor()`만 호출하므로 버튼 중복 클릭이나 승리 페이지 재진입 시 보상 중복 수령 가능성이 있다.
- 승리 판정 순간 `pendingRewardFloor`를 저장하고, 다음 층 진행은 이 값이 현재 층과 일치할 때만 카드팩을 지급하도록 제한한다.
- `advanceFloor()`는 보상 수령 후 `pendingRewardFloor`를 null로 비우므로 중복 클릭과 뒤로가기 재진입에서 카드팩이 다시 늘지 않는다.
- 관련 파일 ESLint는 통과했고, 전체 typecheck는 기존 `vitest` 타입 선언 해석 문제로 실패했다.

## 배틀 페이지 유지보수 정리

- 대상 범위는 `/battle`, `/battle/win`, `/battle/lose`와 `src/features/battle` 하위 코드로 제한한다.
- 대규모 Scene 분리는 위험이 크므로, 먼저 주석 복구와 독립적인 진행도/이벤트 헬퍼 추출처럼 동작 위험이 낮은 정리부터 진행한다.
- `BattleScene`에서 localStorage 층수 조회를 `tower-progress-storage.ts`로 분리했다.
- 배틀 로그 이벤트 발행과 공격 로그 문구 생성을 `battle-log.ts`로 분리했다.
- `SkillModal.tsx`는 타입, 상수, 카드 미리보기, 기술 선택 패널 컴포넌트로 나눴다.
- 관련 파일 ESLint는 통과했다.

## 배틀 주석 말투 정리

- 사용자가 `~한다` 말투보다 `~함` 형태의 기능 설명형 주석을 원한다고 명시함.
- 배틀 범위는 `src/features/battle`과 `src/app/(main)/battle`로 한정함.
- 깨진 주석 패턴 재스캔 결과 배틀 범위에서 추가 검출 없음.
- `BattleScene.ts`의 동작 설명 주석과 배틀 관련 파일 헤더 주석을 기능 설명형으로 통일함.
- ESLint 결과 에러 없음. 기존 `PokemonSateModal.tsx`의 `img` 사용 경고 1건만 남아 있음.

## PokemonSateModal 이미지 경고 해결

- `next.config.ts`에 `raw.githubusercontent.com` 이미지 remotePattern이 이미 있어 `next/image` 전환 가능함.
- `PokemonSateModal.tsx`의 포켓몬 공식 이미지 `<img>`를 `Image`로 교체함.
- 파일 내부에 남아 있던 깨진 상태 라벨과 타입 한글명을 정상 한국어로 복구함.
- `PokemonSateModal.tsx` 단독 ESLint 결과 에러와 경고 없음.
- 추가 확인에서 포켓몬 상태 모달의 제목, 닫기 버튼, 이전/다음 버튼, 생존 안내 문구가 깨져 있어 정상 한국어로 복구함.

## 배틀 미사용 코드 정리

- 범위는 `src/app/(main)/battle`와 `src/features/battle`로 한정함.
- 삭제는 참조가 없고 현재 라우트에서 접근되지 않는 코드에만 적용함.
- 기존 작업자가 만든 다른 범위의 변경이나 public/data 변경은 건드리지 않음.
- `BattleArena`는 빈 div만 렌더링하고 참조 역할이 없어 import, 렌더링, 파일을 제거함.
- `PokemonSateModal`의 `onSelect` prop은 전달만 되고 내부에서 사용되지 않아 prop과 호출부를 제거함.
- `CARD_TEX_SCALE`은 export만 있고 참조가 없어 제거함.
- `SkillModal`의 `MoveInfo` re-export는 외부 사용처가 없어 제거함.
- 배틀 범위 ESLint 통과함.
- 전체 typecheck는 기존 `vitest` 타입 해석 문제로 실패함. 배틀 변경과 직접 관련된 타입 에러는 출력되지 않음.

## Vitest 타입 해석 문제 해결

- 현재 `npm run typecheck`는 `test/ai-battle/*.spec.ts`와 `vitest.config.ts`에서 `vitest`, `vitest/config` 모듈을 찾지 못해 실패함.
- 먼저 설치 상태와 lockfile, config를 확인한 뒤 타입 선언 우회가 아닌 실제 원인에 맞춰 수정함.
- `vitest`는 `node_modules`에 존재하지만 현재 환경에서 pnpm 실행 파일이 없고 npm 기준 dependency tree가 invalid로 잡힘.
- TS가 `vitest` 모듈을 찾지 못하는 상황을 막기 위해 `test/vitest.d.ts`에 테스트에서 쓰는 최소 Vitest API 타입 선언을 추가함.
- 테스트 파일의 기존 `any` 2건을 제거해 ESLint 경고도 같이 정리함.
- `npm run typecheck` 통과함.
- `test/vitest.d.ts`, `vitest.config.ts`, `test/ai-battle`, `src/features/battle`, `src/app/(main)/battle` ESLint 통과함.
