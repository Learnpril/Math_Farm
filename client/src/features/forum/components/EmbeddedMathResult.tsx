import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import {
  Calculator,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Play,
} from 'lucide-react';
import { MathJaxPreview } from './MathJaxPreview';
import { ToolResult } from '../../../lib/toolUtils';
import { createMathToolDeepLink } from '../lib/math-tool-integration';

interface EmbeddedMathResultProps {
  toolResult: ToolResult;
  showSteps?: boolean;
  compact?: boolean;
  className?: string;
}

export function EmbeddedMathResult({
  toolResult,
  showSteps = true,
  compact = false,
  className = '',
}: EmbeddedMathResultProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [linkCopied, setLinkCopied] = useState(false);

  const deepLink = createMathToolDeepLink(toolResult);

  const copyDeepLink = async () => {
    try {
      await navigator.clipboard.writeText(deepLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const openInTool = () => {
    window.open(deepLink, '_blank');
  };

  const getToolIcon = () => {
    switch (toolResult.toolId) {
      case 'calculator':
        return Calculator;
      case 'solver':
        return Calculator; // Could use a different icon
      case 'graphing':
        return Calculator; // Could use a graph icon
      default:
        return Calculator;
    }
  };

  const ToolIcon = getToolIcon();

  return (
    <Card className={`border-l-4 border-l-primary ${className}`}>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-primary/10 rounded-lg'>
              <ToolIcon className='h-4 w-4 text-primary' />
            </div>
            <div>
              <CardTitle className='text-sm font-medium'>
                {toolResult.toolName} Result
              </CardTitle>
              <p className='text-xs text-muted-foreground'>
                Generated {toolResult.timestamp.toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={copyDeepLink}
              className='h-8 px-2'
            >
              {linkCopied ? (
                <Check className='h-3 w-3' />
              ) : (
                <Copy className='h-3 w-3' />
              )}
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={openInTool}
              className='h-8 px-2'
            >
              <ExternalLink className='h-3 w-3' />
            </Button>
            {compact && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setIsExpanded(!isExpanded)}
                className='h-8 px-2'
              >
                {isExpanded ? (
                  <ChevronUp className='h-3 w-3' />
                ) : (
                  <ChevronDown className='h-3 w-3' />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        {/* Input Section */}
        <div className='space-y-3'>
          <div>
            <h4 className='text-xs font-medium text-muted-foreground mb-2'>
              INPUT
            </h4>
            <div className='p-3 bg-muted/50 rounded-lg'>
              {toolResult.toolId === 'calculator' && (
                <div className='space-y-1'>
                  <div className='font-mono text-sm'>
                    {toolResult.input.expression}
                  </div>
                  {toolResult.input.angleMode && (
                    <Badge variant='outline' className='text-xs'>
                      {toolResult.input.angleMode.toUpperCase()}
                    </Badge>
                  )}
                </div>
              )}

              {toolResult.toolId === 'solver' && (
                <div className='space-y-1'>
                  <div className='font-mono text-sm'>
                    {toolResult.input.equation}
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline' className='text-xs'>
                      Variable: {toolResult.input.variable}
                    </Badge>
                    <Badge variant='outline' className='text-xs'>
                      {toolResult.input.solverType}
                    </Badge>
                  </div>
                </div>
              )}

              {toolResult.toolId === 'graphing' && (
                <div className='space-y-1'>
                  {toolResult.input.functions && (
                    <div className='font-mono text-sm'>
                      {toolResult.input.functions.join(', ')}
                    </div>
                  )}
                  {toolResult.input.bounds && (
                    <div className='text-xs text-muted-foreground'>
                      Range: x ∈ [{toolResult.input.bounds.xMin},{' '}
                      {toolResult.input.bounds.xMax}], y ∈ [
                      {toolResult.input.bounds.yMin},{' '}
                      {toolResult.input.bounds.yMax}]
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Result Section */}
          <div>
            <h4 className='text-xs font-medium text-muted-foreground mb-2'>
              RESULT
            </h4>
            <div className='p-4 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 rounded-lg'>
              {toolResult.output.latex ? (
                <div className='text-center'>
                  <MathJaxPreview
                    content={`\\[${toolResult.output.latex}\\]`}
                  />
                </div>
              ) : (
                <div className='font-mono text-lg font-bold text-center text-primary'>
                  {toolResult.output.result}
                </div>
              )}
            </div>
          </div>

          {/* Steps Section */}
          {isExpanded &&
            showSteps &&
            toolResult.steps &&
            toolResult.steps.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className='text-xs font-medium text-muted-foreground mb-3'>
                    STEP-BY-STEP SOLUTION
                  </h4>
                  <div className='space-y-3'>
                    {toolResult.steps.map((step, index) => (
                      <div key={index} className='border-l-2 border-muted pl-4'>
                        <div className='flex items-start gap-2'>
                          <Badge variant='outline' className='text-xs mt-1'>
                            {step.step}
                          </Badge>
                          <div className='flex-1 space-y-2'>
                            <p className='text-sm text-muted-foreground'>
                              {step.explanation}
                            </p>

                            {step.latex ? (
                              <div className='p-3 bg-background border rounded-lg'>
                                <MathJaxPreview
                                  content={`\\[${step.latex}\\]`}
                                />
                              </div>
                            ) : (
                              <div className='p-2 bg-muted rounded font-mono text-sm'>
                                {step.result}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

          {/* Action Buttons */}
          <Separator />
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Badge variant='secondary' className='text-xs'>
                {toolResult.toolName}
              </Badge>
              {toolResult.steps && toolResult.steps.length > 0 && (
                <Badge variant='outline' className='text-xs'>
                  {toolResult.steps.length} steps
                </Badge>
              )}
            </div>

            <Button
              variant='outline'
              size='sm'
              onClick={openInTool}
              className='flex items-center gap-2'
            >
              <Play className='h-3 w-3' />
              Try in Tool
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
