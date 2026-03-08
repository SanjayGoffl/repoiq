import { Brain, Bug, HelpCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface PainPoint {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const PAIN_POINTS: PainPoint[] = [
  {
    icon: <Brain className="h-8 w-8 text-green" />,
    title: "Can\u2019t explain your own code",
    description:
      "Students build apps with AI but can\u2019t explain the architecture. In interviews and code reviews, that gap is exposed instantly.",
  },
  {
    icon: <Bug className="h-8 w-8 text-bug-red" />,
    title: "Hidden bugs you don\u2019t know about",
    description:
      "Real security and performance bugs lurking in AI-generated code. Missing auth checks, N+1 queries, memory leaks \u2014 all invisible until production.",
  },
  {
    icon: <HelpCircle className="h-8 w-8 text-orange" />,
    title: "No idea what to learn first",
    description:
      "Without knowing what you don\u2019t know, you can\u2019t ask the right questions. You\u2019re stuck in tutorial hell with no clear priority.",
  },
];

export default function PainPoints() {
  return (
    <section className="bg-navy px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            The vibe-coding problem
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted">
            AI writes your code in minutes. But what did you actually learn?
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PAIN_POINTS.map((point) => (
            <Card key={point.title} className="border-border bg-navy-light">
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-navy">
                  {point.icon}
                </div>
                <CardTitle className="text-lg text-white">
                  {point.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed text-muted">
                  {point.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
