'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { getInitials } from '@/lib/utils/format'

interface LazyBase64ImageProps {
  base64: string
  alt: string
  className?: string
  placeholderClassName?: string
  fallbackName?: string
}

/**
 * Lazy-loads a base64 image using Intersection Observer.
 * Shows an initials placeholder until the image enters the viewport.
 * Never uses Next.js <Image> — base64 data URIs don't benefit from it.
 */
export const LazyBase64Image = React.memo(function LazyBase64Image({
  base64,
  alt,
  className,
  placeholderClassName,
  fallbackName = '',
}: LazyBase64ImageProps) {
  const [isInView, setIsInView] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '50px', threshold: 0.01 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const initials = getInitials(fallbackName)
  const showImage = isInView && !hasError && base64
  const showPlaceholder = !isLoaded || !showImage

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      {/* Placeholder (initials) — shown while loading */}
      {showPlaceholder && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'bg-gradient-to-br from-primary-500 to-primary-700',
            'text-white font-semibold select-none',
            placeholderClassName
          )}
          aria-hidden={isLoaded}
        >
          {initials}
        </div>
      )}

      {/* Actual image */}
      {showImage && (
        <img
          src={base64}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={cn(
            'absolute inset-0 w-full h-full object-cover',
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}
    </div>
  )
})