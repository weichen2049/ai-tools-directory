import { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
  className?: string;
  titleSlot?: ReactNode;
};

export function SectionCard({ title, children, className, titleSlot }: Props) {
  return (
    <div
      className={`bg-transparent border-0 shadow-none p-0 space-y-3 ${className ?? ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-base tracking-[0.08em] text-lux-text">{title}</h2>
        {titleSlot}
      </div>
      {children}
    </div>
  );
}