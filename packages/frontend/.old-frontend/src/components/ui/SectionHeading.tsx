interface SectionHeadingProps {
  children: string
}

export function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <h3 className="section-heading">
      {children}
    </h3>
  )
}
