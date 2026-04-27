<p align="center">
  <img src="./public/images/podeck-logo.svg" alt="PODECK 로고" width="320" />
</p>

# PODECK Web

**포켓몬 덱 배틀 아레나 — 교육용 4주 팀 프론트엔드 (4인)**

## 🎴 PODECK : 수집하고, 덱을 짜고, 무한의 탑을 올라가세요

> **1~4세대 전국도감 기반 턴제 카드 배틀·수집 웹 게임**의 프론트엔드 저장소입니다. 닉네임으로 입장해 스타터를 고르고, 카드팩과 덱으로 **무한의 탑**을 공략합니다.

## 📌 PODECK는 이런 서비스예요

PODECK은  
**포켓몬을 수집·덱에 편성하고, AI와 턴제 배틀을 벌이며 탑을 클리어하는** 데스크톱 웹 게임입니다.

- 회원가입 없이 **닉네임·로컬 저장소** 기반으로 진행
- **도감·카드팩·덱 관리·배틀·무한의 탑** 5개 핵심 루프로 구성
- **비상업 교육·포트폴리오** 목적 (공식 IP 상업 런칭·공개 배포 비목표)

> “수집한 포켓몬으로 나만의 덱을 완성하고, 전략적으로 배틀하는 경험”

## 🙋 PODECK FE 팀 역할

| 역할             | 책임                                                |
| ---------------- | --------------------------------------------------- |
| Core Engineer    | 배틀 엔진, 상태 머신, Repository 인터페이스, 테스트 |
| UX Engineer      | 도감·카드팩·배틀 UI, 접근성                         |
| Infra Engineer   | Next.js 구조, LocalStorage 어댑터, CI/CD            |
| AI/Game Designer | AI 전략, 난이도 곡선, 진화·기술 매핑                |

## 🙋‍♀️ PODECK의 FE Developer를 소개합니다!

| <a href="https://github.com/intothehead"><img src="https://avatars.githubusercontent.com/u/215816930?s=120&v=4" width="120" alt="이중호" /></a> | <a href="https://github.com/seongjinss555"><img src="https://avatars.githubusercontent.com/u/144534443?s=120&v=4" width="120" alt="안성진" /></a> | <a href="https://github.com/0011810"><img src="https://avatars.githubusercontent.com/u/272086090?s=120&v=4" width="120" alt="조경화" /></a> | <a href="https://github.com/seongmin36"><img src="https://avatars.githubusercontent.com/u/202721995?s=120&v=4" width="120" alt="조성민" /></a> |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 이중호 (팀장)                                                                                                                                   | 안성진                                                                                                                                            | 조경화                                                                                                                                      | 조성민                                                                                                                                         |

## 💻 기술 스택

| **역할**        | **종류**                                                                                                                                                                                                                                                                                                                          | **선정 이유**                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Runtime/Routing | <img src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white">                                                                                                                                                                                                                       | RSC 기반으로 라우팅·렌더링 일원화, 파일 시스템 라우팅으로 팀 간 충돌 최소화   |
| UI              | <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black">                                                                                                                                                                                                                           | 컴포넌트 기반 UI, 복잡한 배틀·수집 화면 구성에 적합                           |
| Language        | <img src="https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white">                                                                                                                                                                                                                  | strict 모드로 도메인·엔진 타입 안정성 확보                                    |
| Styling         | <img src="https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"><br /><img src="https://img.shields.io/badge/clsx-000000?style=for-the-badge&logoColor=white"><br /><img src="https://img.shields.io/badge/tw--merge-000000?style=for-the-badge&logoColor=white">              | 유틸리티 기반으로 빠른 UI 반복, clsx·tw-merge로 조건부 클래스 충돌 방지       |
| Validation      | <img src="https://img.shields.io/badge/Zod_4-3E67B1?style=for-the-badge&logo=zod&logoColor=white">                                                                                                                                                                                                                                | 런타임 스키마로 폼·LocalStorage 저장 데이터 검증                              |
| State           | <img src="https://img.shields.io/badge/Zustand_5-433D3D?style=for-the-badge&logoColor=white">                                                                                                                                                                                                                                     | 전역 상태를 최소 보일러플레이트로 유지, 게임·배틀 스토어 단위 분리 예정       |
| Animation       | <img src="https://img.shields.io/badge/Framer_Motion_12-black?style=for-the-badge&logo=framer&logoColor=white">                                                                                                                                                                                                                   | 카드 등장·배틀 연출 선언형 작성 가능, CSS 트랜지션 대비 인터럽트 처리가 용이  |
| Persistence     | LocalStorage + Repository 패턴                                                                                                                                                                                                                                                                                                    | 회원가입 없는 MVP 저장소, 인터페이스 추상화로 추후 IndexedDB 등으로 교체 가능 |
| Formatting      | <img src="https://img.shields.io/badge/ESLint_9-4B32C3?style=for-the-badge&logo=eslint&logoColor=white"><br /><img src="https://img.shields.io/badge/Prettier_3-000000?style=for-the-badge&logo=prettier&logoColor=F7B93E"><br /><img src="https://img.shields.io/badge/lint--staged-000000?style=for-the-badge&logoColor=white"> | 커밋 시점에 자동 교정, CI와 로컬 환경 일치                                    |
| Package Manager | <img src="https://img.shields.io/badge/pnpm_10-F69220?style=for-the-badge&logo=pnpm&logoColor=white">                                                                                                                                                                                                                             | 엄격한 lockfile로 CI·로컬 환경 일치, node_modules 중복 설치 방지              |
| CI              | <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white">                                                                                                                                                                                                            | PR 시 typecheck·lint 품질 게이트 자동 실행                                    |
| Hosting (예정)  | <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white">                                                                                                                                                                                                                            | Next.js App Router와 통합 배포 환경 제공                                      |

