import {
  AlertTriangle,
  CheckCircle2,
  FileCode2,
  FolderTree,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FAKE_FILES = [
  { name: "app/", indent: 0 },
  { name: "layout.tsx", indent: 1 },
  { name: "page.tsx", indent: 1 },
  { name: "api/", indent: 1 },
  { name: "analyze/route.ts", indent: 2 },
  { name: "components/", indent: 0 },
  { name: "Dashboard.tsx", indent: 1 },
  { name: "lib/", indent: 0 },
  { name: "auth.ts", indent: 1 },
];

const FAKE_CONCEPTS = [
  "Server Components vs Client Components",
  "JWT token validation flow",
  "React useEffect cleanup",
];

const FAKE_BUGS = [
  {
    file: "lib/auth.ts",
    line: 42,
    issue: "JWT secret loaded from env without fallback",
    severity: "critical" as const,
  },
  {
    file: "app/api/analyze/route.ts",
    line: 18,
    issue: "Missing rate-limit on public endpoint",
    severity: "high" as const,
  },
];

export default function DemoGif() {
  return (
    <section className="bg-navy px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            See what a report looks like
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted">
            A real analysis on a sample Next.js project — concepts, bugs, and a
            learning path generated in seconds.
          </p>
        </div>

        <Card className="overflow-hidden border-border bg-navy-light">
          {/* Title bar */}
          <div className="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-bug-red" />
            <span className="h-2.5 w-2.5 rounded-full bg-orange" />
            <span className="h-2.5 w-2.5 rounded-full bg-green" />
            <span className="ml-3 text-xs text-muted">
              RepoIQ Report — my-nextjs-app
            </span>
          </div>

          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-3">
            {/* Column 1 — File tree */}
            <div className="rounded-lg border border-border bg-navy p-4">
              <div className="mb-3 flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-green" />
                <span className="text-sm font-medium text-white">
                  Files scanned
                </span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  12 files
                </Badge>
              </div>
              <ul className="space-y-1 font-mono text-xs text-muted">
                {FAKE_FILES.map((f) => (
                  <li
                    key={f.name}
                    className="flex items-center gap-1"
                    style={{ paddingLeft: `${f.indent * 12}px` }}
                  >
                    {f.name.endsWith("/") ? (
                      <FolderTree className="h-3 w-3 text-muted" />
                    ) : (
                      <FileCode2 className="h-3 w-3 text-muted" />
                    )}
                    <span>{f.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2 — Critical concepts */}
            <div className="rounded-lg border border-border bg-navy p-4">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green" />
                <span className="text-sm font-medium text-white">
                  Critical concepts
                </span>
                <Badge className="ml-auto text-xs">3 found</Badge>
              </div>
              <ul className="space-y-2">
                {FAKE_CONCEPTS.map((concept, i) => (
                  <li key={concept} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green/20 text-xs font-semibold text-green">
                      {i + 1}
                    </span>
                    <span className="text-sm text-white">{concept}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Bugs */}
            <div className="rounded-lg border border-border bg-navy p-4">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-bug-red" />
                <span className="text-sm font-medium text-white">
                  Bugs detected
                </span>
                <Badge variant="destructive" className="ml-auto text-xs">
                  2 bugs
                </Badge>
              </div>
              <ul className="space-y-3">
                {FAKE_BUGS.map((bug) => (
                  <li
                    key={bug.file + bug.line}
                    className="rounded-md border border-border bg-navy-light p-3"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-mono text-xs text-muted">
                        {bug.file}:{bug.line}
                      </span>
                      <Badge
                        variant={
                          bug.severity === "critical"
                            ? "destructive"
                            : "warning"
                        }
                        className="text-[10px]"
                      >
                        {bug.severity}
                      </Badge>
                    </div>
                    <p className="text-xs leading-relaxed text-muted">
                      {bug.issue}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
