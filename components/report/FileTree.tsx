'use client';

import { useState, useMemo, useCallback } from 'react';
import { ChevronRight, Folder, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileTreeProps {
  files: string[];
  conceptFiles: string[];
}

interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: TreeNode[];
}

function buildTree(files: string[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const filePath of files) {
    const parts = filePath.split('/');
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i] as string;
      const isFolder = i < parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');

      let existing = currentLevel.find((node) => node.name === part);

      if (!existing) {
        const newNode: TreeNode = {
          name: part,
          path: currentPath,
          isFolder,
          children: [],
        };
        currentLevel.push(newNode);
        existing = newNode;
      }

      currentLevel = existing.children;
    }
  }

  return root;
}

function sortTree(nodes: TreeNode[]): TreeNode[] {
  return [...nodes]
    .sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    })
    .map((node) => ({
      ...node,
      children: sortTree(node.children),
    }));
}

function TreeItem({
  node,
  conceptFiles,
  depth,
}: {
  node: TreeNode;
  conceptFiles: string[];
  depth: number;
}) {
  const [isOpen, setIsOpen] = useState(depth < 1);

  const isConcept = conceptFiles.includes(node.path);

  const handleToggle = useCallback(() => {
    if (node.isFolder) {
      setIsOpen((prev) => !prev);
    }
  }, [node.isFolder]);

  return (
    <div>
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-sm transition-colors hover:bg-navy',
          isConcept && 'border-l-2 border-green'
        )}
      >
        <span
          className="shrink-0"
          style={{ paddingLeft: `${depth * 12}px` }}
        />

        {node.isFolder ? (
          <>
            <ChevronRight
              className={cn(
                'h-3.5 w-3.5 shrink-0 text-muted transition-transform duration-200',
                isOpen && 'rotate-90'
              )}
            />
            <Folder className="h-4 w-4 shrink-0 text-muted" />
          </>
        ) : (
          <>
            <span className="h-3.5 w-3.5 shrink-0" />
            <FileText
              className={cn(
                'h-4 w-4 shrink-0',
                isConcept ? 'text-green' : 'text-muted'
              )}
            />
          </>
        )}

        <span
          className={cn(
            'truncate font-mono text-xs',
            isConcept ? 'text-white' : 'text-muted'
          )}
        >
          {node.name}
        </span>

        {isConcept && (
          <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-green" />
        )}
      </button>

      {node.isFolder && isOpen && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              conceptFiles={conceptFiles}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ files, conceptFiles }: FileTreeProps) {
  const tree = useMemo(() => sortTree(buildTree(files)), [files]);

  return (
    <div className="rounded-lg border border-border bg-navy-light p-3">
      <div className="space-y-0.5">
        {tree.map((node) => (
          <TreeItem
            key={node.path}
            node={node}
            conceptFiles={conceptFiles}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
}
