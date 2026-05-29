import React from 'react'
import { cn } from '@/lib/utils/cn'
import { getInitials } from '@/lib/utils/format'
import { LazyBase64Image } from './LazyBase64Image'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ProfileAvatarProps {
  base64?: string
  name: string
  size?: AvatarSize
  className?: string
  lazy?: boolean // default true for list views, false for profile page
}

const SIZE_CLASSES: Record<AvatarSize, { wrapper: string; text: string }> = {
  xs: { wrapper: 'w-7 h-7', text: 'text-xs' },
  sm: { wrapper: 'w-9 h-9', text: 'text-sm' },
  md: { wrapper: 'w-12 h-12', text: 'text-base' },
  lg: { wrapper: 'w-20 h-20', text: 'text-xl' },
  xl: { wrapper: 'w-28 h-28', text: 'text-2xl' },
}

export const ProfileAvatar = React.memo(function ProfileAvatar({
  base64,
  name,
  size = 'md',
  className,
  lazy = true,
}: ProfileAvatarProps) {
  const { wrapper, text } = SIZE_CLASSES[size]
  const initials = getInitials(name)

  if (base64 && lazy) {
    return (
      <LazyBase64Image
        base64={base64}
        alt={name}
        fallbackName={name}
        className={cn(
          'rounded-full flex-shrink-0 border-2 border-white shadow-sm',
          wrapper,
          className
        )}
        placeholderClassName={cn('rounded-full', text, 'font-semibold')}
      />
    )
  }

  if (base64 && !lazy) {
    return (
      <img
        src={base64}
        alt={name}
        loading="eager"
        decoding="async"
        className={cn(
          'rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm',
          wrapper,
          className
        )}
      />
    )
  }

  return (
    <div
      aria-label={name}
      role="img"
      className={cn(
        'rounded-full flex items-center justify-center flex-shrink-0 select-none',
        'bg-gradient-to-br from-primary-500 to-primary-700',
        'text-white font-semibold border-2 border-white shadow-sm',
        wrapper,
        text,
        className
      )}
    >
      {initials}
    </div>
  )
})