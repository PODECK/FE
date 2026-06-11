'use client';

import { CheckCircle2 } from 'lucide-react';
import { Toaster } from 'sonner';

export default function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-[var(--color-type-grass)]" strokeWidth={3} />,
      }}
      toastOptions={{
        classNames: {
          toast:
            '!min-h-[44px] !w-[min(calc(100vw-2rem),280px)] !rounded-[12px] !border-0 !bg-[var(--color-secondary-1)] !px-4 !py-3 !shadow-[0_10px_22px_rgba(0,0,0,0.14)]',
          title: '!text-sm !font-extrabold !leading-tight !text-white',
          icon: '!mr-2',
        },
      }}
    />
  );
}
