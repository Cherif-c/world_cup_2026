interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
      <div>
        <h1 className="page-title">{title}</h1>
        <div className="page-title-accent" />
        {subtitle && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
