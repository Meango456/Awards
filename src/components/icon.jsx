import React from 'react'

const paths = {
  crown: (
    <>
      <path d="M3 18h18" />
      <path d="M4 18 3 8l5 4 4-7 4 7 5-4-1 10" />
    </>
  ),
  heart: <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z" />,
  sprout: (
    <>
      <path d="M12 21v-9" />
      <path d="M12 13c0-4-3-6.5-7.5-6.5 0 4 3 6.5 7.5 6.5z" />
      <path d="M12 15.5c0-3.5 2.5-6 7.5-6 0 3.5-2.5 6-7.5 6z" />
    </>
  ),
  star: <path d="m12 3 2.7 5.7 6.2.8-4.5 4.3 1.1 6.2L12 17l-5.5 3 1.1-6.2L3.1 9.5l6.2-.8z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  back: <path d="M19 12H5m5-5-5 5 5 5" />,
  download: <path d="M12 4v11m-4.5-4.5L12 15l4.5-4.5M5 19h14" />,
}

export default function Icon({ name, size = 24, stroke = 1.5, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}