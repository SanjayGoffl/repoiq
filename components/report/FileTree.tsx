'use client';

import { useState, useMemo, useCallback } from 'react';
import { ChevronRight, Folder, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

import type { FileImportance } from '@/lib/types';

interface FileTreeProps {
  files: string[];
  conceptFiles: string[];
  fileImportance?: FileImportance[];
  onFileClick?: (path: string) => void;
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

function getImportanceColor(score: number | undefined): {
  dot: string;
  text: string;
} {
  if (score == null) return { dot: '', text: '' };
  if (score >= 8) return { dot: 'bg-red-500', text: 'text-red-400' };
  if (score >= 5) return { dot: 'bg-orange-400', text: 'text-orange-300' };
  return { dot: 'bg-emerald-500', text: 'text-emerald-400' };
}

function TreeItem({
  node,
  conceptFiles,
  depth,
  fileImportance,
  onFileClick,
}: {
  node: TreeNode;
  conceptFiles: string[];
  depth: number;
  fileImportance?: FileImportance[];
  onFileClick?: (path: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(depth < 1);

  const isConcept = conceptFiles.includes(node.path);
  const importance = fileImportance?.find((f) => f.path === node.path);
  const colors = getImportanceColor(importance?.score);

  const handleClick = useCallback(() => {
    if (node.isFolder) {
      setIsOpen((prev) => !prev);
    } else if (onFileClick) {
      onFileClick(node.path);
    }
  }, [node.isFolder, node.path, onFileClick]);

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        title={importance ? `${importance.score}/10 — ${importance.reason}` : undefined}
        className={cn(
          'flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-sm transition-colors hover:bg-navy',
          isConcept && 'border-l-2 border-green',
          !node.isFolder && onFileClick && 'cursor-pointer hover:bg-navy/80'
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
                isConcept ? 'text-green' : colors.text || 'text-muted'
              )}
            />
          </>
        )}

        <span
          className={cn(
            'truncate font-mono text-xs',
            isConcept ? 'text-white' : colors.text || 'text-muted'
          )}
        >
          {node.name}
        </span>

        {importance && (
          <span className="ml-auto flex items-center gap-1">
            <span className="text-[10px] text-muted">{importance.score}</span>
            <span className={cn('h-2 w-2 shrink-0 rounded-full', colors.dot)} />
          </span>
        )}

        {!importance && isConcept && (
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
              fileImportance={fileImportance}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ files, conceptFiles, fileImportance, onFileClick }: FileTreeProps) {
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
            fileImportance={fileImportance}
            onFileClick={onFileClick}
          />
        ))}
      </div>
    </div>
  );
}
