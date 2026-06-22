'use client';
// Unity WebGL 빌드를 로드하고 서버 전투 세션과 Unity 이벤트를 연결하는 화면

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { completeUnityBattle, getUnityBattleSession, markUnityIntroCompleted } from '../actions/unityBattleActions';

type UnityInstance = {
  SendMessage: (objectName: string, methodName: string, value?: string) => void;
  Quit?: () => Promise<void>;
};

type UnityEventDetail = {
  eventName: string;
  json: string;
};

type UnityBattlePayload = {
  battleSessionId?: string;
  player?: {
    currentFloor?: number;
  };
  floor?: {
    floor?: number;
    currentFloor?: number;
  };
};

declare global {
  interface Window {
    createUnityInstance?: (
      canvas: HTMLCanvasElement,
      config: Record<string, unknown>,
      onProgress?: (progress: number) => void,
    ) => Promise<UnityInstance>;
  }
}

const UNITY_LOADER_URL = process.env.NEXT_PUBLIC_UNITY_LOADER_URL ?? '/unity/Build/unity.loader.js';
const UNITY_DATA_URL = process.env.NEXT_PUBLIC_UNITY_DATA_URL ?? '/unity/Build/unity.data.gz';
const UNITY_FRAMEWORK_URL = process.env.NEXT_PUBLIC_UNITY_FRAMEWORK_URL ?? '/unity/Build/unity.framework.js.gz';
const UNITY_CODE_URL = process.env.NEXT_PUBLIC_UNITY_CODE_URL ?? '/unity/Build/unity.wasm.gz';
const UNITY_STREAMING_ASSETS_URL = process.env.NEXT_PUBLIC_UNITY_STREAMING_ASSETS_URL ?? '/unity/StreamingAssets';

let unityLoaderPromise: Promise<void> | null = null;

function loadUnityLoader() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.createUnityInstance) return Promise.resolve();
  if (unityLoaderPromise) return unityLoaderPromise;

  unityLoaderPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = UNITY_LOADER_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      unityLoaderPromise = null;
      script.remove();
      reject(new Error(`Unity loader를 불러오지 못했습니다. ${UNITY_LOADER_URL}`));
    };
    document.body.appendChild(script);
  });

  return unityLoaderPromise;
}

function parseEventJson(json: string) {
  if (!json) return {} as Record<string, unknown>;

  try {
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {} as Record<string, unknown>;
  }
}

function resolveCurrentFloor(payload: UnityBattlePayload | null, fallback = 1) {
  return payload?.floor?.floor ?? payload?.floor?.currentFloor ?? payload?.player?.currentFloor ?? fallback;
}

function toBoolean(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return false;
}

