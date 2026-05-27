export function Particles({ count = 18 }: { count?: number }) {
  const items = Array.from({ length: count });
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {items.map((_, i) => {
        const size = 4 + Math.random() * 10;
        const left = Math.random() * 100;
        const delay = Math.random() * 14;
        const duration = 10 + Math.random() * 14;
        return (
          <span
            key={i}
            className="absolute rounded-full animate-float-up"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              bottom: `-10vh`,
              background: "radial-gradient(circle, oklch(0.85 0.2 152 / 0.7), transparent 70%)",
              filter: "blur(1px)",
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}
