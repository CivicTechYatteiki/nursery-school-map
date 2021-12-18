// https://medium.com/@alexandereardon/uselayouteffect-and-ssr-192986cdcf7a
import { useLayoutEffect, useEffect } from 'react'
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
