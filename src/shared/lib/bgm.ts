let audioContext: AudioContext | null = null;
let sourceNode: AudioBufferSourceNode | null = null;
let gainNode: GainNode | null = null;
let currentSrc: string | null = null;
let audioBuffer: AudioBuffer | null = null;

function getContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  return audioContext;
}

export const bgm = {
  async play(src: string, volume: number) {
    const ctx = getContext();

    // 오디오 컨텍스트가 멈춰있으면 재생
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    // 이미 재생 중이고 같은 파일이면 볼륨만 조절
    if (currentSrc === src && sourceNode) {
      gainNode?.gain.setValueAtTime(volume, ctx.currentTime);
      return;
    }

    // 기존 재생 중지
    this.stop();

    // 파일 로드
    const response = await fetch(src);
    const arrayBuffer = await response.arrayBuffer();
    audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    // 노드 연결: source -> gain -> destination
    gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.connect(ctx.destination);

    sourceNode = ctx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.loop = true;
    sourceNode.connect(gainNode);
    sourceNode.start();

    currentSrc = src;
  },

  stop() {
    sourceNode?.stop();
    sourceNode?.disconnect();
    gainNode?.disconnect();
    sourceNode = null;
    currentSrc = null;
  },

  volume(volume: number) {
    const ctx = getContext();
    gainNode?.gain.setValueAtTime(volume, ctx.currentTime);
  },

  mute(muted: boolean) {
    const ctx = getContext();
    gainNode?.gain.setValueAtTime(muted ? 0 : 1, ctx.currentTime);
  },

  pause() {
    audioContext?.suspend();
  },

  async resume() {
    await audioContext?.resume();
  },
};
