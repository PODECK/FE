// 포켓몬 카드 PNG를 public/images/pokemon-cards 에 사전 생성하는 빌드 스크립트

import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { POKEMON_CARD_LAYOUT } from '../src/shared/config/pokemon-card-layout.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'pokemon-cards');

const CARD_FONTS = {
  latin: "'Roboto', sans-serif",
  korean: "'Roboto', 'KoreanFont', sans-serif",
};

const CARD_W = POKEMON_CARD_LAYOUT.width;
const CARD_H = POKEMON_CARD_LAYOUT.height;
const TEX = POKEMON_CARD_LAYOUT.scale;
const SX = CARD_W / 255;
const SY = CARD_H / 355;

// Node.js 캔버스는 CSS 변수를 읽을 수 없어 hex 값을 직접 사용함.
// 색상 변경 시 globals.css의 --color-type-gradient-* 변수도 함께 수정 필요.
const typeGradients = {
  normal: { from: '#D4D0CB', to: '#7A7668' },
  fire: { from: '#FFBA88', to: '#C83010' },
  water: { from: '#90D0FF', to: '#1068C8' },
  electric: { from: '#FFEC70', to: '#C89800' },
  fairy: { from: '#FFD1E6', to: '#EE99AC' },
  grass: { from: '#A9E288', to: '#308400' },
  ice: { from: '#B8EEFF', to: '#18A0C0' },
  fighting: { from: '#FFB878', to: '#A83000' },
  poison: { from: '#DCB0E8', to: '#6A2090' },
  ground: { from: '#ECD888', to: '#906020' },
  flying: { from: '#CCDFFF', to: '#5878C8' },
  psychic: { from: '#FFC0C8', to: '#C02050' },
  bug: { from: '#D4E870', to: '#607020' },
  rock: { from: '#DDD8A8', to: '#807040' },
  ghost: { from: '#C0A8D0', to: '#482860' },
  dragon: { from: '#A8B0F0', to: '#2030A8' },
  dark: { from: '#9A8878', to: '#302020' },
  steel: { from: '#D4E0E8', to: '#4888A8' },
};

const typeBadgeColors = {
  normal: '#999',
  fire: '#FF612C',
  water: '#2992FF',
  electric: '#FFDB00',
  fairy: '#EE99AC',
  grass: '#42BF24',
  ice: '#42D8FF',
  fighting: '#FFA202',
  poison: '#994DCF',
  ground: '#AB7939',
  flying: '#95C9FF',
  psychic: '#FF637F',
  bug: '#9FA424',
  rock: '#BCB889',
  ghost: '#6E4570',
  dragon: '#5462D6',
  dark: '#4F4747',
  steel: '#6AAED3',
};

function registerFonts() {
  const robotoPath = path.join(ROOT, 'public/fonts/Roboto-VariableFont_wdth,wght.ttf');
  if (fs.existsSync(robotoPath)) {
    GlobalFonts.registerFromPath(robotoPath, 'Roboto');
  }

  // 한국어 폴백 — 브라우저 sans-serif 렌더링에 가까운 regular 우선, bold 차선
  const candidates = [
    'C:/Windows/Fonts/malgun.ttf',
    'C:/Windows/Fonts/malgunbd.ttf',
    '/System/Library/Fonts/AppleSDGothicNeo.ttc',
    '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc',
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      GlobalFonts.registerFromPath(p, 'KoreanFont');
      break;
    }
  }
}

async function loadImageSafe(src) {
  try {
    return await loadImage(src);
  } catch {
    return null;
  }
}

// SVG 파일을 resvg로 래스터화한 뒤 canvas 이미지로 반환
// @napi-rs/canvas는 <style> 태그 CSS를 지원하지 않아 resvg로 처리
async function loadSvgAsImage(svgPath, renderWidth) {
  try {
    const svgData = fs.readFileSync(svgPath);
    const resvg = new Resvg(svgData, {
      fitTo: { mode: 'width', value: renderWidth },
    });
    const pngBuffer = resvg.render().asPng();
    return await loadImage(pngBuffer);
  } catch {
    return null;
  }
}

// PreloadScene.ts의 clipRoundedRect와 동일
function clipRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

