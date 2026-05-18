// Phaser 기반 카드 배틀 진행 Scene

import Phaser from 'phaser';
import { CARD_RENDER_SCALE, CARD_TEXTURE_H, CARD_TEXTURE_W, CARD_W, CARD_H } from '../config';
import { buildAiDeck } from '@/shared/temp-ai/deck-builder';
import { chooseForceSwap, chooseMove } from '@/shared/temp-ai/strategy';
import { createRng, generateSeed, damageRoll, chance } from '@/shared/lib/rng';
import { getFloorConfig } from '@/shared/config/tower-floors';
import { getTypeEffectiveness } from '../../../../../data/type-chart';
import { CachePokemonDataSource } from '../data-source';
import { calculateMoveDamage, calculateStruggleDamage } from '../battle-damage';
import { createAttackLogMessage, dispatchBattleLog, type BattleSide } from '../battle-log';
import { readStoredTowerFloor } from '../tower-progress-storage';
import {
  AI_CARD_COUNT,
  AI_CARD_SCALE_X,
  AI_CARD_SCALE_Y,
  ANIM,
  EASE,
  FAN_CFG,
  FIELD_CRYSTAL_GLOWS,
  HEALTH_BAR_GAP_BASE,
  HEALTH_BAR_H_BASE,
  HIT_MOTION,
  HIT_MOTION_THRESHOLDS,
  LERP,
  LIFT_MS_AFTER_FAINT,
  PLAYER_LEVEL,
  REF_H,
  REF_W,
  SCALE,
  ZONE_CFG,
} from '../battle-scene-constants';
import { REQUIRED_PLAYER_DECK_SIZE, readActivePlayerDeckDexIds } from '../player-deck-storage';
import type { Rng } from '@/shared/lib/rng';
import type { BattlePokemon, BattleMove } from '@/shared/types/pokemon';
import type { FloorConfig } from '@/shared/types/tower';
import type { CardData, FanPos, HitMotionLevel, TurnPhase, ZoneHealthBar } from '../battle-scene-types';

export class BattleScene extends Phaser.Scene {
  // 손패, 드롭존, 전투 상태를 Scene 생명주기 동안 유지함
  private battleFieldBg: Phaser.GameObjects.Image | null = null;
  private crystalGlows: Phaser.GameObjects.Ellipse[] = [];
  private hand: Phaser.GameObjects.Image[] = [];
  private dragCard: Phaser.GameObjects.Image | null = null;
  private dragTargetX = 0;
  private dragTargetY = 0;
  private lineupY = 0;
  private screenScale = 1;
  private zoneCardScaleLimit = 1;

  private drawX = 0;
  private drawY = 0;
  private fanCX = 0;
  private fanCY = 0;
  private fanBaseR = 0;
  private hoverLiftY = 0;
  private neighborShift = 0;

  private playerZone: Phaser.GameObjects.Zone | null = null;
  private playerZoneBg: Phaser.GameObjects.Graphics | null = null;
  private playerPlayedCard: Phaser.GameObjects.Image | null = null;

  private _opponentZone: Phaser.GameObjects.Zone | null = null;
  private _opponentPlayedCard: Phaser.GameObjects.Image | null = null;

  private playerHealthBar: ZoneHealthBar | null = null;
  private opponentHealthBar: ZoneHealthBar | null = null;

  private isModalOpen = false;
  private isHoverBlocked = false;

  private aiHand: Phaser.GameObjects.Image[] = [];
  private aiDrawX = 0;
  private aiDrawY = 0;
  private aiFanCX = 0;
  private aiFanCY = 0;
  private aiFanBaseR = 0;
  private aiLineupY = 0;

  private playerDeck: BattlePokemon[] = [];
  private playerDeckDexIds: number[] = [];
  private playerActiveIndex = -1;
  private aiDeck: BattlePokemon[] = [];
  private aiActiveIndex = 0;
  private turnPhase: TurnPhase = 'setup';
  private hasPlayerActedThisTurn = false;
  private queuedMoveIndex: number | null = null;
  private rng!: Rng;
  private floorConfig!: FloorConfig;

  private dispatchAiDeckStatus() {
    window.dispatchEvent(
      new CustomEvent('battle:ai-deck-status', {
        detail: this.aiDeck.map((p) => ({
          dexId: p.dexId,
          types: p.types,
          fainted: p.fainted,
        })),
      }),
    );
  }

  private dispatchPlayerDeckInvalid() {
    window.dispatchEvent(new CustomEvent('battle:player-deck-invalid'));
  }

  private readonly handleMoveSelected = (e: Event) => {
    const { moveIndex } = (e as CustomEvent<{ moveIndex: number }>).detail;
    if (this.isModalOpen) {
      this.queuedMoveIndex = moveIndex;
      return;
    }
    this.resolveTurn(moveIndex);
  };

  private readonly handleTurnEnded = () => {
    if (this.turnPhase !== 'player') return;
    if (!this.playerPlayedCard || !this._opponentPlayedCard) return;
    const playerPokemon = this.playerDeck[this.playerActiveIndex];
    const aiPokemon = this.aiDeck[this.aiActiveIndex];
    if (!playerPokemon || !aiPokemon || playerPokemon.fainted || aiPokemon.fainted) return;

    this.setTurnPhase('ai');
    this.time.delayedCall(ANIM.aiThink, () => this.resolveAiTurn());
  };

  private setTurnPhase(phase: TurnPhase) {
    this.turnPhase = phase;
    window.dispatchEvent(new CustomEvent('battle:turn-phase', { detail: { phase } }));
  }

