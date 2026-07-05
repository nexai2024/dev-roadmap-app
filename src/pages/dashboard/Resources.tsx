import { RESOURCES } from "@/data/protocol";
import {
  BookOpen,
  Code2,
  ExternalLink,
  GraduationCap,
  Library,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const GROUPED: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  type: "learning" | "code-stack" | "community" | "book";
}[] = [
  { title: "Learning stack", icon: GraduationCap, type: "learning" },
  { title: "Code stack", icon: Code2, type: "code-stack" },
  { title: "Community & playbooks", icon: Users, type: "community" },
  { title: "Books", icon: BookOpen, type: "book" },
];

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Library className="h-3 w-3" />
          Stack · courses · community
        </p>
        <h1 className="font-mono text-2xl md:text-3xl font-semibold mt-1">
          Resources.
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          The exact tools, courses, communities, and books the protocol
          prescribes. Use these — do not substitute.
        </p>
      </div>

      <div className="space-y-6">
        {GROUPED.map((g) => {
          const items = RESOURCES.filter((r) => r.type === g.type);
          if (!items.length) return null;
          const Icon = g.icon;
          return (
            <div key={g.type}>
              <h2 className="font-mono text-lg nb-rule">
                <Icon className="h-4 w-4" />
                {g.title}
              </h2>
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                {items.map((r) => (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "nb-card p-4 nb-press block hover:bg-sidebar-accent transition-colors",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-mono text-base">{r.name}</h3>
                        {r.cost && (
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono mt-0.5">
                            {r.cost}
                          </p>
                        )}
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      {r.note}
                    </p>
                    <p className="text-[10px] mt-2 truncate font-mono text-muted-foreground">
                      {r.url}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="nb-card p-5 sm:p-6 relative">
        <div className="absolute -top-3 left-6 nb-tape px-2 font-mono text-[10px] uppercase tracking-widest rotate-[1deg]">
          Reminder
        </div>
        <p className="font-mono text-sm mt-2">
          Cursor is the only expense you should have for the first 6 months.
        </p>
        <p className="nb-hand text-base text-muted-foreground mt-1.5">
          "$20/mo for an editor that lets you ship 3× faster is the highest ROI in the protocol."
        </p>
      </div>
    </div>
  );
}
