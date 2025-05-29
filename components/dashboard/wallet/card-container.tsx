"use client";

export default function CardContainer({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="backdrop-blur-sm bg-black/20 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all shadow-md">
      <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-white to-white/90 text-transparent bg-clip-text">
        {title}
      </h2>
      {children}
    </div>
  );
}