  constructor() {
    super({ key: 'BattleScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.screenScale = Math.min(1, W / REF_W, H / REF_H);
    this.zoneCardScaleLimit = this.screenScale;

    this.drawX = W * 0.92;
    this.drawY = H * 0.83;
    this.fanCX = W * 0.5;
    this.fanCY = H * 1.55;
    this.fanBaseR = H * 0.65;
    this.hoverLiftY = H * 0.167;
    this.neighborShift = W * 0.047;

    this.lineupY = H * 0.72;

    this.aiDrawX = W * 0.08;
    this.aiDrawY = H * 0.1;
    this.aiFanCX = W * 0.5;
    this.aiFanCY = H * -0.65;
    this.aiFanBaseR = H * 0.65;
    this.aiLineupY = H * 0.15;

    this.createBattleFieldBackground(W, H);

    this.rng = createRng(generateSeed());

    this.floorConfig = getFloorConfig(readStoredTowerFloor());

    const dataSource = new CachePokemonDataSource(this.cache);
    try {
      this.aiDeck = buildAiDeck(this.floorConfig, this.rng, dataSource);
      this.dispatchAiDeckStatus();
    } catch (e) {
      console.warn('[BattleScene] AI deck build failed:', e);
    }
    try {
      this.playerDeckDexIds = readActivePlayerDeckDexIds();
      if (this.playerDeckDexIds.length !== REQUIRED_PLAYER_DECK_SIZE) {
        this.dispatchPlayerDeckInvalid();
        return;
      }

      this.playerDeck = this.playerDeckDexIds.map((dexId) => dataSource.getPokemon(dexId, PLAYER_LEVEL));
      if (this.playerDeck.length !== REQUIRED_PLAYER_DECK_SIZE) {
        this.dispatchPlayerDeckInvalid();
        return;
      }
    } catch (e) {
      console.warn('[BattleScene] Player deck build failed:', e);
      this.dispatchPlayerDeckInvalid();
      return;
    }

    this.createDropZones();
    this.drawInitialCards();
    this.drawAIInitialCards();

    this.scale.on('resize', this.handleResize, this);
    window.addEventListener('battle:move-selected', this.handleMoveSelected);
    window.addEventListener('battle:turn-ended', this.handleTurnEnded);
    this.setTurnPhase('setup');
  }

  shutdown() {
    window.removeEventListener('battle:move-selected', this.handleMoveSelected);
    window.removeEventListener('battle:turn-ended', this.handleTurnEnded);
  }

  private handleResize() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.screenScale = Math.min(1, W / REF_W, H / REF_H);

    this.drawX = W * 0.92;
    this.drawY = H * 0.83;
    this.fanCX = W * 0.5;
    this.fanCY = H * 1.55;
    this.fanBaseR = H * 0.65;
    this.hoverLiftY = H * 0.167;
    this.neighborShift = W * 0.047;
    this.lineupY = H * 0.72;

    this.aiDrawX = W * 0.08;
    this.aiDrawY = H * 0.1;
    this.aiFanCX = W * 0.5;
    this.aiFanCY = H * -0.65;
    this.aiFanBaseR = H * 0.65;
    this.aiLineupY = H * 0.15;

    this.resizeBattleFieldBackground(W, H);
    this.repositionDropZones(W, H);
    this.repositionHand();
    this.repositionAIHand();
  }

  private createBattleFieldBackground(W: number, H: number) {
    this.battleFieldBg = this.add
      .image(W / 2, H / 2, 'battle-field')
      .setDepth(-100)
      .setScrollFactor(0);
    this.resizeBattleFieldBackground(W, H);
    this.createFieldCrystalGlows();
    this.layoutFieldEffects();
  }

  private resizeBattleFieldBackground(W: number, H: number) {
    if (!this.battleFieldBg) return;

    const scale = Math.max(W / this.battleFieldBg.width, H / this.battleFieldBg.height);
    this.battleFieldBg.setPosition(W / 2, H / 2);
    this.battleFieldBg.setScale(scale);
    this.layoutFieldEffects();
  }

  private createFieldCrystalGlows() {
    if (this.crystalGlows.length > 0) return;

    this.crystalGlows = FIELD_CRYSTAL_GLOWS.map((point) => {
      const glow = this.add
        .ellipse(0, 0, 10, 10, 0x68d9ff, 0.2)
        .setDepth(-90)
        .setScrollFactor(0)
        .setBlendMode(Phaser.BlendModes.ADD);

      this.tweens.add({
        targets: glow,
        alpha: { from: 0.14, to: 0.62 },
        scaleX: { from: 0.82, to: 1.22 },
        scaleY: { from: 0.82, to: 1.22 },
        duration: 1450,
        delay: point.delay,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      return glow;
    });
  }

  private layoutFieldEffects() {
    const rect = this.getBattleFieldRenderRect();
    if (!rect) return;

    FIELD_CRYSTAL_GLOWS.forEach((point, index) => {
      const glow = this.crystalGlows[index];
      if (!glow) return;

      glow.setPosition(rect.left + rect.width * point.x, rect.top + rect.height * point.y);
      glow.setSize(rect.width * point.width, rect.height * point.height);
    });
  }

  private getBattleFieldRenderRect() {
    if (!this.battleFieldBg) return null;

    const width = this.battleFieldBg.width * this.battleFieldBg.scaleX;
    const height = this.battleFieldBg.height * this.battleFieldBg.scaleY;
    return {
      left: this.battleFieldBg.x - width / 2,
      top: this.battleFieldBg.y - height / 2,
      width,
      height,
    };
  }

  private getZoneCardScale() {
    return Math.min(this.screenScale, this.zoneCardScaleLimit);
  }

  private repositionDropZones(W: number, H: number) {
    const s = this.screenScale;
    const cardS = this.getZoneCardScale();
    const slotW = ZONE_CFG.width * s;
    const slotH = ZONE_CFG.height * s;
    const cx = W * 0.5;
    const playerZoneY = H * 0.5 + slotH / 2 + (ZONE_CFG.gap * s) / 2 - ZONE_CFG.playerOffset * s;
    const opponentZoneY = H * 0.315;

    this.playerZone?.setPosition(cx, playerZoneY);
    this.playerZone?.setSize(slotW, slotH);
    this._opponentZone?.setPosition(cx, opponentZoneY);
    this._opponentZone?.setSize(slotW, slotH);

    if (this.playerPlayedCard) {
      const py = playerZoneY + ZONE_CFG.cardOffsetY * s;
      const pScaleX = ZONE_CFG.cardScale * cardS;
      const pScaleY = ZONE_CFG.cardScale * ZONE_CFG.cardScaleY * cardS;
      this.playerPlayedCard.setPosition(cx, py);
      this.playerPlayedCard.setScale(pScaleX, pScaleY);
      const ps = this.playerPlayedCard.getData('zoneShadow') as Phaser.GameObjects.Image | undefined;
      if (ps) {
        ps.setPosition(cx + 6, py + 8);
        ps.setScale(pScaleX, pScaleY);
      }
      if (this.playerHealthBar) {
        const pHalfH = (CARD_TEXTURE_H / 2) * pScaleY;
        this.redrawHealthBar(this.playerHealthBar, cx, py + pHalfH + HEALTH_BAR_GAP_BASE * cardS, pScaleX);
      }
    }
    if (this._opponentPlayedCard) {
      const oy = opponentZoneY + ZONE_CFG.opponentCardOffsetY * s;
      const oScaleX = ZONE_CFG.cardScale * cardS;
      const oScaleY = ZONE_CFG.cardScale * ZONE_CFG.opponentCardScaleY * cardS;
      this._opponentPlayedCard.setPosition(cx, oy);
      this._opponentPlayedCard.setScale(oScaleX, oScaleY);
      const os = this._opponentPlayedCard.getData('zoneShadow') as Phaser.GameObjects.Image | undefined;
      if (os) {
        os.setPosition(cx + 4, oy + 5);
        os.setScale(oScaleX, oScaleY);
      }
      if (this.opponentHealthBar) {
        const oHalfH = (CARD_TEXTURE_H / 2) * oScaleY;
        this.redrawHealthBar(this.opponentHealthBar, cx, oy + oHalfH + HEALTH_BAR_GAP_BASE * cardS, oScaleX);
      }
    }
  }

  private repositionHand() {
    const total = this.hand.length;
    this.hand.forEach((card, i) => {
      const fanPos = this.calcFanPos(i, total);
      card.setData({ fanX: fanPos.x, fanY: fanPos.y, fanAngle: fanPos.angle });

      if (card.getData('isHovered') || card.getData('isDragging')) return;

      this.tweens.killTweensOf(card);
      this.tweens.add({
        targets: card,
        x: fanPos.x,
        y: fanPos.y,
        angle: fanPos.angle,
        duration: ANIM.rearrange,
        ease: EASE.rearrange,
        onComplete: () => this.addBreathAnimation(card, i),
      });
    });
  }

  update() {
    if (this.dragCard) {
      this.dragCard.x += (this.dragTargetX - this.dragCard.x) * LERP;
      this.dragCard.y += (this.dragTargetY - this.dragCard.y) * LERP;
      this.syncShadow(this.dragCard);
    }

    this.hand.forEach((card) => {
      if (!card.getData('isDragging')) this.syncShadow(card);
    });

    if (!this.dragCard) this.updateHover();
  }

  // 부채꼴 기준 좌표로 hover를 판정해 카드 부유 중 흔들림을 줄임
  private updateHover() {
    if (this.isModalOpen || this.isHoverBlocked) return;
    if (this.turnPhase === 'ai' || this.turnPhase === 'ended') return;
    const p = this.input.activePointer;
    let topCard: Phaser.GameObjects.Image | null = null;

    for (let i = this.hand.length - 1; i >= 0; i--) {
      const card = this.hand[i];
      if (card.getData('isPlayed') || card.getData('isDragging')) continue;
      const fanX = card.getData('fanX') as number | undefined;
      const fanY = card.getData('fanY') as number | undefined;
      if (fanX === undefined || fanY === undefined) continue;

      if (Math.abs(p.x - fanX) <= CARD_W / 2 && Math.abs(p.y - fanY) <= CARD_H / 2) {
        topCard = card;
        break;
      }
    }

    this.hand.forEach((card) => {
      if (card.getData('isPlayed') || card.getData('isDragging')) return;
      const isHovered = !!card.getData('isHovered');
      if (card === topCard && !isHovered) {
        this.onCardHover(card);
      } else if (card !== topCard && isHovered) {
        this.onCardHoverEnd(card);
      }
    });
  }

  // 플레이어 손패를 드로우 위치에서 라인업을 거쳐 부채꼴로 펼침
  private drawInitialCards() {
    const initialCards = this.createInitialCards();
    const total = initialCards.length;
    const stagger = 50;

    initialCards.forEach((cardData, i) => {
      this.time.delayedCall(i * stagger, () => {
        const card = this.add
          .image(this.drawX, this.drawY, cardData.texture)
          .setScale(SCALE.normal)
          .setDepth(10 + i)
          .setAngle(-10);
        this.createShadow(card);
        card.setData({ cardData, handIndex: i, depthIndex: i });
        this.hand.push(card);
        this.animateCardToLineup(card, i, total);
      });
    });

    this.time.delayedCall((total - 1) * stagger + ANIM.cardFly + 150, () => this.fanOutHand());
  }

  private createInitialCards(): CardData[] {
    return this.playerDeckDexIds.map((dexId, index) => ({
      id: `card${index + 1}`,
      texture: `card-${dexId}`,
      name: `pokemon-${dexId}`,
    }));
  }

  private calcLineupPos(index: number, total: number): { x: number; y: number } {
    const spacing = CARD_W + 20;
    const x = this.fanCX - ((total - 1) * spacing) / 2 + index * spacing;
    return { x, y: this.lineupY };
  }

  private animateCardToLineup(card: Phaser.GameObjects.Image, index: number, total: number) {
    const H = this.scale.height;
    const dest = this.calcLineupPos(index, total);
    const ctrlX = (this.drawX + dest.x) / 2;
    const ctrlY = Math.min(this.drawY, dest.y) - H * 0.2;
    const curve = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(this.drawX, this.drawY),
      new Phaser.Math.Vector2(ctrlX, ctrlY),
      new Phaser.Math.Vector2(dest.x, dest.y),
    );
    const t = { val: 0 };
    const vec = new Phaser.Math.Vector2();

    this.tweens.add({
      targets: t,
      val: 1,
      duration: ANIM.cardFly,
      ease: EASE.fly,
      onUpdate: () => {
        curve.getPoint(t.val, vec);
        card.setPosition(vec.x, vec.y);
      },
    });
    this.tweens.add({ targets: card, angle: 0, duration: ANIM.cardFly, ease: EASE.fly });
  }

  private fanOutHand() {
    const total = this.hand.length;
    this.hand.forEach((card, i) => {
      const fanPos = this.calcFanPos(i, total);
      card.setDepth(i);
      card.setData({ fanX: fanPos.x, fanY: fanPos.y, fanAngle: fanPos.angle, depthIndex: i });

      this.tweens.add({
        targets: card,
        x: fanPos.x,
        y: fanPos.y,
        angle: fanPos.angle,
        duration: ANIM.rearrange,
        ease: EASE.rearrange,
        onComplete: i === total - 1 ? () => this.onAllCardsDrawn() : undefined,
      });
    });
  }

  private onAllCardsDrawn() {
    this.hand.forEach((card, i) => {
      this.setupCardInteraction(card);
      this.addBreathAnimation(card, i);
    });
  }

  // AI 손패를 뒷면 카드로 보관하고 필요할 때 활성 카드만 앞면으로 전환함
  private drawAIInitialCards() {
    const total = AI_CARD_COUNT;
    const stagger = 50;

    for (let i = 0; i < total; i++) {
      this.time.delayedCall(i * stagger, () => {
        const card = this.add
          .image(this.aiDrawX, this.aiDrawY, 'aiCardBack')
          .setScale(AI_CARD_SCALE_X, AI_CARD_SCALE_Y)
          .setDepth(10 + i)
          .setAngle(-10);
        card.setData({ handIndex: i, depthIndex: i });
        this.aiHand.push(card);
        this.animateAICardToLineup(card, i, total);
      });
    }

    this.time.delayedCall((total - 1) * stagger + ANIM.cardFly + 150, () => this.fanOutAIHand());
  }

  private calcAILineupPos(index: number, total: number): { x: number; y: number } {
    const spacing = CARD_W + 20;
    const x = this.aiFanCX - ((total - 1) * spacing) / 2 + index * spacing;
    return { x, y: this.aiLineupY };
  }

  private animateAICardToLineup(card: Phaser.GameObjects.Image, index: number, total: number) {
    const dest = this.calcAILineupPos(index, total);
    const ctrlX = (this.aiDrawX + dest.x) / 2;
    const ctrlY = (this.aiDrawY + dest.y) / 2 + this.scale.height * 0.1;
    const curve = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(this.aiDrawX, this.aiDrawY),
      new Phaser.Math.Vector2(ctrlX, ctrlY),
      new Phaser.Math.Vector2(dest.x, dest.y),
    );
    const t = { val: 0 };
    const vec = new Phaser.Math.Vector2();

    this.tweens.add({
      targets: t,
      val: 1,
      duration: ANIM.cardFly,
      ease: EASE.fly,
      onUpdate: () => {
        curve.getPoint(t.val, vec);
        card.setPosition(vec.x, vec.y);
      },
    });
    this.tweens.add({ targets: card, angle: 0, duration: ANIM.cardFly, ease: EASE.fly });
  }

  private calcDynamicAIFan(total: number) {
    const totalAngle = Math.min(FAN_CFG.anglePerCard * (total - 1), FAN_CFG.maxAngle);
    const radius = this.aiFanBaseR - (total > 6 ? (total - 6) * 15 : 0);
    return { totalAngle, radius };
  }

  private calcAIFanPos(index: number, total: number): FanPos {
    if (total === 1) return { x: this.aiFanCX, y: this.aiFanCY + this.aiFanBaseR, angle: 0 };

    const { totalAngle, radius } = this.calcDynamicAIFan(total);
    const step = totalAngle / (total - 1);
    const deg = 90 - totalAngle / 2 + step * index;
    const rad = Phaser.Math.DegToRad(deg);

    return {
      x: this.aiFanCX + Math.cos(rad) * radius,
      y: this.aiFanCY + Math.sin(rad) * radius,
      angle: deg - 90,
    };
  }

  private fanOutAIHand() {
    const total = this.aiHand.length;
    this.aiHand.forEach((card, i) => {
      const fanPos = this.calcAIFanPos(i, total);
      card.setDepth(i);
      card.setData({ fanX: fanPos.x, fanY: fanPos.y, fanAngle: fanPos.angle, depthIndex: i });

      this.tweens.add({
        targets: card,
        x: fanPos.x,
        y: fanPos.y,
        angle: fanPos.angle,
        duration: ANIM.rearrange,
        ease: EASE.rearrange,
      });
    });
  }

  private placeActiveAiCard() {
    if (this.aiHand.length === 0 || this._opponentPlayedCard) return;

    const aiPokemon = this.aiDeck[this.aiActiveIndex];
    if (!aiPokemon) return;

    const textureKey = `card-${aiPokemon.dexId}`;
    if (this.textures.exists(textureKey)) {
      this.doAiPlaceCard();
      return;
    }

    this.load.image(textureKey, `/images/pokemon-cards/${aiPokemon.dexId}.png`);
    this.load.once('complete', () => this.doAiPlaceCard());
    this.load.start();
  }

  private doAiPlaceCard() {
    if (this.aiHand.length === 0 || this._opponentPlayedCard) return;

    const aiPokemon = this.aiDeck[this.aiActiveIndex];
    const card = this.aiHand.splice(0, 1)[0];
    this.rearrangeAIHand();

    if (aiPokemon && this.textures.exists(`card-${aiPokemon.dexId}`)) {
      card.setTexture(`card-${aiPokemon.dexId}`);

      card.setScale(SCALE.normal);
    }

    this.placeCardOnOpponentZone(card, aiPokemon);
  }

  private rearrangeAIHand() {
    const total = this.aiHand.length;
    this.aiHand.forEach((card, i) => {
      const fanPos = this.calcAIFanPos(i, total);
      card.setData({ fanX: fanPos.x, fanY: fanPos.y, fanAngle: fanPos.angle, depthIndex: i, handIndex: i });
      card.setDepth(i);
      this.tweens.killTweensOf(card);
      this.tweens.add({
        targets: card,
        x: fanPos.x,
        y: fanPos.y,
        angle: fanPos.angle,
        duration: ANIM.rearrange,
        ease: EASE.rearrange,
      });
    });
  }

  private repositionAIHand() {
    const total = this.aiHand.length;
    this.aiHand.forEach((card, i) => {
      const fanPos = this.calcAIFanPos(i, total);
      card.setData({ fanX: fanPos.x, fanY: fanPos.y, fanAngle: fanPos.angle });
      this.tweens.killTweensOf(card);
      this.tweens.add({
        targets: card,
        x: fanPos.x,
        y: fanPos.y,
        angle: fanPos.angle,
        duration: ANIM.rearrange,
        ease: EASE.rearrange,
      });
    });
  }

  private calcDynamicFan(total: number) {
    const totalAngle = Math.min(FAN_CFG.anglePerCard * (total - 1), FAN_CFG.maxAngle);
    const radius = this.fanBaseR - (total > 6 ? (total - 6) * 15 : 0);
    return { totalAngle, radius };
  }

  private calcFanPos(index: number, total: number): FanPos {
    if (total === 1) return { x: this.fanCX, y: this.fanCY - this.fanBaseR, angle: 0 };

    const { totalAngle, radius } = this.calcDynamicFan(total);
    const step = totalAngle / (total - 1);
    const deg = -90 - totalAngle / 2 + step * index;
    const rad = Phaser.Math.DegToRad(deg);

    return {
      x: this.fanCX + Math.cos(rad) * radius,
      y: this.fanCY + Math.sin(rad) * radius,
      angle: deg + 90,
    };
  }

  // 손패 카드의 hover와 drag 상태에 맞춰 그림자도 함께 이동함
  private createShadow(card: Phaser.GameObjects.Image) {
    const shadow = this.add
      .image(card.x + 5, card.y + 10, 'cardBack')
      .setTint(0x000000)
      .setAlpha(0.3)
      .setScale(SCALE.normal)
      .setDepth(card.depth - 0.5);

    card.setData('shadow', shadow);
  }

  private syncShadow(card: Phaser.GameObjects.Image) {
    const shadow = card.getData('shadow') as Phaser.GameObjects.Image | undefined;
    if (!shadow) return;

    const isDragging = !!card.getData('isDragging');
    const isHovered = !!card.getData('isHovered');
    const targetScale = isDragging ? SCALE.drag : isHovered ? SCALE.hover : SCALE.normal;
    const progress =
      targetScale === SCALE.normal
        ? 0
        : Phaser.Math.Clamp((card.scaleX - SCALE.normal) / (targetScale - SCALE.normal), 0, 1);
    const targetOx = isDragging ? 15 : isHovered ? 10 : 5;
    const targetOy = isDragging ? 20 : isHovered ? 20 : 10;
    const ox = Phaser.Math.Linear(5, targetOx, progress);
    const oy = Phaser.Math.Linear(10, targetOy, progress);
    const alpha = Phaser.Math.Linear(0.3, isDragging ? 0.5 : isHovered ? 0.4 : 0.3, progress);

    shadow.setPosition(card.x + ox, card.y + oy);
    shadow.setAngle(card.angle);
    shadow.setScale(card.scaleX, card.scaleY);
    shadow.setAlpha(alpha);
    shadow.setDepth(card.depth - 0.5);
  }

  // hover 또는 드래그 중인 카드에는 호흡 애니메이션을 새로 걸지 않음
  private addBreathAnimation(card: Phaser.GameObjects.Image, index: number) {
    if (card.getData('isHovered') || card.getData('isDragging') || card.getData('isPlayed')) {
      return;
    }

    const baseY = card.getData('fanY') as number;

    this.tweens.killTweensOf(card);

    this.tweens.add({
      targets: card,
      y: baseY - 3,
      duration: ANIM.breathe,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: index * 200,
    });
  }

  // 손패 카드 pointer 이벤트로 Scene 내부 상태만 변경함
  private setupCardInteraction(card: Phaser.GameObjects.Image) {
    card.setInteractive({ useHandCursor: true });
    this.input.setDraggable(card);

    card.on('dragstart', (p: Phaser.Input.Pointer) => {
      this.dragTargetX = p.x;
      this.dragTargetY = p.y - CARD_H / 2;
      this.onDragStart(card);
    });
    card.on('drag', (p: Phaser.Input.Pointer) => {
      this.dragTargetX = p.x;
      this.dragTargetY = p.y - CARD_H / 2;
      if (!this.playerPlayedCard) {
        this.highlightPlayerZone(this.isCardOverPlayerZone(card));
      }
    });
    card.on('dragend', () => this.onDragEnd(card));
  }

  private onCardHover(card: Phaser.GameObjects.Image) {
    if (card.getData('isDragging') || card.getData('isPlayed')) return;

    this.tweens.killTweensOf(card);

    card.setData('isHovered', true);
    card.setDepth(100);

    const targetX = card.getData('fanX') as number;
    const targetY = (card.getData('fanY') as number) - this.hoverLiftY;

    this.tweens.add({
      targets: card,
      x: targetX,
      y: targetY,
      angle: 0,
      scaleX: SCALE.hover,
      scaleY: SCALE.hover,
      duration: ANIM.hover,
      ease: 'Sine.easeOut',
    });

    this.shiftNeighborCards(card.getData('handIndex') as number);
  }

  private onCardHoverEnd(card: Phaser.GameObjects.Image) {
    if (card.getData('isDragging') || card.getData('isPlayed')) return;

    card.setData('isHovered', false);
    card.setDepth(card.getData('depthIndex') as number);

    const handIndex = card.getData('handIndex') as number;

    this.tweens.killTweensOf(card);

    this.tweens.add({
      targets: card,
      x: card.getData('fanX') as number,
      y: card.getData('fanY') as number,
      angle: card.getData('fanAngle') as number,
      scaleX: SCALE.normal,
      scaleY: SCALE.normal,
      duration: ANIM.return,
      ease: EASE.return,
      onComplete: () => this.addBreathAnimation(card, handIndex),
    });

    this.resetNeighborCards(handIndex);
  }

  private shiftNeighborCards(hoverIndex: number) {
    this.hand.forEach((card, i) => {
      if (i === hoverIndex || card.getData('isDragging') || card.getData('isHovered')) {
        return;
      }

      const dist = Math.abs(hoverIndex - i);
      const dir = i < hoverIndex ? -1 : 1;

      this.tweens.killTweensOf(card);

      this.tweens.add({
        targets: card,
        x: (card.getData('fanX') as number) + (this.neighborShift / dist) * dir,
        y: card.getData('fanY') as number,
        angle: card.getData('fanAngle') as number,
        scaleX: SCALE.normal,
        scaleY: SCALE.normal,
        duration: ANIM.hover,
        ease: EASE.rearrange,
      });
    });
  }

  private resetNeighborCards(hoverIndex: number) {
    this.hand.forEach((card, i) => {
      if (i === hoverIndex || card.getData('isDragging') || card.getData('isHovered')) {
        return;
      }

      const handIdx = card.getData('handIndex') as number;

      this.tweens.killTweensOf(card);

      this.tweens.add({
        targets: card,
        x: card.getData('fanX') as number,
        y: card.getData('fanY') as number,
        angle: card.getData('fanAngle') as number,
        scaleX: SCALE.normal,
        scaleY: SCALE.normal,
        duration: ANIM.rearrange,
        ease: EASE.rearrange,
        onComplete: () => this.addBreathAnimation(card, handIdx),
      });
    });
  }

  private onDragStart(card: Phaser.GameObjects.Image) {
    card.setData({ isDragging: true, isHovered: false });
    card.setDepth(200);
    this.dragCard = card;

    this.tweens.killTweensOf(card);

    this.tweens.add({
      targets: card,
      angle: 0,
      scaleX: SCALE.drag,
      scaleY: SCALE.drag,
      duration: ANIM.drag,
      ease: EASE.hover,
    });

    this.resetNeighborCards(card.getData('handIndex') as number);
  }

  private onDragEnd(card: Phaser.GameObjects.Image) {
    card.setData({ isDragging: false, isHovered: false });
    this.dragCard = null;
    this.highlightPlayerZone(false);

    const p = this.input.activePointer;
    card.setPosition(p.x, p.y - CARD_H / 2);

    this.syncShadow(card);

    if (!this.playerPlayedCard && this.isCardOverPlayerZone(card)) {
      this.placeCardOnZone(card);
    } else {
      this.returnCardToHand(card);
    }
  }

  private returnCardToHand(card: Phaser.GameObjects.Image) {
    const handIdx = card.getData('handIndex') as number;

    this.tweens.killTweensOf(card);

    this.tweens.add({
      targets: card,
      x: card.getData('fanX') as number,
      y: card.getData('fanY') as number,
      angle: card.getData('fanAngle') as number,
      scaleX: SCALE.normal,
      scaleY: SCALE.normal,
      duration: ANIM.return,
      ease: EASE.return,
      onComplete: () => {
        card.setDepth(card.getData('depthIndex') as number);
        this.addBreathAnimation(card, handIdx);
      },
    });
  }

  // 플레이어 드롭존의 카드 배치 가능 영역과 하이라이트를 함께 담당함
  private createDropZones() {
    const W = this.scale.width;
    const H = this.scale.height;
    const s = this.screenScale;
    const slotW = ZONE_CFG.width * s;
    const slotH = ZONE_CFG.height * s;
    const cx = W * 0.5;

    const playerZoneY = H * 0.5 + slotH / 2 + (ZONE_CFG.gap * s) / 2 - ZONE_CFG.playerOffset * s;
    const opponentZoneY = H * 0.315;

    this._opponentZone = this.add.zone(cx, opponentZoneY, slotW, slotH);
    this.playerZone = this.add.zone(cx, playerZoneY, slotW, slotH);
  }

  private highlightPlayerZone(active: boolean) {
    if (!this.playerZoneBg || !this.playerZone) return;
    const { x, y, width, height } = this.playerZone;
    this.playerZoneBg.clear();
    this.playerZoneBg.fillStyle(0x44aaff, active ? 0.22 : 0.08);
    this.playerZoneBg.fillRoundedRect(x - width / 2, y - height / 2, width, height, 10);
    this.playerZoneBg.lineStyle(2, 0x44aaff, active ? 0.9 : 0.45);
    this.playerZoneBg.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 10);
  }

