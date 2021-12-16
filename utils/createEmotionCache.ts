import createCache from '@emotion/cache';

// Foom https://github.com/mui-org/material-ui/blob/1b9c44b82183d804c38b80dcad1fd9265d0761c8/examples/nextjs-with-typescript/src/utils/createEmotionCache.ts

export default function createEmotionCache() {
  return createCache({ key: 'css' });
}
