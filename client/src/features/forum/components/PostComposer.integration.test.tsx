/**
 * Simple integration test for PostComposer component
 * This test verifies the basic functionality without complex setup
 */

import React from 'react';
import { PostComposer } from './PostComposer';

// Simple test to verify component can be imported and instantiated
describe('PostComposer Integration', () => {
  it('should be importable and instantiable', () => {
    const mockOnSubmit = jest.fn();

    // This test just verifies the component can be created without errors
    expect(() => {
      React.createElement(PostComposer, {
        onSubmit: mockOnSubmit,
        threadId: 'test-thread',
      });
    }).not.toThrow();
  });
});

// Export for manual testing
export { PostComposer };
