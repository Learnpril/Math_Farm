import { Home, ChevronRight } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '../../../components/ui/breadcrumb';

interface ToolsBreadcrumbProps {
  currentTool?: string;
}

export function ToolsBreadcrumb({ currentTool }: ToolsBreadcrumbProps) {
  return (
    <Breadcrumb className='mb-6'>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href='/' className='flex items-center gap-1'>
            <Home className='h-4 w-4' />
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight className='h-4 w-4' />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          {currentTool ? (
            <BreadcrumbLink href='/tools'>Tools</BreadcrumbLink>
          ) : (
            <BreadcrumbPage>Tools</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {currentTool && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className='h-4 w-4' />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{currentTool}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
