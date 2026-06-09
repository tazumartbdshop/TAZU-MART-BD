import React from 'react';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
  );
}

export function ProductSkeleton() {
  return (
    <div className="bg-white border border-neutral-100 rounded-xl p-2 shadow-sm flex flex-col gap-2">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full mt-2" />
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex flex-col gap-2 shrink-0" style={{ width: '110px' }}>
      <Skeleton className="w-[110px] h-[150px] rounded-[18px]" />
    </div>
  );
}
