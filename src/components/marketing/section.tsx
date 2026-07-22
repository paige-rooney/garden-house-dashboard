import { ReactNode } from "react";

type Props = {
  id?: string;
  title: string;
  children: ReactNode;
};

export function Section({ id, title, children }: Props) {
  return (
    <section id={id} className="rounded-2xl bg-brand-surface p-6 shadow-soft md:p-8">
      <h2 className="mb-4 text-2xl font-semibold text-brand-dark">{title}</h2>
      {children}
    </section>
  );
}
