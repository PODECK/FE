import { HomeBgmController } from '@/features/home/HomeBgmController';

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <HomeBgmController />
      {children}
    </>
  );
}
