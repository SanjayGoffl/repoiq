import type { Dependency } from './types';

export function parseDependencies(
  files: { path: string; content: string }[],
): Dependency[] {
  const deps: Dependency[] = [];

  for (const file of files) {
    const filename = file.path.split('/').pop() ?? '';

    if (filename === 'package.json') {
      deps.push(...parsePackageJson(file.content, file.path));
    } else if (filename === 'requirements.txt') {
      deps.push(...parseRequirementsTxt(file.content, file.path));
    } else if (filename === 'Cargo.toml') {
      deps.push(...parseCargoToml(file.content, file.path));
    } else if (filename === 'go.mod') {
      deps.push(...parseGoMod(file.content, file.path));
    } else if (filename === 'Gemfile') {
      deps.push(...parseGemfile(file.content, file.path));
    }
  }

  return deps;
}

function parsePackageJson(content: string, sourceFile: string): Dependency[] {
  const deps: Dependency[] = [];
  try {
    const pkg = JSON.parse(content) as Record<string, unknown>;

    const prodDeps = (pkg.dependencies ?? {}) as Record<string, string>;
    for (const [name, version] of Object.entries(prodDeps)) {
      deps.push({ name, version, type: 'production', source_file: sourceFile });
    }

    const devDeps = (pkg.devDependencies ?? {}) as Record<string, string>;
    for (const [name, version] of Object.entries(devDeps)) {
      deps.push({ name, version, type: 'dev', source_file: sourceFile });
    }
  } catch {
    // Invalid JSON, skip
  }
  return deps;
}

function parseRequirementsTxt(content: string, sourceFile: string): Dependency[] {
  const deps: Dependency[] = [];
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue;

    const match = trimmed.match(/^([a-zA-Z0-9_-]+)\s*(?:[>=<~!]+\s*(.+))?$/);
    if (match) {
      deps.push({
        name: match[1]!,
        version: match[2]?.trim() ?? '*',
        type: 'production',
        source_file: sourceFile,
      });
    }
  }
  return deps;
}

function parseCargoToml(content: string, sourceFile: string): Dependency[] {
  const deps: Dependency[] = [];
  let inDeps = false;
  let inDevDeps = false;

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '[dependencies]') { inDeps = true; inDevDeps = false; continue; }
    if (trimmed === '[dev-dependencies]') { inDevDeps = true; inDeps = false; continue; }
    if (trimmed.startsWith('[')) { inDeps = false; inDevDeps = false; continue; }

    if (inDeps || inDevDeps) {
      const match = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*"(.+?)"/);
      if (match) {
        deps.push({
          name: match[1]!,
          version: match[2]!,
          type: inDevDeps ? 'dev' : 'production',
          source_file: sourceFile,
        });
      }
    }
  }
  return deps;
}

function parseGoMod(content: string, sourceFile: string): Dependency[] {
  const deps: Dependency[] = [];
  let inRequire = false;

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('require (')) { inRequire = true; continue; }
    if (trimmed === ')') { inRequire = false; continue; }

    if (inRequire) {
      const match = trimmed.match(/^(\S+)\s+(\S+)/);
      if (match) {
        deps.push({
          name: match[1]!,
          version: match[2]!,
          type: 'production',
          source_file: sourceFile,
        });
      }
    }
  }
  return deps;
}

function parseGemfile(content: string, sourceFile: string): Dependency[] {
  const deps: Dependency[] = [];
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^gem\s+['"]([^'"]+)['"](?:\s*,\s*['"](.+?)['"])?/);
    if (match) {
      deps.push({
        name: match[1]!,
        version: match[2] ?? '*',
        type: 'production',
        source_file: sourceFile,
      });
    }
  }
  return deps;
}
