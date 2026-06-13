import React from 'react';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
  );
}

export function ProductSkeleton() {
  return null;
}

export function CategorySkeleton() {
  return null;
}
