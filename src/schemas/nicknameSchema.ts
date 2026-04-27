import { z } from 'zod';

export const nicknameSchema = z
  .string()
  .trim()
  .min(1, '닉네임을 입력해주세요')
  .min(2, '닉네임은 2자 이상이어야합니다')
  .max(12, '닉네임은 12자 이하여야합니다')
  .regex(/^[가-힣a-zA-Z0-9]+$/, '한글, 영문, 숫자만 사용할 수 있습니다.');

export type Nickname = z.infer<typeof nicknameSchema>;
