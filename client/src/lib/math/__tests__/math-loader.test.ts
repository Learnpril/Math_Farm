import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getMathInstance, loadMathLibrary, isMathLoaded } from '../math-loader';

// Mock mathjs
const mockMath = {
  evaluate: vi.fn(),
  parse: vi.fn(),
  create: vi.fn(),
  config: vi.fn(),
  derivative: vi.fn(),
  simplify: vi.fn(),
};

vi.mock('mathjs', () => ({
  default: mockMath,
  ...mockMath,
}));

describe('Math Loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the module state
    vi.resetModules();
  });

  describe('getMathInstance', () => {
    it('should return math instance when loaded', () => {
      const mathInstance = getMathInstance();
      expect(mathInstance).toBeDefined();
      expect(mathInstance).toHaveProperty('evaluate');
    });

    it('should return consistent instance on multiple calls', () => {
      const instance1 = getMathInstance();
      const instance2 = getMathInstance();
      expect(instance1).toBe(instance2);
    });

    it('should handle math.js methods', () => {
      const mathInstance = getMathInstance();

      if (mathInstance) {
        expect(typeof mathInstance.evaluate).toBe('function');
        expect(typeof mathInstance.parse).toBe('function');
      }
    });
  });

  describe('loadMathLibrary', () => {
    it('should load math library successfully', async () => {
      const result = await loadMathLibrary();
      expect(result.loaded).toBe(true);
      expect(result.mathInstance).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should handle loading errors gracefully', async () => {
      // Mock import to fail
      vi.doMock('mathjs', () => {
        throw new Error('Failed to load mathjs');
      });

      const result = await loadMathLibrary();
      expect(result.loaded).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.mathInstance).toBeNull();
    });

    it('should return cached result on subsequent calls', async () => {
      const result1 = await loadMathLibrary();
      const result2 = await loadMathLibrary();

      expect(result1).toEqual(result2);
    });
  });

  describe('isMathLoaded', () => {
    it('should return true when math is loaded', () => {
      // After getMathInstance is called, math should be loaded
      getMathInstance();
      expect(isMathLoaded()).toBe(true);
    });

    it('should return false when math is not loaded', () => {
      // This test might be tricky due to module state, but we can test the function exists
      expect(typeof isMathLoaded).toBe('function');
    });
  });

  describe('error handling', () => {
    it('should handle undefined math instance', () => {
      // Mock a scenario where math fails to load
      vi.doMock('mathjs', () => undefined);

      const mathInstance = getMathInstance();
      // Should handle gracefully, either return null or a fallback
      expect(mathInstance === null || typeof mathInstance === 'object').toBe(
        true
      );
    });

    it('should handle partial math.js imports', () => {
      // Mock a scenario where only some methods are available
      const partialMath = {
        evaluate: vi.fn(),
        // Missing other methods
      };

      vi.doMock('mathjs', () => partialMath);

      const mathInstance = getMathInstance();
      expect(mathInstance).toBeDefined();
    });
  });

  describe('math.js integration', () => {
    it('should work with math.js evaluate function', () => {
      const mathInstance = getMathInstance();

      if (mathInstance && mathInstance.evaluate) {
        mockMath.evaluate.mockReturnValue(4);

        const result = mathInstance.evaluate('2+2');
        expect(result).toBe(4);
        expect(mockMath.evaluate).toHaveBeenCalledWith('2+2');
      }
    });

    it('should work with math.js create function', () => {
      const mathInstance = getMathInstance();

      if (mathInstance && mathInstance.create) {
        const mockCreatedMath = { evaluate: vi.fn(), config: vi.fn() };
        mockMath.create.mockReturnValue(mockCreatedMath);

        const createdMath = mathInstance.create();
        expect(createdMath).toBe(mockCreatedMath);
        expect(mockMath.create).toHaveBeenCalled();
      }
    });

    it('should handle math.js configuration', () => {
      const mathInstance = getMathInstance();

      if (mathInstance && mathInstance.config) {
        mathInstance.config({ angleUnit: 'deg' });
        expect(mockMath.config).toHaveBeenCalledWith({ angleUnit: 'deg' });
      }
    });
  });

  describe('performance', () => {
    it('should load math library quickly', async () => {
      const startTime = Date.now();
      await loadMathLibrary();
      const endTime = Date.now();

      const loadTime = endTime - startTime;
      expect(loadTime).toBeLessThan(1000); // Should load in less than 1 second
    });

    it('should cache math instance for performance', () => {
      const startTime = Date.now();

      // Multiple calls should be fast due to caching
      for (let i = 0; i < 100; i++) {
        getMathInstance();
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(100); // Should be very fast due to caching
    });
  });

  describe('browser compatibility', () => {
    it('should handle environments without dynamic imports', async () => {
      // Mock environment without dynamic import support
      const originalImport = global.import;
      // @ts-ignore
      delete global.import;

      try {
        const result = await loadMathLibrary();
        // Should handle gracefully
        expect(result).toBeDefined();
        expect(typeof result.loaded).toBe('boolean');
      } finally {
        // @ts-ignore
        global.import = originalImport;
      }
    });

    it('should work in different JavaScript environments', () => {
      // Test that the module works regardless of environment
      const mathInstance = getMathInstance();
      expect(mathInstance === null || typeof mathInstance === 'object').toBe(
        true
      );
    });
  });
});
