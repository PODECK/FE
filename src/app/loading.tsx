import LoadingBackground from '@/app/(main)/(start)/loading/LoadingBackground';
import LoadingProgress from '@/app/(main)/(start)/_components/LoadingProgress';

export default function Loading() {
  return (
    <LoadingBackground>
      <LoadingProgress progress={60} message="로딩 중..." />
    </LoadingBackground>
  );
}
