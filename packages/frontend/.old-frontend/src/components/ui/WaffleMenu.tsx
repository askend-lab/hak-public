const WAFFLE_DOTS_COUNT = 9;

export function WaffleMenu() {
  return (
    <button className="waffle-menu">
      {Array.from({ length: WAFFLE_DOTS_COUNT }).map((_, i) => (
        <div key={`waffle-dot-${i}`} className="waffle-menu__dot" />
      ))}
    </button>
  )
}
