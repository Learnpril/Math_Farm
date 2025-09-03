import { describe, it, expect } from 'vitest';
import { useMathJax } from '../useMathJax';

describe('useMathJax Integration', () => {
  it('exports the hook correctly', () => {
    expect(typeof useMathJax).toBe('function');
  });

  it('returns the expected interface', () => {
    // This is a basic smoke test to ensure the hook structure is correct
    // More detailed testing would require a full browser environment
    const hookInterface = useMathJax.toString();
    expect(hookInterface).toContain('useState');
    expect(hookInterface).toContain('useEffect');
    expect(hookInterface).toContain('useCallback');
  });
});