  // 실제 Zone보다 여유 있는 영역으로 드래그 종료 오차를 줄임
  private isCardOverPlayerZone(card: Phaser.GameObjects.Image): boolean {
    if (!this.playerZone) return false;
    const s = this.screenScale;
    const pad = 80;
    const zX = this.playerZone.x;
    const zY = this.playerZone.y;
    const zHW = (ZONE_CFG.width * s) / 2 + pad;
    const zHH = (ZONE_CFG.height * s) / 2 + pad;
    return (
      card.x + CARD_W / 2 > zX - zHW &&
      card.x - CARD_W / 2 < zX + zHW &&
      card.y + CARD_H / 2 > zY - zHH &&
      card.y - CARD_H / 2 < zY + zHH
    );
  }

  // 처음 배치된 플레이어 카드만 전투용 활성 카드로 전환함
  private placeCardOnZone(card: Phaser.GameObjects.Image) {
    if (this.playerPlayedCard) return;
    if (!this.playerZone) return;

    this.playerPlayedCard = card;
    card.setData('isPlayed', true);
    this.dragCard = null;

    const cardData = card.getData('cardData') as CardData | undefined;
    if (cardData) {
      const dexId = parseInt(cardData.texture.replace('card-', ''));
      const idx = this.playerDeck.findIndex((p) => p.dexId === dexId);
      if (idx >= 0) this.playerActiveIndex = idx;
    }

    const idx = this.hand.indexOf(card);
    if (idx !== -1) this.hand.splice(idx, 1);

    this.input.setDraggable(card, false);
    card.off('dragstart').off('drag').off('dragend');
    this.time.delayedCall(100, () => {
      card.on('pointerup', () => this.emitZoneCardClick(card));
    });

    const shadow = card.getData('shadow') as Phaser.GameObjects.Image | undefined;
    shadow?.destroy();
    card.setData('shadow', undefined);

    const targetX = this.playerZone.x;
    const targetY = this.playerZone.y + ZONE_CFG.cardOffsetY;

    this.tweens.killTweensOf(card);

    const s = this.getZoneCardScale();
    this.tweens.add({
      targets: card,
      x: targetX,
      y: targetY,
      angle: 0,
      scaleX: ZONE_CFG.cardScale * s,
      scaleY: ZONE_CFG.cardScale * ZONE_CFG.cardScaleY * s,
      duration: 180,
      ease: EASE.return,
      onComplete: () => {
        card.setDepth(10);
        this.highlightPlayerZone(false);
        this.createZoneShadow(card, 6, 8, 0.28);
        if (cardData) {
          const dexId = parseInt(cardData.texture.replace('card-', ''));
          const playerPokemon = this.playerDeck.find((p) => p.dexId === dexId);
          const fallbackHp = this.cache.json.get('pokemon-data')?.[String(dexId)]?.baseStats?.hp ?? 45;
          this.createZoneHealthBar(
            card,
            'player',
            playerPokemon?.currentHp ?? fallbackHp,
            playerPokemon?.maxHp ?? fallbackHp,
          );
        }
        this.placeActiveAiCard();
      },
    });

    this.rearrangeHand();
  }

