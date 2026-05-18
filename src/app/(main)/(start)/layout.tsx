import { SoundSettingsDropdown } from '@/shared/components/SoundSettingsDropdown';

export default function StartLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="pointer-events-none fixed top-4 right-4 z-50 md:top-6 md:right-6">
        <div className="pointer-events-auto">
          <SoundSettingsDropdown theme="light" />
        </div>
      </div>
      {children}
    </>
  );
}