async function generateCard(dexId, pokemon, moveNames, badgeImages, watermarkImg) {
  const canvas = createCanvas(CARD_W * TEX, CARD_H * TEX);
  const ctx = canvas.getContext('2d');
  ctx.scale(TEX, TEX);

  const primaryType = pokemon.types[0];
  const { from, to } = typeGradients[primaryType] ?? { from: '#999', to: '#666' };
  const { header, watermark, ellipse, artwork, typePill, moveRow, cornerRadius } = POKEMON_CARD_LAYOUT;

  // 외곽 라운드 클리핑
  clipRoundedRect(ctx, 0, 0, CARD_W, CARD_H, cornerRadius * SX);
  ctx.clip();

  // 타입 그라디언트 배경
  const grad = ctx.createLinearGradient(0, 0, 0, CARD_H);
  grad.addColorStop(0, from);
  grad.addColorStop(1, to);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // 워터마크
  if (watermarkImg) {
    ctx.drawImage(watermarkImg, watermark.x * SX, watermark.y * SY, watermark.w * SX, watermark.h * SX);
  }

  // 흰색 타원
  ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.beginPath();
  ctx.ellipse(ellipse.cx * SX, ellipse.cy * SY, ellipse.rx * SX, ellipse.ry * SY, 0, 0, Math.PI * 2);
  ctx.fill();

  // 포켓몬 공식 아트워크
  const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexId}.png`;
  const spriteImg = await loadImageSafe(artworkUrl);
  if (spriteImg) {
    ctx.drawImage(spriteImg, artwork.x * SX, artwork.y * SY, artwork.w * SX, artwork.h * SX);
  }

  ctx.textBaseline = 'top';

  // 덱스 번호
  ctx.font = `bold ${Math.round(header.dexFontSize * SY)}px ${CARD_FONTS.latin}`;
  ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.textAlign = 'left';
  ctx.fillText(`#${dexId}`, header.dexX * SX, header.dexY * SY);

  // HP (최대 HP — 정적 표기)
  ctx.font = `bold ${Math.round(header.hpFontSize * SY)}px ${CARD_FONTS.latin}`;
  ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.textAlign = 'right';
  ctx.fillText(`HP ${pokemon.baseStats.hp}`, header.hpX * SX, header.hpY * SY);

  // 한국어 이름
  ctx.font = `bold ${Math.round(header.koNameFontSize * SY)}px ${CARD_FONTS.korean}`;
  ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.textAlign = 'left';
  ctx.fillText(pokemon.koName, header.koNameX * SX, header.koNameY * SY);

  // 영문 이름
  ctx.font = `bold ${Math.round(header.enNameFontSize * SY)}px ${CARD_FONTS.latin}`;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  const enName = pokemon.enName
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  ctx.fillText(enName, header.enNameX * SX, header.enNameY * SY);

  // 타입 뱃지 pill
  const types = pokemon.types;
  const pillW = typePill.w * SX;
  const pillH = typePill.h * SY;
  const pillXs = types.length === 1 ? [typePill.singleX * SX] : typePill.dualXs.map((x) => x * SX);

  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    const bx = pillXs[i] ?? typePill.singleX * SX;

    ctx.save();
    clipRoundedRect(ctx, bx, typePill.y * SY, pillW, pillH, pillH / 2);
    ctx.clip();
    ctx.fillStyle = typeBadgeColors[type] ?? '#888888';
    ctx.fillRect(bx, typePill.y * SY, pillW, pillH);
    ctx.restore();

    const badgeImg = badgeImages[type];
    if (badgeImg) {
      const iconSize = pillH * 0.75;
      ctx.drawImage(
        badgeImg,
        bx + (pillW - iconSize) / 2,
        typePill.y * SY + (pillH - iconSize) / 2,
        iconSize,
        iconSize,
      );
    }
  }

  // 기술 4개 행
  const dotR = moveRow.dotR * SX;
  const moveSize = Math.round(moveRow.fontSize * SY);
  const rowH = moveRow.h * SY;
  moveRow.ys.forEach((rowY, i) => {
    const name = moveNames[i];
    if (!name) return;
    const y = rowY * SY;

    ctx.save();
    clipRoundedRect(ctx, moveRow.x * SX, y, moveRow.w * SX, rowH, rowH / 2);
    ctx.clip();
    ctx.fillStyle = 'rgba(0,0,0,0.07)';
    ctx.fillRect(moveRow.x * SX, y, moveRow.w * SX, rowH);
    ctx.restore();

    ctx.beginPath();
    ctx.arc(moveRow.dot1X * SX, y + rowH / 2, dotR, 0, Math.PI * 2);
    ctx.fillStyle = to;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(moveRow.dot2X * SX, y + rowH / 2, dotR, 0, Math.PI * 2);
    ctx.fillStyle = '#D9D9D9';
    ctx.fill();

    ctx.font = `bold ${moveSize}px ${CARD_FONTS.korean}`;
    ctx.fillStyle = '#212121';
    ctx.textAlign = 'left';
    ctx.fillText(name, moveRow.textX * SX, y + moveRow.textY * SY);
  });

  return canvas.encode('png');
}

