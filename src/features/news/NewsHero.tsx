export default function NewsHero() {
  return (
    <section className="relative h-[250px] overflow-hidden bg-gradient-to-r from-[#444444] to-[#555555]">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-30 mix-blend-screen"
        style={{
          backgroundImage: "url('/images/shared/pokeball-frame.svg')",
          backgroundPosition: 'center',
          backgroundSize: '180px 180px',
        }}
      />
      <div className="relative z-10 flex h-full items-center justify-center">
        <h1 className="relative text-[34px] font-extrabold text-[var(--color-base-3)]">새소식</h1>
      </div>
    </section>
  );
}
