import { cn } from '@/shared/lib/cn';

interface TooltipProps {
  children?: React.ReactNode;
  text: string;
  className?: string;
}

export default function Tooltip({ children, text, className }: TooltipProps) {
  const bubble = (
    <span
      role="tooltip"
      className={cn(
        'bg-secondary-1 relative rounded-md px-2 py-1 text-xs font-extrabold whitespace-nowrap text-[var(--color-base-3)] shadow-md',
        className,
      )}
    >
      {text}
      <span
        aria-hidden
        className="border-t-secondary-1 absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 border-x-4 border-t-6 border-x-transparent"
      />
    </span>
  );

  if (!children) {
    return bubble;
  }

  return (
    <span className="relative">
      {bubble}
      {children}
    </span>
  );
}
