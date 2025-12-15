import Link from "next/link";

export default function SidebarItem({
  href,
  icon,
  label,
  open,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  open: boolean;
}) {
  return (
    <Link
      href={href}
      className="
        flex items-center gap-3 px-3 py-2 rounded-md
        hover:bg-white/10 transition-colors
      "
    >
      {icon}
      {open && <span className="text-sm">{label}</span>}
    </Link>
  );
}
