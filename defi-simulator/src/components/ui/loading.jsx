export function LoadingDots() {
  return (
    <div className="flex gap-1.5 items-center">
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0ms'}} />
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '150ms'}} />
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '300ms'}} />
    </div>
  );
}

export function LoadingSkeleton({ className = '' }) {
  return (
    <div className={`animate-shimmer bg-muted/50 rounded-lg h-32 w-full ${className}`} />
  );
}
