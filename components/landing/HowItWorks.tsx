import { Link2, FileText, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Step {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: 1,
    icon: <Link2 className="h-6 w-6 text-green" />,
    title: "Drop a GitHub URL",
    description:
      "Paste any public repo link. We clone it, parse every file, and index it with Amazon Bedrock Knowledge Bases.",
  },
  {
    number: 2,
    icon: <FileText className="h-6 w-6 text-green" />,
    title: "Get your AI learning report",
    description:
      "In under a minute you get a full architecture summary, the concepts you likely can\u2019t explain, and real bugs found in your code.",
  },
  {
    number: 3,
    icon: <MessageSquare className="h-6 w-6 text-green" />,
    title: "Learn through Socratic teaching",
    description:
      "RepoIQ never gives you the answer. It asks targeted questions about YOUR code until you truly understand every concept.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-navy-light px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-16 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            How it works
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted">
            Three steps from &ldquo;I built this with AI&rdquo; to &ldquo;I
            understand every line.&rdquo;
          </p>
        </div>

        <div className="relative flex flex-col gap-12 lg:gap-0">
          {/* Connector line (visible lg+) */}
          <div className="absolute left-1/2 top-12 hidden h-[calc(100%-96px)] w-px -translate-x-1/2 bg-border lg:block" />

          {STEPS.map((step, index) => (
            <div key={step.number} className="relative flex flex-col items-center gap-4 lg:flex-row lg:gap-8">
              {/* Alternate layout: odd left-aligned, even right-aligned */}
              <div
                className={`flex w-full flex-col items-center gap-4 text-center lg:w-5/12 lg:text-left ${
                  index % 2 === 0
                    ? "lg:items-end lg:text-right"
                    : "lg:order-3 lg:items-start lg:text-left"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                </div>
                <p className="max-w-sm text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>

              {/* Number badge (center) */}
              <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center lg:order-2">
                <Badge className="flex h-10 w-10 items-center justify-center rounded-full text-sm">
                  {step.number}
                </Badge>
              </div>

              {/* Spacer for alternating side */}
              <div
                className={`hidden lg:block lg:w-5/12 ${
                  index % 2 === 0 ? "lg:order-3" : "lg:order-1"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
