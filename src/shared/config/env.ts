// zod 설치 시 스키마 검증으로 교체 가능
export const env = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? '',
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  AUTH_SECRET: process.env.AUTH_SECRET ?? '',
};