**추가 예정:** React Hook Form, Howler.js(BGM), Vitest·Playwright, Storybook 등은 마일스톤에 맞춰 도입합니다.

## 🧩 Package Manager

- **pnpm** — Node 20+ 권장 (`.nvmrc` 등 팀 규칙이 있으면 맞춤)
- **버전 고정이 필요하면** 저장소 루트에서 Corepack 등으로 팀이 합의한 pnpm 메이저를 사용합니다.

```bash
pnpm install              # 의존성 설치
pnpm dev                  # 개발 서버
pnpm run build            # 프로덕션 빌드
pnpm run typecheck        # TypeScript 검사
pnpm run lint             # ESLint
pnpm run format           # Prettier 작성
pnpm run format:check     # Prettier 검사만
```

## 🔗 Git Convention

### Git Flow (예시)

- `main` : 배포·안정 브랜치
- `dev` / `develop` : 통합 개발 브랜치 (팀 규칙에 맞게 명칭 통일)
- `feat/*`, `fix/*` : 이슈·기능 단위 작업 브랜치

### Commit Message

- **형식:** `유형: 설명 (#이슈번호)` (이슈 없으면 번호 생략 가능)
- **유형 예:** `feat`, `fix`, `chore`, `docs`, `refactor`, `design`, `init` 등 팀 규칙에 맞게 유지

### Branch

- **형식 예:** `feat/issue-12/battle-hp-bar`

### PR

- PR 템플릿: `.github/pull_request_template.md` (또는 팀이 지정한 경로) 준수
- 리뷰·스쿼시 머지 규칙은 팀 합의에 따름

## 📂 프로젝트 구조 (현재)

```
📦 podeck (FE)
┣ 📂 .github
┃ ┣ 📂 workflows        # CI (예: typecheck, lint)
┃ ┗ 📜 pull_request_template.md
┣ 📂 public
┃ ┣ 📂 images           # podeck-logo, 실루엣 등
┃ ┗ 📂 fonts
┣ 📂 src
┃ ┣ 📂 app              # Next.js App Router
┃ ┃ ┣ 📂 (auth)         # login, signup 등
┃ ┃ ┣ 📂 (main)         # 메인 앱 셸
┃ ┃ ┃ ┣ 📂 (start)      # 랜딩·닉네임 등 (URL 그룹)
┃ ┃ ┃ ┣ 📜 layout.tsx
┃ ┃ ┃ ┗ 📂 [id]         # 동적 라우트 예시
┃ ┃ ┣ 📂 api            # Route Handlers
┃ ┃ ┣ 📜 layout.tsx
┃ ┃ ┣ 📜 globals.css
┃ ┃ ┣ 📜 error.tsx · loading.tsx · not-found.tsx
┃ ┣ 📂 components       # 도메인/기능 단위 컴포넌트 (예: start)
┃ ┣ 📂 shared           # 공용 UI 등
┃ ┣ 📂 hooks
┃ ┣ 📂 schemas          # Zod 스키마
┃ ┣ 📂 constants
┃ ┣ 📂 types
┃ ┣ 📂 config           # env 등
┃ ┣ 📂 lib · utils · styles  # 확장용
┃ ┗ ...
┣ 📜 package.json
┣ 📜 pnpm-lock.yaml
┣ 📜 tsconfig.json
┣ 📜 next.config.ts
┗ 📜 eslint.config.mjs
```

- `**app/(main)/(start)**` — 랜딩 전용 레이아웃·`/` 닉네임 진입 등 (추후 홈·게이트는 동일 URL 정책에 맞게 확장)
- `**components/start**` — 온보딩·닉네임 스텝 등
- `**shared**` — 여러 기능에서 쓰는 UI·유틸

_배틀 엔진·Repository 레이어 도입에 따라 `features/`, `engine/` 등으로 확장될 수 있습니다._
