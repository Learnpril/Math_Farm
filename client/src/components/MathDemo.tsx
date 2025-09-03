import React from 'react';
import { MathExpression, InlineMath, BlockMath } from './MathExpression';
import { MathRenderingErrorBoundary } from './MathRenderingErrorBoundary';

/**
 * Demo component showcasing MathJax integration
 * This component demonstrates various mathematical expressions and error handling
 */
export function MathDemo() {
  return (
    <MathRenderingErrorBoundary>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          MathJax Integration Demo
        </h2>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Inline Math Examples
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            The quadratic formula is <InlineMath expression="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}" />{' '}
            and Einstein's famous equation is <InlineMath expression="E = mc^2" />.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            The area of a circle is <InlineMath expression="A = \pi r^2" /> where{' '}
            <InlineMath expression="r" /> is the radius.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Block Math Examples
          </h3>
          
          <div>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              The fundamental theorem of calculus:
            </p>
            <BlockMath expression="\int_a^b f'(x) \, dx = f(b) - f(a)" />
          </div>

          <div>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              The Pythagorean theorem:
            </p>
            <BlockMath expression="a^2 + b^2 = c^2" />
          </div>

          <div>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              A complex integral:
            </p>
            <BlockMath expression="\oint_C \mathbf{F} \cdot d\mathbf{r} = \iint_S (\nabla \times \mathbf{F}) \cdot \mathbf{n} \, dS" />
          </div>

          <div>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Matrix multiplication:
            </p>
            <BlockMath expression="\begin{pmatrix} a & b \\ c & d \end{pmatrix} \begin{pmatrix} x \\ y \end{pmatrix} = \begin{pmatrix} ax + by \\ cx + dy \end{pmatrix}" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Advanced Examples
          </h3>
          
          <div>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Schrödinger equation:
            </p>
            <BlockMath expression="i\hbar\frac{\partial}{\partial t}\Psi(\mathbf{r},t) = \hat{H}\Psi(\mathbf{r},t)" />
          </div>

          <div>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Taylor series expansion:
            </p>
            <BlockMath expression="f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!}(x-a)^n" />
          </div>

          <div>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Fourier transform:
            </p>
            <BlockMath expression="\hat{f}(\xi) = \int_{-\infty}^{\infty} f(x) e^{-2\pi i x \xi} dx" />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Error Handling Demo
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            This expression has invalid LaTeX syntax and should show an error:
          </p>
          <MathExpression 
            expression="invalid\syntax\here" 
            fallback="[Custom fallback for invalid syntax]"
          />
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Implementation Notes
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• MathJax is loaded lazily for optimal performance</li>
            <li>• All expressions include proper ARIA labels for accessibility</li>
            <li>• Error boundaries provide graceful fallbacks</li>
            <li>• Both inline and block display modes are supported</li>
            <li>• Custom fallback text can be provided for failed renders</li>
          </ul>
        </div>
      </div>
    </MathRenderingErrorBoundary>
  );
}