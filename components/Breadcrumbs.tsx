import Link from "next/link";

export default function Breadcrumbs({ label, items }: { label: string; items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label={label} className="mb-4 text-sm text-slate-600 dark:text-slate-400">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden>/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:underline">{item.name}</Link>
            ) : (
              <span aria-current="page">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
