'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface DialogBoxProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  isShowIndicator?: boolean;
}

export default function DialogBox({
  children,
  className = '',
  contentClassName = '',
  isShowIndicator = true,
}: DialogBoxProps) {
  return (
    // 불투명 배경 블럭과 위로 올라오는 배경 블럭
    <div className={`relative w-full ${className}`}>
      <div className="absolute -inset-2 rounded-[20px] bg-[var(--color-secondary-2)] opacity-30" />
      <div
        className={`relative overflow-hidden rounded-[13px] border border-white bg-[var(--color-secondary-2)] p-6 ${contentClassName}`}
      >
        {children}
        {isShowIndicator && (
          <motion.div
            aria-hidden="true"
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="pointer-events--none absolute right-5 bottom-4 h-0 w-0 border-x-[8px] border-t-[13px] border-x-transparent border-t-[#FBBF24]"
          /> // 깜빡이는 역삼각형
        )}
      </div>
    </div>
  );
}
