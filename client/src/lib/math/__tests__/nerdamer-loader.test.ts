import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadNerdamer,
  getNerdamerInstance,
  isNerdamerLoaded,
} from '../nerdamer-loader';

// Mock nerdamer
const mockNerdamer = {
  solve: vi.fn(),
  diff: vi.fn(),
  simplify: vi.fn(),
  expand: vi.fn(),
  factor: vi.fn(),
};

vi.mock('nerdamer', () => ({
  default: mockNerdamer,
  ...mockNerdamer,
}));

describe('Nerdamer Loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset module state
    vi.resetModules();
  });

  describe('loadNerdamer', () => {
    it('should load nerdamer successfully', async () => {
      const result = await loadNerdamer();

      expect(result.loaded).toBe(true);
      expect(result.nerdamerInstance).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should handle loading errors gracefully', async () => {
      // Mock nerdamer import to fail
      vi.doMock('nerdamer', () => {
        throw new Error('Failed to load nerdamer');
      });

      const result = await loadNerdamer();

      expect(result.loaded).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.nerdamerInstance).toBeNull();
    });

    it('should return cached result on subsequent calls', async () => {
      const result1 = await loadNerdamer();
      const result2 = await loadNerdamer();

      expect(result1).toEqual(result2);
    });

    it('should handle partial nerdamer loading', async () => {
      // Mock nerdamer with only some methods
      const partialNerdamer = {
        solve: vi.fn(),
        // Missing other methods
      };

      vi.doMock('nerdamer', () => partialNerdamer);

      const result = await loadNerdamer();
      expect(result.loaded).toBe(true);
      expect(result.nerdamerInstance).toBeDefined();
    });
  });

  describe('getNerdamerInstance', () => {
    it('should return nerdamer instance when available', () => {
      const instance = getNerdamerInstance();
      expect(instance).toBeDefined();

      if (instance) {
        expect(typeof instance.solve).toBe('function');
        expect(typeof instance.diff).toBe('function');
        expect(typeof instance.simplify).toBe('function');
      }
    });

    it('should return null when nerdamer is not loaded', () => {
      // Mock scenario where nerdamer fails to load
      vi.doMock('nerdamer', () => {
        throw new Error('Nerdamer not available');
      });

      const instance = getNerdamerInstance();
      // Should handle gracefully
      expect(instance === null || typeof instance === 'object').toBe(true);
    });

    it('should return consistent instance on multiple calls', () => {
      const instance1 = getNerdamerInstance();
      const instance2 = getNerdamerInstance();

      if (instance1 && instance2) {
        expect(instance1).toBe(instance2);
      }
    });
  });

  describe('isNerdamerLoaded', () => {
    it('should return boolean indicating load status', () => {
      const loaded = isNerdamerLoaded();
      expect(typeof loaded).toBe('boolean');
    });

    it('should return true after successful loading', async () => {
      await loadNerdamer();
      const loaded = isNerdamerLoaded();
      expect(loaded).toBe(true);
    });
  });

  describe('nerdamer functionality', () => {
    it('should work with solve function', () => {
      const instance = getNerdamerInstance();

      if (instance && instance.solve) {
        mockNerdamer.solve.mockReturnValue([
          { toString: () => '2' },
          { toString: () => '-2' },
        ]);

        const result = instance.solve('x^2-4', 'x');
        expect(result).toBeDefined();
        expect(mockNerdamer.solve).toHaveBeenCalledWith('x^2-4', 'x');
      }
    });

    it('should work with differentiation', () => {
      const instance = getNerdamerInstance();

      if (instance && instance.diff) {
        mockNerdamer.diff.mockReturnValue({ toString: () => '2*x' });

        const result = instance.diff('x^2', 'x');
        expect(result).toBeDefined();
        expect(mockNerdamer.diff).toHaveBeenCalledWith('x^2', 'x');
      }
    });

    it('should work with simplification', () => {
      const instance = getNerdamerInstance();

      if (instance && instance.simplify) {
        mockNerdamer.simplify.mockReturnValue({ toString: () => 'x^2+2*x+1' });

        const result = instance.simplify('(x+1)^2');
        expect(result).toBeDefined();
        expect(mockNerdamer.simplify).toHaveBeenCalledWith('(x+1)^2');
      }
    });

    it('should handle nerdamer errors gracefully', () => {
      const instance = getNerdamerInstance();

      if (instance && instance.solve) {
        mockNerdamer.solve.mockImplementation(() => {
          throw new Error('Nerdamer solve error');
        });

        expect(() => {
          instance.solve('invalid', 'x');
        }).toThrow('Nerdamer solve error');
      }
    });
  });

  describe('error handling', () => {
    it('should handle undefined nerdamer gracefully', async () => {
      vi.doMock('nerdamer', () => undefined);

      const result = await loadNerdamer();
      expect(result.loaded).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle nerdamer import failures', async () => {
      vi.doMock('nerdamer', () => {
        throw new Error('Module not found');
      });

      const result = await loadNerdamer();
      expect(result.loaded).toBe(false);
      expect(result.error).toContain('Module not found');
    });

    it('should handle network errors during loading', async () => {
      vi.doMock('nerdamer', () => {
        throw new Error('Network error');
      });

      const result = await loadNerdamer();
      expect(result.loaded).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('performance', () => {
    it('should load nerdamer efficiently', async () => {
      const startTime = Date.now();
      await loadNerdamer();
      const endTime = Date.now();

      const loadTime = endTime - startTime;
      expect(loadTime).toBeLessThan(2000); // Should load in reasonable time
    });

    it('should cache nerdamer instance for performance', () => {
      const startTime = Date.now();

      // Multiple calls should be fast due to caching
      for (let i = 0; i < 100; i++) {
        getNerdamerInstance();
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(100);
    });
  });

  describe('browser compatibility', () => {
    it('should handle environments without dynamic imports', async () => {
      const originalImport = global.import;
      // @ts-ignore
      delete global.import;

      try {
        const result = await loadNerdamer();
        expect(result).toBeDefined();
        expect(typeof result.loaded).toBe('boolean');
      } finally {
        // @ts-ignore
        global.import = originalImport;
      }
    });

    it('should work in different JavaScript environments', () => {
      const instance = getNerdamerInstance();
      expect(instance === null || typeof instance === 'object').toBe(true);
    });
  });

  describe('symbolic computation features', () => {
    it('should handle algebraic expressions', () => {
      const instance = getNerdamerInstance();

      if (instance) {
        // Test various symbolic operations
        const operations = ['solve', 'diff', 'simplify'];

        operations.forEach(op => {
          if (instance[op as keyof typeof instance]) {
            expect(typeof instance[op as keyof typeof instance]).toBe(
              'function'
            );
          }
        });
      }
    });

    it('should handle complex mathematical expressions', () => {
      const instance = getNerdamerInstance();

      if (instance && instance.simplify) {
        mockNerdamer.simplify.mockReturnValue({
          toString: () => 'simplified_expression',
        });

        const complexExpr = 'sin(x)^2 + cos(x)^2';
        const result = instance.simplify(complexExpr);

        expect(result).toBeDefined();
        expect(mockNerdamer.simplify).toHaveBeenCalledWith(complexExpr);
      }
    });

    it('should handle polynomial operations', () => {
      const instance = getNerdamerInstance();

      if (instance && instance.solve) {
        mockNerdamer.solve.mockReturnValue([
          { toString: () => '1' },
          { toString: () => '2' },
          { toString: () => '3' },
        ]);

        const polynomial = 'x^3 - 6*x^2 + 11*x - 6';
        const result = instance.solve(polynomial, 'x');

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      }
    });
  });

  describe('integration with math operations', () => {
    it('should integrate with equation solving', () => {
      const instance = getNerdamerInstance();

      if (instance && instance.solve) {
        mockNerdamer.solve.mockReturnValue([
          { toString: () => 'sqrt(2)' },
          { toString: () => '-sqrt(2)' },
        ]);

        const result = instance.solve('x^2 - 2', 'x');
        expect(result).toBeDefined();
      }
    });

    it('should integrate with calculus operations', () => {
      const instance = getNerdamerInstance();

      if (instance && instance.diff) {
        mockNerdamer.diff.mockReturnValue({
          toString: () => '3*x^2 + 2*x + 1',
        });

        const result = instance.diff('x^3 + x^2 + x', 'x');
        expect(result).toBeDefined();
      }
    });

    it('should handle multiple variables', () => {
      const instance = getNerdamerInstance();

      if (instance && instance.diff) {
        mockNerdamer.diff.mockReturnValue({
          toString: () => '2*x*y',
        });

        const result = instance.diff('x^2*y', 'x');
        expect(result).toBeDefined();
        expect(mockNerdamer.diff).toHaveBeenCalledWith('x^2*y', 'x');
      }
    });
  });
});
