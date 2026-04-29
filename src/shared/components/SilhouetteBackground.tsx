import Image from 'next/image';

type SilhouetteBackgroundProps = {
  className?: string; // 포켓볼 실루엣 이미지를 감싸는 위치 조정용 클래스
  imageClassName?: string; // 포켓볼 실루엣 이미지 자체의 크기/회전 조정용 클래스
  priority?: boolean; // true면 Next Image를 우선 로딩
};

export default function SilhouetteBackground({
  className = '',
  imageClassName = '',
  priority = false,
}: SilhouetteBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -right-70 -bottom-72 opacity-80 sm:-right-85 sm:-bottom-80 ${className}`}
    >
      <Image
        src="/images/silhouette.svg"
        alt=""
        width={800}
        height={800}
        className={`h-[700px] w-[700px] -rotate-45 sm:h-[1000px] sm:w-[1000px] ${imageClassName}`}
        priority={priority}
      />
    </div>
  );
}
