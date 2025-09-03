import { MathExpression } from './MathExpression';

/**
 * Demo component showcasing MathJax integration
 * This component demonstrates various mathematical expressions and error handling
 */
export function MathDemo() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-foreground">
        MathJax Integration Demo
      </h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Inline Math Examples
        </h3>
        <p className="text-muted-foreground">
          The quadratic formula is <MathExpression expression="x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}" inline={true} />{' '}
          and Einstein's famous equation is <MathExpression expression="E = mc^2" inline={true} />.
        </p>
        <p className="text-muted-foreground">
          The area of a circle is <MathExpression expression="A = \pi r^2" inline={true} /> where{' '}
          <MathExpression expression="r" inline={true} /> is the radius.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Block Math Examples
        </h3>
        
        <div>
          <p className="text-muted-foreground mb-2">
            The fundamental theorem of calculus:
          </p>
          <MathExpression expression="\int_a^b f'(x) \, dx = f(b) - f(a)" />
        </div>

        <div>
          <p className="text-muted-foreground mb-2">
            The Pythagorean theorem:
          </p>
          <MathExpression expression="a^2 + b^2 = c^2" />
        </div>

        <div>
          <p className="text-muted-foreground mb-2">
            Matrix multiplication:
          </p>
          <MathExpression expression="\begin{pmatrix} a & b \\ c & d \end{pmatrix} \begin{pmatrix} x \\ y \end{pmatrix} = \begin{pmatrix} ax + by \\ cx + dy \end{pmatrix}" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Error Handling Demo
        </h3>
        <p className="text-muted-foreground mb-2">
          This expression has invalid LaTeX syntax and should show a fallback:
        </p>
        <MathExpression 
          expression="invalid\syntax\here" 
          fallback="[Custom fallback for invalid syntax]"
        />
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h4 className="text-sm font-medium text-foreground mb-2">
          Implementation Notes
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• MathJax is loaded lazily for optimal performance</li>
          <li>• All expressions include proper ARIA labels for accessibility</li>
          <li>• Both inline and block display modes are supported</li>
          <li>• Custom fallback text can be provided for failed renders</li>
        </ul>
      </div>
    </div>
  );
}