  // AI 활성 카드를 손패에서 빼서 상대 드롭존에 고정함
  private placeCardOnOpponentZone(card: Phaser.GameObjects.Image, aiPokemon?: BattlePokemon) {
    if (this._opponentPlayedCard) return;
    if (!this._opponentZone) return;

    this._opponentPlayedCard = card;
    card.setData('isPlayed', true);

    const shadow = card.getData('shadow') as Phaser.GameObjects.Image | undefined;
    shadow?.destroy();
    card.setData('shadow', undefined);

    const targetX = this._opponentZone.x;
    const targetY = this._opponentZone.y + ZONE_CFG.opponentCardOffsetY;

    this.tweens.killTweensOf(card);

    const s = this.getZoneCardScale();
    const maxHp = aiPokemon?.maxHp ?? 100;
    const currentHp = aiPokemon?.currentHp ?? maxHp;

    card.setDepth(200);

    this.tweens.add({
      targets: card,
      x: targetX,
      y: targetY,
      angle: 0,
      scaleX: ZONE_CFG.cardScale * s,
      scaleY: ZONE_CFG.cardScale * ZONE_CFG.opponentCardScaleY * s,
      duration: ANIM.opponentPlace,
      ease: EASE.return,
      onComplete: () => {
        card.setDepth(10);
        this.createZoneShadow(card, 4, 5, 0.18);
        this.createZoneHealthBar(card, 'opponent', currentHp, maxHp);
        this.hasPlayerActedThisTurn = false;
        this.setTurnPhase('player');
      },
    });
  }

