import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function extractRepoName(url: string): string {
  try {
    const parts = url.replace(/\.git$/, '').split('/');
    return parts[parts.length - 1] ?? 'unknown-repo';
  } catch {
    return 'unknown-repo';
  }
}

export function extractRepoOwner(url: string): string {
  try {
    const parts = url.replace(/\.git$/, '').split('/');
    return parts[parts.length - 2] ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

export function isValidGitHubUrl(url: string): boolean {
  const pattern = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;
  return pattern.test(url);
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-900/50 text-red-300 border-red-700';
    case 'high':
      return 'bg-red-900/30 text-red-400 border-red-800';
    case 'medium':
      return 'bg-orange-900/30 text-orange-400 border-orange-800';
    case 'low':
      return 'bg-yellow-900/30 text-yellow-400 border-yellow-800';
    default:
      return 'bg-gray-800 text-gray-400 border-gray-700';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'ingesting':
      return 'Cloning repo...';
    case 'indexing':
      return 'Indexing files...';
    case 'analyzing':
      return 'AI analyzing...';
    case 'complete':
      return 'Complete';
    case 'failed':
      return 'Failed';
    default:
      return 'Unknown';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'complete':
      return 'bg-green/20 text-green border-green/50';
    case 'failed':
      return 'bg-red-900/30 text-red-400 border-red-800';
    case 'ingesting':
    case 'indexing':
    case 'analyzing':
      return 'bg-blue-900/30 text-blue-400 border-blue-800';
    default:
      return 'bg-gray-800 text-gray-400 border-gray-700';
  }
}
