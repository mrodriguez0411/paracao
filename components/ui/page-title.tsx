interface PageTitleProps {
  title: string;
  description?: string;
}

export function PageTitle({ title, description }: PageTitleProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}
