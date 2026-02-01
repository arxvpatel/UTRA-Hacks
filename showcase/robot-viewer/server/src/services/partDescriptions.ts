import type { RobotPart } from '../types/index.js';
import { generatePartDescription } from './gemini.js';

const generatedDescriptions = new Map<string, string>();
const inFlight = new Map<string, Promise<string | null>>();

const PLACEHOLDER_PREFIX = 'UTRA Robot part:';
const PLACEHOLDER_EXACT = new Set(['Unknown part', 'Unknown part.']);
const MAX_CONCURRENCY = 3;

function isPlaceholderDescription(part: RobotPart): boolean {
  const desc = part.description?.trim() ?? '';
  if (!desc) return true;
  if (PLACEHOLDER_EXACT.has(desc)) return true;
  if (desc.startsWith(PLACEHOLDER_PREFIX)) return true;
  return false;
}

async function getGeneratedDescription(part: RobotPart): Promise<string | null> {
  const cached = generatedDescriptions.get(part.id);
  if (cached) return cached;

  const existing = inFlight.get(part.id);
  if (existing) return existing;

  const promise = generatePartDescription(part)
    .then((desc) => {
      inFlight.delete(part.id);
      if (desc) {
        generatedDescriptions.set(part.id, desc);
        return desc;
      }
      return null;
    })
    .catch((error) => {
      inFlight.delete(part.id);
      console.error('[Gemini] Description generation failed:', error);
      return null;
    });

  inFlight.set(part.id, promise);
  return promise;
}

async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>
): Promise<void> {
  const executing = new Set<Promise<void>>();

  for (const item of items) {
    const task = worker(item).catch(() => undefined);
    executing.add(task);
    const cleanup = () => executing.delete(task);
    task.then(cleanup);

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
}

export async function applyGeneratedDescriptions(
  parts: RobotPart[],
  options: { force?: boolean } = {}
): Promise<RobotPart[]> {
  const force = options.force ?? false;

  const targets = parts.filter((part) => {
    if (generatedDescriptions.has(part.id)) return false;
    return force || isPlaceholderDescription(part);
  });

  if (targets.length === 0) return parts;

  await runWithConcurrency(targets, MAX_CONCURRENCY, async (part) => {
    const description = await getGeneratedDescription(part);
    if (description) {
      part.description = description;
    }
  });

  return parts;
}
