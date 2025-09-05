# Breadcrumb Navigation System

## Overview

The breadcrumb navigation system provides users with a clear path showing their current location within the Math Farm application hierarchy. It automatically generates breadcrumbs based on the current route and supports keyboard navigation for accessibility.

## Features

### Automatic Breadcrumb Generation

- **Topic Pages**: Home > Topics > [Topic Title]
- **Tools Pages**: Home > Tools > [Tool Name] (if specific tool)
- **Guide Pages**: Home > [Guide Name]
- **Generic Routes**: Automatically formats URL segments

### Keyboard Navigation Support

- **Arrow Left/Right**: Navigate between breadcrumb links
- **Home Key**: Jump to first breadcrumb link
- **End Key**: Jump to last breadcrumb link
- **Tab**: Standard tab navigation through links

### Accessibility Features

- Full WCAG 2.2 compliance
- Proper ARIA labels and landmarks
- Screen reader support
- Focus indicators
- Semantic HTML structure

## Usage

### Automatic Mode (Recommended)

The breadcrumb component automatically generates breadcrumbs based on the current route:

```tsx
import { BreadcrumbNavigation } from "../navigation/BreadcrumbNavigation";

// In Layout component - automatically generates breadcrumbs
<BreadcrumbNavigation />;
```

### Custom Breadcrumbs

You can also provide custom breadcrumb items:

```tsx
const customBreadcrumbs = [
  { label: "Custom Section", href: "/custom" },
  { label: "Current Page", isActive: true },
];

<BreadcrumbNavigation items={customBreadcrumbs} />;
```

### Layout Integration

The Layout component supports breadcrumb configuration:

```tsx
<Layout
  breadcrumbItems={customItems} // Optional custom items
  showBreadcrumbs={true} // Show/hide breadcrumbs (default: true)
>
  {/* Page content */}
</Layout>
```

## Route Mapping

The system automatically maps routes to readable breadcrumb labels:

### Topic Routes (`/topic/:id`)

- `arithmetic` → "Arithmetic"
- `algebra` → "Algebra"
- `calculus` → "Calculus"
- `linear-algebra` → "Linear Algebra"
- `game-design-math` → "Game Design Math"

### Tool Routes (`/tools/:id`)

- `calculator` → "Calculator"
- `graphing` → "Graphing Tool"
- `solver` → "Equation Solver"

### Guide Routes

- `/latex-guide` → "LaTeX Guide"
- `/matlab-guide` → "MATLAB Guide"

## Styling

The breadcrumb component uses Tailwind CSS classes and integrates with the shadcn/ui design system:

- Consistent spacing and typography
- Focus indicators for accessibility
- Responsive design
- Dark/light theme support

## Testing

The component includes comprehensive tests covering:

- Route-based breadcrumb generation
- Custom breadcrumb items
- Keyboard navigation functionality
- Accessibility attributes
- Edge cases (home page, invalid routes)

Run tests with:

```bash
npm test -- BreadcrumbNavigation
```

## Implementation Details

### Key Components

- `BreadcrumbNavigation`: Main component with automatic generation
- `generateBreadcrumbs()`: Route-to-breadcrumb mapping logic
- `getTopicTitle()`: Topic ID to display name mapping
- `getToolTitle()`: Tool ID to display name mapping

### Dependencies

- `wouter`: For route detection
- `lucide-react`: For Home icon
- `shadcn/ui`: For breadcrumb UI components

### Browser Support

- Modern browsers with ES6+ support
- Keyboard navigation works in all major browsers
- Screen reader compatible