function toSafeNumber(value: unknown, fallback: number) {
  const numberValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

export default function UnityBattleScreen() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const unityRef = useRef<UnityInstance | null>(null);
  const payloadRef = useRef<UnityBattlePayload | null>(null);
  const completedResultKeysRef = useRef(new Set<string>());
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('전투 정보를 준비하는 중입니다.');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const applySessionToUnity = useCallback((payload: UnityBattlePayload) => {
    payloadRef.current = payload;
    unityRef.current?.SendMessage('WebGameSessionReceiver', 'ApplySessionJson', JSON.stringify(payload));
  }, []);

  const loadBattleScene = useCallback(() => {
    unityRef.current?.SendMessage('WebGameSessionReceiver', 'LoadGameTable');
  }, []);

  const loadSessionForFloor = useCallback(
    async (floor?: number, reloadGameTable = false) => {
      setStatusMessage('전투 정보를 갱신하는 중입니다.');
      const session = await getUnityBattleSession(floor);

      if (!session.ok || !session.payload) {
        setErrorMessage(session.message ?? '전투 정보를 불러오지 못했습니다.');
        return;
      }

      applySessionToUnity(session.payload);
      setStatusMessage('전투를 시작합니다.');

      if (reloadGameTable) loadBattleScene();
    },
    [applySessionToUnity, loadBattleScene],
  );

  useEffect(() => {
    let disposed = false;

    async function bootUnity() {
      try {
        const session = await getUnityBattleSession();
        if (!session.ok || !session.payload) {
          setErrorMessage(session.message ?? '전투 정보를 불러오지 못했습니다.');
          return;
        }

        payloadRef.current = session.payload;
        await loadUnityLoader();

        if (disposed || !canvasRef.current || !window.createUnityInstance) return;

        const unity = await window.createUnityInstance(
          canvasRef.current,
          {
            dataUrl: UNITY_DATA_URL,
            frameworkUrl: UNITY_FRAMEWORK_URL,
            codeUrl: UNITY_CODE_URL,
            streamingAssetsUrl: UNITY_STREAMING_ASSETS_URL,
            companyName: 'PODECK',
            productName: 'PODECK',
            productVersion: '1.0.0',
          },
          (progress) => setLoadingProgress(progress),
        );

        if (disposed) {
          await unity.Quit?.();
          return;
        }

        unityRef.current = unity;
        applySessionToUnity(session.payload);
        setStatusMessage('전투를 시작합니다.');
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unity 전투 화면을 불러오지 못했습니다.');
      }
    }

    void bootUnity();

    return () => {
      disposed = true;
      const unity = unityRef.current;
      unityRef.current = null;
      void unity?.Quit?.();
    };
  }, [applySessionToUnity]);

  useEffect(() => {
    const handleUnityEvent = (event: Event) => {
      const detail = (event as CustomEvent<UnityEventDetail>).detail;
      if (!detail?.eventName) return;

      const payload = parseEventJson(detail.json);

      if (detail.eventName === 'battleResult') {
        const floor = toSafeNumber(payload.floor, resolveCurrentFloor(payloadRef.current));
        const won = toBoolean(payload.won);
        const key = `${String(payload.battleSessionId ?? payloadRef.current?.battleSessionId ?? '')}:${floor}:${won}`;
        if (completedResultKeysRef.current.has(key)) return;
        completedResultKeysRef.current.add(key);

        void completeUnityBattle({
          battleSessionId: String(payload.battleSessionId ?? payloadRef.current?.battleSessionId ?? ''),
          floor,
          won,
          turnCount: toSafeNumber(payload.turnCount, 0),
        }).then((result) => {
          if (!result.ok) setErrorMessage(result.message ?? '전투 결과 저장에 실패했습니다.');
        });
        return;
      }

      if (detail.eventName === 'introCompleted') {
        void markUnityIntroCompleted().then((result) => {
          if (!result.ok) setErrorMessage(result.message ?? '인트로 진행 상태 저장에 실패했습니다.');
        });
        return;
      }

      if (detail.eventName === 'homeRequested') {
        router.push('/home');
        return;
      }

      if (detail.eventName === 'retryRequested') {
        const floor = resolveCurrentFloor(payloadRef.current);
        void loadSessionForFloor(floor, true);
        return;
      }

      if (detail.eventName === 'nextFloorRequested') {
        const nextFloor = toSafeNumber(payload.nextFloor, resolveCurrentFloor(payloadRef.current) + 1);
        void loadSessionForFloor(nextFloor, true);
      }
    };

    window.addEventListener('podeck:unity-event', handleUnityEvent);
    return () => window.removeEventListener('podeck:unity-event', handleUnityEvent);
  }, [loadSessionForFloor, router]);

  return (
    <main className="fixed inset-0 overflow-hidden bg-black">
      <canvas ref={canvasRef} id="unity-canvas" className="h-full w-full" tabIndex={-1} />

      {loadingProgress < 1 && !errorMessage && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black text-white">
          <div className="w-[min(360px,80vw)] text-center">
            <p className="font-['NeoDunggeunmo'] text-lg">{statusMessage}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full bg-white transition-[width]"
                style={{ width: `${Math.round(loadingProgress * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-white/60">{Math.round(loadingProgress * 100)}%</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-6 text-white">
          <div className="max-w-md rounded-xl border border-white/10 bg-zinc-950 p-6 text-center shadow-2xl">
            <p className="font-['NeoDunggeunmo'] text-xl">전투를 시작할 수 없습니다.</p>
            <p className="mt-3 text-sm text-white/70">{errorMessage}</p>
            <button
              type="button"
              onClick={() => router.push('/home')}
              className="mt-5 rounded-lg bg-white px-5 py-2 text-sm font-bold text-black"
            >
              홈으로
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
