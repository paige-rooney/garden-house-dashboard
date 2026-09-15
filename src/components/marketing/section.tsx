import { ReactNode } from "react";

type Props = {
  id?: string;
  title: string;
  children: ReactNode;
};

export function Section({ id, title, children }: Props) {
  return (
    <section id={id} className="rounded-2xl bg-brand-surface p-6 shadow-soft md:p-8">
      <h2 className="mb-1 font-heading text-2xl font-semibold text-brand-dark">{title}</h2>
      <div className="mb-5 h-px w-16 bg-brand-gold" aria-hidden />
      {children}
    </section>
  );
}