  // 필드 카드 클릭 시 React 기술 모달에 현재 HP와 PP 상태를 전달함
  private emitZoneCardClick(card: Phaser.GameObjects.Image) {
    if (!this._opponentPlayedCard) return;
    if (this.turnPhase !== 'player') return;

    const cardData = card.getData('cardData') as CardData;
    const dexId = parseInt(cardData.texture.replace('card-', ''));
    const pokemonData = this.cache.json.get('pokemon-data');
    const pokemon = pokemonData[String(dexId)];
    if (!pokemon) return;

    const playerPokemon = this.playerDeck[this.playerActiveIndex];
    const hp = playerPokemon?.currentHp ?? pokemon.baseStats.hp;
    const movesData = this.cache.json.get('moves-data');
    const pokemonMovesData = this.cache.json.get('pokemon-moves-data');
    const moveIds: string[] = pokemonMovesData[String(dexId)] ?? [];

    const moves = playerPokemon
      ? playerPokemon.moves.map((m) => ({
          koName: m.koName,
          power: m.power,
          accuracy: m.accuracy,
          pp: m.pp,
          maxPp: m.maxPp,
        }))
      : moveIds.slice(0, 4).map((id: string) => ({
          koName: movesData[id]?.koName ?? id,
          power: movesData[id]?.power ?? 0,
          accuracy: movesData[id]?.accuracy ?? 0,
          pp: movesData[id]?.pp ?? 0,
          maxPp: movesData[id]?.pp ?? 0,
        }));

    const FLIGHT_MS = 380;
    const baseX = card.x;
    const baseY = card.y;
    const baseScaleX = card.scaleX;
    const baseScaleY = card.scaleY;
    const baseDepth = card.depth;
    const zoneShadow = card.getData('zoneShadow') as Phaser.GameObjects.Image | undefined;
    const opponentZoneShadow = this._opponentPlayedCard?.getData('zoneShadow') as Phaser.GameObjects.Image | undefined;
    const opponentFadeTargets = [this._opponentPlayedCard, opponentZoneShadow].filter(
      (target): target is Phaser.GameObjects.Image => Boolean(target),
    );
    const opponentBaseAlphas = opponentFadeTargets.map((target) => target.alpha);

    this.isModalOpen = true;
    this.input.enabled = false;
    this.hand.forEach((c) => {
      this.tweens.killTweensOf(c);
      c.setData('isHovered', false);
    });

    window.dispatchEvent(
      new CustomEvent('battle:zone-card-click', {
        detail: {
          dexId,
          koName: pokemon.koName,
          enName: pokemon.enName,
          types: pokemon.types,
          hp,
          moves,
          flightDuration: FLIGHT_MS,
        },
      }),
    );

    if (zoneShadow) {
      this.tweens.add({ targets: zoneShadow, alpha: 0, duration: FLIGHT_MS * 0.5, ease: 'Linear' });
    }
    if (this.opponentHealthBar) {
      this.opponentHealthBar.g.setAlpha(0);
      this.opponentHealthBar.label.setAlpha(0);
    }
    if (this.playerHealthBar) {
      this.playerHealthBar.g.setAlpha(0);
      this.playerHealthBar.label.setAlpha(0);
    }
    if (opponentFadeTargets.length > 0) {
      this.tweens.add({ targets: opponentFadeTargets, alpha: 0, duration: FLIGHT_MS * 0.45, ease: 'Linear' });
    }

    const targetX = this.scale.width / 2;
    const targetY = this.scale.height * 0.32 + 209;

    card.setDepth(300);
    this.tweens.add({
      targets: card,
      x: targetX,
      y: targetY,
      scaleX: SCALE.modal,
      scaleY: SCALE.modal,
      duration: FLIGHT_MS,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.tweens.add({ targets: card, alpha: 0, duration: 220, ease: 'Linear' });
      },
    });

