import { HomeBgmController } from '@/app/(main)/home/_components/HomeBgmController';

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