async function main() {
  const args = process.argv.slice(2);
  const forceRegen = args.includes('--force');
  const dexArg = args.find((arg) => arg.startsWith('--dex='));
  const targetDexIds = dexArg
    ?.replace('--dex=', '')
    .split(',')
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);

  console.log('포켓몬 카드 PNG 생성 시작 (1~4세대, 493종)');
  if (forceRegen) console.log('  --force: 기존 파일도 재생성');

  registerFonts();

  await fsPromises.mkdir(OUT_DIR, { recursive: true });

  const pokemonData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/pokemon.json'), 'utf-8'));
  const movesData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/moves.json'), 'utf-8'));
  const pokemonMovesData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/pokemon-moves.json'), 'utf-8'));

  // 타입 뱃지 SVG → PNG 래스터화 (Skia는 <style> CSS 미지원 → resvg 사용)
  process.stdout.write('타입 뱃지 로드... ');
  const badgeImages = {};
  for (const type of Object.keys(typeBadgeColors)) {
    const svgPath = path.join(ROOT, 'public', 'images', 'pokemon-types', `${type}.svg`);
    badgeImages[type] = await loadSvgAsImage(svgPath, 64);
  }
  console.log('완료');

  // 워터마크 로드
  const watermarkImg = await loadSvgAsImage(path.join(ROOT, 'public', 'sim.svg'), 420);

  const dexIds = Object.keys(pokemonData)
    .map(Number)
    .filter((dexId) => !targetDexIds || targetDexIds.includes(dexId))
    .sort((a, b) => a - b);

  let done = 0;
  let skipped = 0;
  let failed = 0;
  const BATCH = 4;

  for (let i = 0; i < dexIds.length; i += BATCH) {
    const batch = dexIds.slice(i, i + BATCH);

    await Promise.all(
      batch.map(async (dexId) => {
        const outPath = path.join(OUT_DIR, `${dexId}.png`);

        if (!forceRegen && fs.existsSync(outPath)) {
          skipped++;
          done++;
          return;
        }

        const pokemon = pokemonData[String(dexId)];
        if (!pokemon) {
          done++;
          return;
        }

        const moveIds = pokemonMovesData[String(dexId)] ?? [];
        const moveNames = moveIds.slice(0, 4).map((id) => movesData[id]?.koName ?? id);

        try {
          const png = await generateCard(dexId, pokemon, moveNames, badgeImages, watermarkImg);
          await fsPromises.writeFile(outPath, png);
          done++;
        } catch (err) {
          console.warn(`\n  경고: #${dexId} (${pokemon.koName}) 실패 — ${err.message}`);
          failed++;
          done++;
        }
      }),
    );

    process.stdout.write(`\r진행: ${done}/${dexIds.length} (실패: ${failed})`);
  }

  console.log(`\n\n완료.`);
  console.log(`  생성: ${done - skipped - failed}개`);
  if (skipped > 0) console.log(`  스킵(기존): ${skipped}개`);
  if (failed > 0) console.log(`  실패: ${failed}개`);
  console.log(`  저장 위치: public/images/pokemon-cards/`);
}

main().catch((err) => {
  console.error('오류:', err);
  process.exit(1);
});
