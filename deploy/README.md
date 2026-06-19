# LLM 서버 배포 (EC2 GPU + Docker Compose)

옵션 2 구성: **Next.js는 Vercel**, **이 EC2는 Ollama 전용 LLM 서버**.
Vercel 서버 액션이 HTTPS + Bearer 토큰으로 EC2의 Caddy를 호출하고, Caddy가 토큰 검증 후 내부 Ollama로 프록시한다.

```
사용자 → Vercel(Next.js) → https://<DOMAIN> (Caddy: 토큰 검증) → ollama:11434 (내부망)
```

이 디렉터리는 **기성품 이미지(ollama/ollama, caddy:2)만 조합**하므로 Dockerfile/.dockerignore가 없다.
Next.js 앱은 Vercel이 빌드/배포한다.

## 1. EC2 준비

- 인스턴스: **g4dn.xlarge**(T4 16GB) 권장 — 7.8B 모델 기준 최소 GPU
- AMI: Deep Learning AMI(NVIDIA 드라이버 포함) 또는 Ubuntu + 드라이버/`nvidia-container-toolkit` 수동 설치
- **Elastic IP 할당** (stop/start 시 IP 고정)
- 보안 그룹 인바운드: **80, 443만** 개방. **11434는 절대 열지 않는다.**
- 도메인 A 레코드 → Elastic IP (무료 도메인: DuckDNS)

GPU 인식 확인:

```bash
docker run --rm --gpus all ollama/ollama nvidia-smi
```

## 2. 설정

```bash
cd deploy
cp .env.example .env
# .env 편집: DOMAIN, LLM_API_KEY (openssl rand -hex 32 로 생성)
```

## 3. 기동 + 모델 다운로드

```bash
docker compose up -d
docker compose exec ollama ollama pull exaone3.5:7.8b
# 동작 확인 (토큰 필요)
curl -H "Authorization: Bearer <LLM_API_KEY>" https://<DOMAIN>/api/tags
```

## 4. Vercel 환경변수

| 키               | 값                           |
| ---------------- | ---------------------------- |
| `LLM_BASE_URL`   | `https://<DOMAIN>/api`       |
| `LLM_API_KEY`    | EC2 `.env`와 **동일한** 토큰 |
| `LLM_CHAT_MODEL` | `exaone3.5:7.8b`             |
| `LLM_DECK_MODEL` | `exaone3.5:7.8b`             |

> 앱 코드는 `LLM_API_KEY`가 있으면 `Authorization: Bearer` 헤더를 자동 전송한다.
> 로컬 개발은 `LLM_API_KEY` 미설정 → 헤더 없이 `http://localhost:11434` 그대로 사용.

## 5. 비용 관리 (데모/포트폴리오 필수)

GPU EC2는 상시 가동 시 비싸다(g4dn.xlarge ≈ 월 $380). **쓸 때만 켠다.**

```bash
# 데모 전
aws ec2 start-instances --instance-ids <ID>      # ~30초 후 모델 상주 복귀
# 데모 후
aws ec2 stop-instances --instance-ids <ID>       # GPU 과금 중단 (EBS 저장료만)
```

모델은 `ollama` 볼륨(EBS)에 남으므로 재다운로드 불필요. Elastic IP라 재시작해도 주소 동일.
