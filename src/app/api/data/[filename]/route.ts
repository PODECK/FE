// 배틀 데이터 JSON 파일을 안전하게 제공하는 API Route

import { readFile } from 'fs/promises';
import path from 'path';

import { NextResponse } from 'next/server';

const allowedDataFiles = new Set(['pokemon.json', 'moves.json', 'pokemon-moves.json']);

interface RouteContext {
  params: Promise<{
    filename: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext): Promise<NextResponse> {
  const { filename } = await context.params;

  if (!allowedDataFiles.has(filename)) {
    return NextResponse.json({ error: 'Data file not found' }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), 'data', filename);
  const file = await readFile(filePath, 'utf-8');
  const data = JSON.parse(file) as unknown;

  return NextResponse.json(data);
}
