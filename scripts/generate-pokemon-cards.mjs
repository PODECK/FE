// 포켓몬 카드 PNG를 public/images/pokemon-cards 에 사전 생성하는 빌드 스크립트

import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'images', 'pokemon-cards');

// config.ts 기준 카드 치수
const CARD_W = 140;
const CARD_H = 200;
const TEX = 2;
const SX = CARD_W / 255;
const SY = CARD_H / 355;

// type-colors.ts 인라인
const typeGradients = {
  normal: { from: '#D4D0CB', to: '#7A7668' },
  fire: { from: '#FFBA88', to: '#C83010' },
  water: { from: '#90D0FF', to: '#1068C8' },
  electric: { from: '#FFEC70', to: '#C89800' },
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
  normal: '#9DA2A4',
  fire: '#FF6C31',
  water: '#4590F0',
  electric: '#F0D030',
  grass: '#42BF24',
  ice: '#74CEC0',
  fighting: '#C03028',
  poison: '#994DCF',
  ground: '#E0C068',
  flying: '#89B1F5',
  psychic: '#FF519B',
  bug: '#90C127',
  rock: '#B8A038',
  ghost: '#735898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
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
  // 숫자·영문(덱스번호, HP, 영문이름): Roboto 전용
  const FONT_LATIN = "'Roboto', sans-serif";
  // 한국어(포켓몬명, 기술명): SkillModal과 동일한 폴백 체계
  const FONT_KOREAN = "'Roboto', 'KoreanFont', sans-serif";

  // 외곽 라운드 클리핑
  clipRoundedRect(ctx, 0, 0, CARD_W, CARD_H, 12 * SX);
  ctx.clip();

  // 타입 그라디언트 배경
  const grad = ctx.createLinearGradient(0, 0, 0, CARD_H);
  grad.addColorStop(0, from);
  grad.addColorStop(1, to);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // 워터마크 (sim.svg)
  if (watermarkImg) {
    ctx.drawImage(watermarkImg, 78 * SX, -24 * SY, 210 * SX, 210 * SX);
  }

  // 흰색 타원
  ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.beginPath();
  ctx.ellipse(121.5 * SX, 306.5 * SY, 205.5 * SX, 159.5 * SY, 0, 0, Math.PI * 2);
  ctx.fill();

  // 포켓몬 공식 아트워크
  const artworkUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexId}.png`;
  const spriteImg = await loadImageSafe(artworkUrl);
  if (spriteImg) {
    ctx.drawImage(spriteImg, 50 * SX, 60 * SY, 144 * SX, 144 * SX);
  }

  ctx.textBaseline = 'top';

  // 덱스 번호
  ctx.font = `bold ${Math.round(14 * SY)}px ${FONT_LATIN}`;
  ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.textAlign = 'left';
  ctx.fillText(`#${dexId}`, 23 * SX, 12 * SY);

  // HP (최대 HP — 정적 표기)
  ctx.font = `bold ${Math.round(14 * SY)}px ${FONT_LATIN}`;
  ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.textAlign = 'right';
  ctx.fillText(`HP ${pokemon.baseStats.hp}`, 230 * SX, 17 * SY);

  // 한국어 이름
  ctx.font = `bold ${Math.round(24 * SY)}px ${FONT_KOREAN}`;
  ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.textAlign = 'left';
  ctx.fillText(pokemon.koName, 23 * SX, 39 * SY);

  // 영문 이름
  ctx.font = `bold ${Math.round(13 * SY)}px ${FONT_LATIN}`;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  const enName = pokemon.enName
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  ctx.fillText(enName, 25 * SX, 63 * SY);

  // 타입 뱃지 pill
  const types = pokemon.types;
  const pillW = 100 * SX;
  const pillH = 22 * SY;
  const pillXs = types.length === 1 ? [77.5 * SX] : [23 * SX, 128 * SX];

  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    const bx = pillXs[i] ?? 77.5 * SX;

    ctx.save();
    clipRoundedRect(ctx, bx, 207 * SY, pillW, pillH, pillH / 2);
    ctx.clip();
    ctx.fillStyle = typeBadgeColors[type] ?? '#888888';
    ctx.fillRect(bx, 207 * SY, pillW, pillH);
    ctx.restore();

    const badgeImg = badgeImages[type];
    if (badgeImg) {
      const iconSize = pillH * 0.75;
      ctx.drawImage(badgeImg, bx + (pillW - iconSize) / 2, 207 * SY + (pillH - iconSize) / 2, iconSize, iconSize);
    }
  }

  // 기술 4개 행
  const dotR = 5 * SX;
  const moveSize = Math.round(11 * SY);
  [242, 265, 288, 311].forEach((rowY, i) => {
    const name = moveNames[i];
    if (!name) return;
    const y = rowY * SY;
    const rowH = 20 * SY;

    ctx.save();
    clipRoundedRect(ctx, 23 * SX, y, 205 * SX, rowH, rowH / 2);
    ctx.clip();
    ctx.fillStyle = 'rgba(0,0,0,0.07)';
    ctx.fillRect(23 * SX, y, 205 * SX, rowH);
    ctx.restore();

    ctx.beginPath();
    ctx.arc(33 * SX, y + rowH / 2, dotR, 0, Math.PI * 2);
    ctx.fillStyle = to;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(45 * SX, y + rowH / 2, dotR, 0, Math.PI * 2);
    ctx.fillStyle = '#D9D9D9';
    ctx.fill();

    ctx.font = `bold ${moveSize}px ${FONT_KOREAN}`;
    ctx.fillStyle = '#212121';
    ctx.textAlign = 'left';
    ctx.fillText(name, 90 * SX, y + 5 * SY);
  });

  return canvas.encode('png');
}

async function main() {
  const args = process.argv.slice(2);
  const forceRegen = args.includes('--force');

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

  // 워터마크 로드 (sim.svg — 복잡한 SVG, resvg로 래스터화)
  const watermarkImg = await loadSvgAsImage(path.join(ROOT, 'public', 'sim.svg'), 420);

  const dexIds = Object.keys(pokemonData)
    .map(Number)
    .sort((a, b) => a - b);

  let done = 0;
  let skipped = 0;
  let failed = 0;
  const BATCH = 8;

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
