'use client'

interface HighlightTextProps {
  text: string
  highlight?: string
  className?: string
}

export function HighlightText({
  text,
  highlight,
  className = '',
}: HighlightTextProps) {
  if (!highlight) return <span className={className}>{text}</span>

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'))

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark
            key={i}
            className="bg-yellow-200/70 dark:bg-yellow-300/30 px-0.5 rounded-sm"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  )
}
