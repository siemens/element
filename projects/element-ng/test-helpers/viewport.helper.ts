import { page } from 'vitest/browser';

export const resetViewport = (): Promise<void> => page.viewport(1024, 768);
