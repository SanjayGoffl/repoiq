import type { Dependency, LinesOfCode, StackInfo, RuntimeRequirements } from './types';

/**
 * Known RAM footprints for common frameworks/runtimes (in MB).
 * These are baseline idle + typical dev workload estimates.
 */
const FRAMEWORK_RAM: Record<string, number> = {
  // JS/TS frameworks
  'next.js': 180,
  'nuxt': 160,
  'remix': 150,
  'gatsby': 200,
  'vite': 80,
  'react': 60,
  'angular': 120,
  'vue': 50,
  'svelte': 40,
  'express': 30,
  'fastify': 25,
  'nestjs': 80,
  'nest.js': 80,
  'hono': 20,

  // Python frameworks
  'django': 80,
  'flask': 40,
  'fastapi': 50,
  'pytorch': 500,
  'tensorflow': 600,
  'numpy': 100,
  'pandas': 150,

  // Java/JVM
  'spring boot': 300,
  'spring': 250,
  'quarkus': 80,

  // Go
  'gin': 15,
  'fiber': 15,
  'echo': 15,

  // Rust
  'actix': 10,
  'axum': 10,
  'rocket': 15,

  // Databases (in-process or local)
  'sqlite': 5,
  'redis': 30,
};

/** Runtime baseline memory (MB) */
const RUNTIME_BASELINE: Record<string, number> = {
  'node.js': 50,
  'node': 50,
  'python': 30,
  'java': 150,
  'go': 10,
  'rust': 5,
  'ruby': 40,
  'php': 20,
  '.net': 80,
  'c#': 80,
};

/** Per-dependency overhead estimate (MB) */
const DEP_OVERHEAD = 0.5;

/** Per 1000 LOC overhead (MB) — larger codebases use more memory for compilation/bundling */
const LOC_OVERHEAD_PER_1K = 0.3;

interface EstimateInput {
  stackInfo?: StackInfo;
  dependencies?: Dependency[];
  linesOfCode?: LinesOfCode;
  languages?: string[];
}

export function estimateRAM(input: EstimateInput): { ram_mb: number; reasoning: string } {
  let totalMb = 0;
  const reasons: string[] = [];

  // 1. Detect primary runtime baseline
  const langs = (input.languages ?? []).map((l) => l.toLowerCase());
  let runtimeDetected = false;
  for (const [runtime, mb] of Object.entries(RUNTIME_BASELINE)) {
    if (langs.some((l) => l.includes(runtime) || runtime.includes(l))) {
      totalMb += mb;
      reasons.push(`${runtime} runtime: ~${mb}MB`);
      runtimeDetected = true;
      break;
    }
  }
  if (!runtimeDetected) {
    totalMb += 50; // default
    reasons.push('Default runtime: ~50MB');
  }

  // 2. Add framework overhead
  const allStackItems = [
    ...(input.stackInfo?.frameworks ?? []),
    ...(input.stackInfo?.libraries ?? []),
    ...(input.stackInfo?.databases ?? []),
  ].map((s) => s.toLowerCase());

  let frameworkAdded = 0;
  for (const item of allStackItems) {
    for (const [framework, mb] of Object.entries(FRAMEWORK_RAM)) {
      if (item.includes(framework) || framework.includes(item)) {
        totalMb += mb;
        reasons.push(`${item}: ~${mb}MB`);
        frameworkAdded++;
        break;
      }
    }
  }

  // 3. Dependency count overhead
  const depCount = input.dependencies?.length ?? 0;
  if (depCount > 0) {
    const prodDeps = input.dependencies?.filter((d) => d.type === 'production').length ?? 0;
    const depMb = Math.round(prodDeps * DEP_OVERHEAD);
    if (depMb > 0) {
      totalMb += depMb;
      reasons.push(`${prodDeps} production dependencies: ~${depMb}MB`);
    }
  }

  // 4. LOC-based overhead (compilation, bundling, dev server)
  const loc = input.linesOfCode?.code_lines ?? input.linesOfCode?.total ?? 0;
  if (loc > 0) {
    const locMb = Math.round((loc / 1000) * LOC_OVERHEAD_PER_1K);
    if (locMb > 0) {
      totalMb += locMb;
      reasons.push(`${loc.toLocaleString()} LOC build overhead: ~${locMb}MB`);
    }
  }

  // 5. Round to nearest sensible number
  // Real apps don't use exactly 512MB — use realistic increments
  let rounded: number;
  if (totalMb <= 64) rounded = 64;
  else if (totalMb <= 128) rounded = 128;
  else if (totalMb <= 200) rounded = 200;
  else if (totalMb <= 300) rounded = 300;
  else if (totalMb <= 400) rounded = 400;
  else if (totalMb <= 600) rounded = 600;
  else if (totalMb <= 800) rounded = 800;
  else if (totalMb <= 1200) rounded = Math.round(totalMb / 100) * 100;
  else rounded = Math.round(totalMb / 256) * 256;

  const reasoning = reasons.length > 0
    ? `Based on: ${reasons.join(', ')}. Total estimated: ~${totalMb}MB (recommended: ${rounded}MB).`
    : `Estimated based on project size and detected stack.`;

  return { ram_mb: rounded, reasoning };
}

/**
 * Override AI-generated runtime_requirements with server-computed RAM estimate.
 * Keeps AI-generated runtime_versions and system_requirements but replaces the RAM fields.
 */
export function enhanceRuntimeRequirements(
  aiRuntime: RuntimeRequirements | undefined,
  input: EstimateInput,
): RuntimeRequirements {
  const { ram_mb, reasoning } = estimateRAM(input);

  return {
    ram_estimate_mb: ram_mb,
    ram_reasoning: reasoning,
    runtime_versions: aiRuntime?.runtime_versions ?? [],
    system_requirements: aiRuntime?.system_requirements ?? [],
  };
}
