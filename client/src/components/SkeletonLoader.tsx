interface SkeletonLoaderProps {
  variant?: "page" | "card" | "tool" | "topic" | "math";
  className?: string;
}

export function SkeletonLoader({
  variant = "page",
  className = "",
}: SkeletonLoaderProps) {
  const baseClasses = "animate-pulse bg-muted rounded";

  switch (variant) {
    case "page":
      return (
        <div className={`container mx-auto px-4 py-8 ${className}`}>
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="space-y-4">
              <div className={`h-8 w-1/4 ${baseClasses}`} />
              <div className={`h-12 w-3/4 ${baseClasses}`} />
              <div className={`h-6 w-1/2 ${baseClasses}`} />
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <div className={`h-64 ${baseClasses}`} />
                <div className={`h-48 ${baseClasses}`} />
              </div>
              <div className="lg:col-span-1 space-y-4">
                <div className={`h-32 ${baseClasses}`} />
                <div className={`h-24 ${baseClasses}`} />
              </div>
            </div>
          </div>
        </div>
      );

    case "card":
      return (
        <div className={`p-6 border rounded-lg ${className}`}>
          <div className="space-y-4">
            <div className={`h-6 w-3/4 ${baseClasses}`} />
            <div className={`h-4 w-full ${baseClasses}`} />
            <div className={`h-4 w-2/3 ${baseClasses}`} />
          </div>
        </div>
      );

    case "tool":
      return (
        <div className={`space-y-6 ${className}`}>
          {/* Tool controls skeleton */}
          <div className="p-4 border rounded-lg">
            <div className="space-y-4">
              <div className={`h-6 w-1/3 ${baseClasses}`} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`h-10 ${baseClasses}`} />
                <div className={`h-10 ${baseClasses}`} />
              </div>
              <div className={`h-10 w-full ${baseClasses}`} />
            </div>
          </div>

          {/* Tool output skeleton */}
          <div className="p-4 border rounded-lg">
            <div className={`h-64 ${baseClasses}`} />
          </div>
        </div>
      );

    case "topic":
      return (
        <div className={`space-y-6 ${className}`}>
          {/* Topic header skeleton */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`h-8 w-1/3 ${baseClasses}`} />
              <div className={`h-6 w-20 ${baseClasses}`} />
            </div>
            <div className={`h-6 w-2/3 ${baseClasses}`} />
            <div className="flex gap-2">
              <div className={`h-8 w-16 ${baseClasses}`} />
              <div className={`h-8 w-20 ${baseClasses}`} />
              <div className={`h-8 w-24 ${baseClasses}`} />
            </div>
          </div>

          {/* Content sections skeleton */}
          <div className="space-y-4">
            <div className={`h-6 w-1/4 ${baseClasses}`} />
            <div className={`h-32 ${baseClasses}`} />
          </div>

          <div className="space-y-4">
            <div className={`h-6 w-1/4 ${baseClasses}`} />
            <div className={`h-48 ${baseClasses}`} />
          </div>
        </div>
      );

    case "math":
      return (
        <div className={`p-4 text-center ${className}`}>
          <div className={`h-8 w-32 mx-auto ${baseClasses}`} />
        </div>
      );

    default:
      return <div className={`h-32 ${baseClasses} ${className}`} />;
  }
}