    const closeHandler = () => {
      this.tweens.killTweensOf(card);

      card.setPosition(targetX, targetY);
      card.setScale(SCALE.modal);
      card.setAngle(0);
      card.setAlpha(0);

      this.tweens.add({
        targets: card,
        alpha: 1,
        duration: 150,
        ease: 'Linear',
        onComplete: () => {
          this.tweens.add({
            targets: card,
            x: baseX,
            y: baseY,
            scaleX: baseScaleX,
            scaleY: baseScaleY,
            duration: 360,
            ease: 'Cubic.easeOut',
            onComplete: () => {
              if (zoneShadow) {
                zoneShadow.setAlpha(0);
                this.tweens.add({ targets: zoneShadow, alpha: 0.28, duration: 200, ease: 'Linear' });
              }
              opponentFadeTargets.forEach((target, index) => {
                this.tweens.killTweensOf(target);
                target.setAlpha(opponentBaseAlphas[index] ?? 1);
              });
              const currentOpponentShadow = this._opponentPlayedCard?.getData('zoneShadow') as
                | Phaser.GameObjects.Image
                | undefined;
              const currentOpponentTargets = [this._opponentPlayedCard, currentOpponentShadow].filter(
                (target): target is Phaser.GameObjects.Image => Boolean(target),
              );
              currentOpponentTargets.forEach((target, index) => {
                this.tweens.killTweensOf(target);
                target.setAlpha(index === 0 ? 1 : 0.18);
              });
              if (this.opponentHealthBar) {
                this.tweens.add({
                  targets: [this.opponentHealthBar.g, this.opponentHealthBar.label],
                  alpha: 1,
                  duration: 200,
                  ease: 'Linear',
                });
              }
              if (this.playerHealthBar) {
                this.tweens.add({
                  targets: [this.playerHealthBar.g, this.playerHealthBar.label],
                  alpha: 1,
                  duration: 200,
                  ease: 'Linear',
                });
              }
              this.isModalOpen = false;
              this.input.enabled = true;
              this.isHoverBlocked = true;
              card.setDepth(baseDepth);
              // 모달 오버레이 동안 activePointer가 낡은 위치에 머물 수 있어 실제 이동 전까지 hover를 막음
              let unblocked = false;
              const unblockHover = () => {
                if (unblocked) return;
                unblocked = true;
                this.isHoverBlocked = false;
                this.input.off('pointermove', unblockHover);
              };
              this.input.on('pointermove', unblockHover);
              this.time.delayedCall(600, unblockHover);
              this.hand.forEach((c, idx) => this.addBreathAnimation(c, idx));
              this.resolveQueuedMove();
            },
          });
        },
      });

      window.removeEventListener('battle:modal-close', closeHandler);
    };
    window.addEventListener('battle:modal-close', closeHandler);
  }

  private createZoneShadow(card: Phaser.GameObjects.Image, ox: number, oy: number, alpha: number) {
    const shadow = this.add
      .image(card.x + ox, card.y + oy, 'cardBack')
      .setTint(0x000000)
      .setAlpha(alpha)
      .setScale(card.scaleX, card.scaleY)
      .setAngle(card.angle)
      .setDepth(card.depth - 0.5);
    card.setData('zoneShadow', shadow);
    card.setData('zoneShadowOx', ox);
    card.setData('zoneShadowOy', oy);
  }

  private syncZoneShadow(card: Phaser.GameObjects.Image) {
    const shadow = card.getData('zoneShadow') as Phaser.GameObjects.Image | undefined;
    if (!shadow) return;
    const ox = (card.getData('zoneShadowOx') as number) ?? 5;
    const oy = (card.getData('zoneShadowOy') as number) ?? 8;
    shadow.setPosition(card.x + ox, card.y + oy);
    shadow.setScale(card.scaleX, card.scaleY);
  }

  // HP 바를 Phaser 그래픽 객체로 유지하고 리사이즈와 데미지에 맞춰 다시 그림
  private redrawHealthBar(bar: ZoneHealthBar, cx: number, cy: number, scale: number) {
    const logicalScale = scale / CARD_RENDER_SCALE;
    const w = CARD_TEXTURE_W * scale * 0.85;
    const h = Math.max(6, HEALTH_BAR_H_BASE * logicalScale);
    const r = h / 2;
    const ratio = Math.max(0, Math.min(1, bar.currentHp / bar.maxHp));

    bar.g.clear();

    bar.g.fillStyle(0x2d2d44, 1);
    bar.g.fillRoundedRect(cx - w / 2, cy, w, h, r);

    if (ratio > 0) {
      bar.g.fillStyle(0x22c55e, 1);
      bar.g.fillRoundedRect(cx - w / 2, cy, Math.max(h, w * ratio), h, r);
    }

    bar.label.setText(`HP ${bar.currentHp} / ${bar.maxHp}`);
    bar.label.setPosition(cx, cy + h + 4 * logicalScale);
  }

  // 드롭존 카드 아래에 현재 HP를 표시하는 전용 바를 생성함
  private createZoneHealthBar(
    card: Phaser.GameObjects.Image,
    side: 'player' | 'opponent',
    currentHp: number,
    maxHp: number,
  ) {
    const existing = side === 'player' ? this.playerHealthBar : this.opponentHealthBar;
    existing?.g.destroy();
    existing?.label.destroy();

    const s = this.getZoneCardScale();
    const cardHalfH = (CARD_TEXTURE_H / 2) * card.scaleY;
    const cy = card.y + cardHalfH + HEALTH_BAR_GAP_BASE * s;
    const depth = card.depth + 1;

    const g = this.add.graphics().setDepth(depth);
    const label = this.add
      .text(card.x, cy, '', {
        fontFamily: 'Roboto, Arial, sans-serif',
        fontSize: Math.max(10, Math.round(12 * s)),
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0)
      .setDepth(depth);

    const bar = { g, label, maxHp, currentHp: Math.max(0, Math.min(currentHp, maxHp)) };
    this.redrawHealthBar(bar, card.x, cy, ZONE_CFG.cardScale * s);

    if (side === 'player') this.playerHealthBar = bar;
    else this.opponentHealthBar = bar;
  }

  // 전투 로직에서 변경된 HP를 HP 바와 React HUD에 반영함
  setZoneHp(side: 'player' | 'opponent', hp: number) {
    const bar = side === 'player' ? this.playerHealthBar : this.opponentHealthBar;
    const card = side === 'player' ? this.playerPlayedCard : this._opponentPlayedCard;
    if (!bar || !card) return;
    bar.currentHp = Math.max(0, hp);
    const s = this.getZoneCardScale();
    const cardHalfH = (CARD_TEXTURE_H / 2) * card.scaleY;
    const cy = card.y + cardHalfH + HEALTH_BAR_GAP_BASE * s;
    this.redrawHealthBar(bar, card.x, cy, ZONE_CFG.cardScale * s);

    if (side === 'player') {
      const cardData = card.getData('cardData') as CardData | undefined;
      if (cardData) {
        const dexId = parseInt(cardData.texture.replace('card-', ''));
        window.dispatchEvent(
          new CustomEvent('battle:player-pokemon-hp-changed', {
            detail: { dexId, currentHp: bar.currentHp },
          }),
        );
      }
    }
  }

  // 기절한 카드를 진영 방향에 맞춰 화면 밖으로 퇴장시킴
  faintCard(side: 'player' | 'opponent') {
    const card = side === 'player' ? this.playerPlayedCard : this._opponentPlayedCard;
    const bar = side === 'player' ? this.playerHealthBar : this.opponentHealthBar;
    if (!card) return;

    const cardData = card.getData('cardData') as CardData | undefined;
    if (cardData) {
      const dexId = parseInt(cardData.texture.replace('card-', ''));
      window.dispatchEvent(new CustomEvent('battle:pokemon-fainted', { detail: { dexId } }));
    }

    const zoneShadow = card.getData('zoneShadow') as Phaser.GameObjects.Image | undefined;
    const flyDY = side === 'player' ? -this.scale.height * 0.65 : this.scale.height * 0.65;

    this.tweens.killTweensOf(card);

    const LIFT_MS = 160;
    const FLY_MS = 720;
    const FADE_MS = 500;

    const moveTargets: Phaser.GameObjects.GameObject[] = zoneShadow ? [card, zoneShadow] : [card];

    this.tweens.add({
      targets: moveTargets,
      y: '-=28',
      duration: LIFT_MS,
      ease: 'Sine.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: moveTargets,
          y: `+=${flyDY}`,
          duration: FLY_MS,
          ease: 'Cubic.easeIn',
          onComplete: () => {
            card.destroy();
            zoneShadow?.destroy();
            bar?.g.destroy();
            bar?.label.destroy();
            if (side === 'player') {
              this.playerPlayedCard = null;
              this.playerHealthBar = null;
            } else {
              this._opponentPlayedCard = null;
              this.opponentHealthBar = null;
            }
          },
        });

        this.tweens.add({ targets: moveTargets, alpha: 0, duration: FADE_MS, ease: 'Sine.easeIn' });

        if (bar) {
          this.tweens.add({ targets: [bar.g, bar.label], alpha: 0, duration: FADE_MS, ease: 'Linear' });
        }
      },
    });
  }

  // 기술 선택 이벤트를 모달 닫힘과 카드 복귀 이후 실제 턴 처리로 연결함
  private resolveQueuedMove() {
    if (this.queuedMoveIndex === null) return;

    const moveIndex = this.queuedMoveIndex;
    this.queuedMoveIndex = null;
    this.resolveTurn(moveIndex);
  }

  private getHitMotionLevel(move: BattleMove): HitMotionLevel {
    if (move.maxPp <= HIT_MOTION_THRESHOLDS.strong) return 'strong';
    if (move.maxPp <= HIT_MOTION_THRESHOLDS.normal) return 'normal';
    return 'basic';
  }

  // 전투 카드를 상대 카드 방향으로 돌진시킨 뒤 원위치로 복귀시킴
  private playHitMotion(side: 'player' | 'opponent', move: BattleMove, onComplete: () => void) {
    const attacker = side === 'player' ? this.playerPlayedCard : this._opponentPlayedCard;
    const defender = side === 'player' ? this._opponentPlayedCard : this.playerPlayedCard;
    if (!attacker || !defender) {
      onComplete();
      return;
    }

    const level = this.getHitMotionLevel(move);
    const cfg = HIT_MOTION[level];

    const originX = attacker.x;
    const originY = attacker.y;
    const originScaleX = attacker.scaleX;
    const originScaleY = attacker.scaleY;
    const defOriginX = defender.x;
    const defOriginY = defender.y;

    // 상대 카드 방향으로 돌진할 목표 지점 계산
    const rushX = originX + (defender.x - originX) * cfg.rushRatio;
    const rushY = originY + (defender.y - originY) * cfg.rushRatio;

    // 돌진 전 반대 방향으로 살짝 물러나 타격감 생성
    const windUpX = originX - (rushX - originX) * 0.15;
    const windUpY = originY - (rushY - originY) * 0.15;

    // 충돌 지점에 짧은 플래시 생성
    const flash = this.add
      .circle(rushX, rushY, CARD_W * this.screenScale * cfg.flashMult, 0xffffff, 0)
      .setDepth(defender.depth + 2);

    this.tweens.killTweensOf(attacker);
    this.tweens.killTweensOf(defender);

    // 1단계에서 살짝 물러나며 공격 준비 동작 생성
    this.tweens.add({
      targets: attacker,
      x: windUpX,
      y: windUpY,
      scaleX: originScaleX * cfg.liftScale,
      scaleY: originScaleY * cfg.liftScale,
      duration: cfg.liftMs,
      ease: 'Cubic.easeOut',
      onUpdate: () => this.syncZoneShadow(attacker),
      onComplete: () => {
        // 2단계에서 상대 카드 방향으로 가속 이동
        this.tweens.add({
          targets: attacker,
          x: rushX,
          y: rushY,
          scaleX: originScaleX,
          scaleY: originScaleY,
          duration: cfg.rushMs,
          ease: 'Cubic.easeIn',
          onUpdate: () => this.syncZoneShadow(attacker),
          onComplete: () => {
            // 3단계에서 충돌 플래시와 화면 흔들림 처리
            if (level === 'strong') this.playScreenShake(22 * this.screenScale, 55);
            else if (level === 'normal') this.playScreenShake(12 * this.screenScale, 45);

            flash.setAlpha(cfg.flashAlpha);
            this.tweens.add({
              targets: flash,
              alpha: 0,
              scale: cfg.flashEndScale,
              duration: cfg.returnMs,
              ease: 'Cubic.easeOut',
            });

            // 강한 공격에서는 손패에도 짧은 리플 전달
            if (level !== 'basic') {
              const rippleAmp = level === 'strong' ? 8 : 4;
              this.hand.forEach((c, i) => {
                if (c.getData('isPlayed') || c.getData('isDragging') || c.getData('isHovered')) return;
                const fanY = c.getData('fanY') as number | undefined;
                if (fanY === undefined) return;
                this.time.delayedCall(i * 30, () => {
                  this.tweens.killTweensOf(c);
                  this.tweens.add({
                    targets: c,
                    y: fanY - rippleAmp,
                    duration: 100,
                    ease: 'Sine.easeOut',
                    yoyo: true,
                    onComplete: () => this.addBreathAnimation(c, i),
                  });
                });
              });
            }

            // 4단계에서 공격 카드를 원래 위치로 복귀시킴
            this.time.delayedCall(40, () => {
              this.tweens.add({
                targets: attacker,
                x: originX,
                y: originY,
                scaleX: originScaleX,
                scaleY: originScaleY,
                duration: cfg.returnMs,
                ease: 'Back.easeOut',
                onUpdate: () => this.syncZoneShadow(attacker),
              });
            });

            // 피격 카드를 밀어낸 뒤 감쇠 진동으로 원위치 복귀
            const recoilDY = (defOriginY - originY) * 0.06;
            const ms = cfg.shakeDurationMs;
            this.tweens.add({
              targets: defender,
              y: defOriginY + recoilDY,
              duration: 70,
              ease: 'Cubic.easeOut',
              onUpdate: () => this.syncZoneShadow(defender),
              onComplete: () => {
                this.tweens.add({
                  targets: defender,
                  x: defOriginX + cfg.shake,
                  y: defOriginY,
                  duration: ms,
                  ease: 'Sine.easeOut',
                  onUpdate: () => this.syncZoneShadow(defender),
                  onComplete: () => {
                    this.tweens.add({
                      targets: defender,
                      x: defOriginX - cfg.shake * 0.55,
                      duration: ms,
                      ease: 'Sine.easeInOut',
                      onUpdate: () => this.syncZoneShadow(defender),
                      onComplete: () => {
                        this.tweens.add({
                          targets: defender,
                          x: defOriginX + cfg.shake * 0.25,
                          duration: ms * 0.8,
                          ease: 'Sine.easeInOut',
                          onUpdate: () => this.syncZoneShadow(defender),
                          onComplete: () => {
                            this.tweens.add({
                              targets: defender,
                              x: defOriginX,
                              duration: ms * 0.55,
                              ease: 'Sine.easeOut',
                              onUpdate: () => this.syncZoneShadow(defender),
                              onComplete: () => {
                                defender.setPosition(defOriginX, defOriginY);
                                this.syncZoneShadow(defender);
                                flash.destroy();
                                onComplete();
                              },
                            });
                          },
                        });
                      },
                    });
                  },
                });
              },
            });
          },
        });
      },
    });
  }

  // 카메라 랜덤 셰이크 대신 사인파 감쇠 진동으로 부드러운 화면 흔들림 구현
  private playScreenShake(amplitude: number, stepMs: number) {
    const cam = this.cameras.main;
    const baseX = cam.scrollX;
    const steps = [amplitude, -amplitude * 0.6, amplitude * 0.28, 0];
    const doStep = (idx: number) => {
      if (idx >= steps.length) {
        cam.setScroll(baseX, cam.scrollY);
        return;
      }
      this.tweens.add({
        targets: cam,
        scrollX: baseX + steps[idx],
        duration: idx === steps.length - 1 ? stepMs * 0.6 : stepMs,
        ease: 'Sine.easeInOut',
        onComplete: () => doStep(idx + 1),
      });
    };
    doStep(0);
  }

  // 플레이어 기술 사용과 데미지 처리
  private resolveTurn(playerMoveIndex: number) {
    if (this.turnPhase !== 'player') return;
    if (this.hasPlayerActedThisTurn) return;

    const playerPokemon = this.playerDeck[this.playerActiveIndex];
    const aiPokemon = this.aiDeck[this.aiActiveIndex];
    if (!playerPokemon || !aiPokemon || playerPokemon.fainted || aiPokemon.fainted) return;

    const playerMove = playerPokemon.moves[playerMoveIndex];
    if (!playerMove || playerMove.pp <= 0) return;

    this.hasPlayerActedThisTurn = true;

    playerMove.pp -= 1;
    this.playHitMotion('player', playerMove, () => {
      const playerHit = playerMove.accuracy === 0 || chance(this.rng, playerMove.accuracy / 100);
      if (!playerHit || playerMove.power <= 0) {
        this.dispatchAttackLog('player', playerPokemon, playerMove);
        if (!playerHit) this.dispatchBattleLog('공격이 빗나갔다.');
        return;
      }

      this.dispatchAttackLogs('player', playerPokemon, aiPokemon, playerMove);
      const dmg = this.calcDamage(playerPokemon, aiPokemon, playerMove);
      aiPokemon.currentHp = Math.max(0, aiPokemon.currentHp - dmg);
      this.setZoneHp('opponent', aiPokemon.currentHp);

      if (aiPokemon.currentHp <= 0) {
        aiPokemon.fainted = true;
        this.dispatchBattleLog(`${aiPokemon.koName}이 기절했다.`);
        this.setTurnPhase('setup');
        this.faintCard('opponent');
        this.dispatchAiDeckStatus();
        this.time.delayedCall(LIFT_MS_AFTER_FAINT, () => this.onAiFainted());
        return;
      }
    });
  }

  // AI가 선택한 기술 또는 버둥거리기로 플레이어에게 반격함
  private resolveAiTurn() {
    if (this.turnPhase !== 'ai') return;

    const playerPokemon = this.playerDeck[this.playerActiveIndex];
    const aiPokemon = this.aiDeck[this.aiActiveIndex];
    if (!playerPokemon || !aiPokemon || playerPokemon.fainted || aiPokemon.fainted) return;

    const aiMoveIndex = chooseMove(aiPokemon, playerPokemon, this.floorConfig.aiLevel, this.rng);
    if (aiMoveIndex < 0) {
      this.resolveAiStruggle(aiPokemon, playerPokemon);
      return;
    }

    const aiMove = aiPokemon.moves[aiMoveIndex];
    if (!aiMove || aiMove.pp <= 0) {
      this.returnToPlayerTurnAfterAiThink();
      return;
    }

    aiMove.pp -= 1;
    const aiHit = aiMove.accuracy === 0 || chance(this.rng, aiMove.accuracy / 100);
    if (!aiHit || aiMove.power <= 0) {
      this.dispatchAttackLog('opponent', aiPokemon, aiMove);
      this.returnToPlayerTurnAfterAiThink();
      return;
    }

    this.playHitMotion('opponent', aiMove, () => {
      this.dispatchAttackLogs('opponent', aiPokemon, playerPokemon, aiMove);
      const dmg = this.calcDamage(aiPokemon, playerPokemon, aiMove);
      playerPokemon.currentHp = Math.max(0, playerPokemon.currentHp - dmg);
      this.setZoneHp('player', playerPokemon.currentHp);

      if (playerPokemon.currentHp <= 0) {
        playerPokemon.fainted = true;
        this.dispatchBattleLog(`${playerPokemon.koName}이 기절했다.`);
        this.faintCard('player');
        this.time.delayedCall(LIFT_MS_AFTER_FAINT, () => this.onPlayerFainted());
        return;
      }

      this.returnToPlayerTurnAfterAiThink();
    });
  }

  private returnToPlayerTurnAfterAiThink() {
    this.time.delayedCall(ANIM.aiThink, () => {
      if (this.turnPhase !== 'ai') return;
      this.hasPlayerActedThisTurn = false;
      this.setTurnPhase('player');
    });
  }

  private calcDamage(attacker: BattlePokemon, defender: BattlePokemon, move: BattleMove): number {
    return calculateMoveDamage(attacker, defender, move, damageRoll(this.rng));
  }

  private dispatchBattleLog(message: string) {
    dispatchBattleLog(message);
  }

  private dispatchAttackLog(side: BattleSide, attacker: BattlePokemon, move: BattleMove) {
    this.dispatchBattleLog(createAttackLogMessage(side, attacker, move));
  }

  private dispatchAttackLogs(side: BattleSide, attacker: BattlePokemon, defender: BattlePokemon, move: BattleMove) {
    this.dispatchAttackLog(side, attacker, move);

    const effectiveness = getTypeEffectiveness(move.type, defender.types);
    if (effectiveness === 0) {
      this.dispatchBattleLog('효과가 없었다...');
      return;
    }
    if (effectiveness > 1) {
      this.dispatchBattleLog('효과가 굉장했다!');
      return;
    }
    if (effectiveness < 1) {
      this.dispatchBattleLog('효과가 미미했다...');
    }
  }

  // 모든 PP가 떨어진 AI의 버둥거리기 데미지와 반동 처리
  private resolveAiStruggle(aiPokemon: BattlePokemon, playerPokemon: BattlePokemon) {
    const dmg = this.calcStruggleDamage(aiPokemon, playerPokemon);
    playerPokemon.currentHp = Math.max(0, playerPokemon.currentHp - dmg);
    this.setZoneHp('player', playerPokemon.currentHp);

    const recoil = Math.max(1, Math.floor(aiPokemon.maxHp / 4));
    aiPokemon.currentHp = Math.max(0, aiPokemon.currentHp - recoil);
    this.setZoneHp('opponent', aiPokemon.currentHp);

    if (playerPokemon.currentHp <= 0) {
      playerPokemon.fainted = true;
      this.faintCard('player');
      this.time.delayedCall(LIFT_MS_AFTER_FAINT, () => this.onPlayerFainted());
      return;
    }

    if (aiPokemon.currentHp <= 0) {
      aiPokemon.fainted = true;
      this.faintCard('opponent');
      this.dispatchAiDeckStatus();
      this.time.delayedCall(LIFT_MS_AFTER_FAINT, () => this.onAiFainted());
      return;
    }

    this.returnToPlayerTurnAfterAiThink();
  }

  private calcStruggleDamage(attacker: BattlePokemon, defender: BattlePokemon): number {
    return calculateStruggleDamage(attacker, defender, damageRoll(this.rng));
  }

  // AI 활성 카드 기절 시 다음 생존 카드 탐색 및 배치
  private onAiFainted() {
    const nextIdx = chooseForceSwap(this.aiDeck, this.aiActiveIndex, this.rng);
    if (nextIdx < 0) {
      this.setTurnPhase('ended');
      window.dispatchEvent(new CustomEvent('battle:ended', { detail: { winner: 'player' } }));
      return;
    }
    this.aiActiveIndex = nextIdx;
    this.setTurnPhase('setup');
    this.time.delayedCall(1200, () => this.placeActiveAiCard());
  }

  // 플레이어가 더 이상 낼 카드가 없을 때 패배 이벤트 발생
  private onPlayerFainted() {
    const hasAvailablePokemon = this.playerDeck.some((p) => !p.fainted);
    if (!hasAvailablePokemon) {
      this.setTurnPhase('ended');
      window.dispatchEvent(new CustomEvent('battle:ended', { detail: { winner: 'enemy' } }));
      return;
    }

    this.hasPlayerActedThisTurn = false;
    this.setTurnPhase('player');
  }

  // 손패에서 빠진 카드 이후의 부채꼴 위치 재계산
  private rearrangeHand() {
    const total = this.hand.length;

    this.hand.forEach((card, i) => {
      const shadow = card.getData('shadow') as Phaser.GameObjects.Image;
      const fanPos = this.calcFanPos(i, total);

      card.setData({
        fanX: fanPos.x,
        fanY: fanPos.y,
        fanAngle: fanPos.angle,
        depthIndex: i,
        handIndex: i,
      });
      card.setDepth(i);
      shadow?.setDepth(i - 0.5);

      this.tweens.killTweensOf(card);

      this.tweens.add({
        targets: card,
        x: fanPos.x,
        y: fanPos.y,
        angle: fanPos.angle,
        scaleX: SCALE.normal,
        scaleY: SCALE.normal,
        duration: ANIM.rearrange,
        ease: EASE.rearrange,
        onComplete: () => this.addBreathAnimation(card, i),
      });
    });
  }
}
