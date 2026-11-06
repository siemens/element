import { page } from 'vitest/browser';

/** Restores the default browser viewport configured as `browserViewport` in `angular.json`. */
export const resetViewport = (): Promise<void> => page.viewport(1024, 768);
