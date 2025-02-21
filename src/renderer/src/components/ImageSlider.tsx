import React, { useState, useRef } from 'react'

interface ImageSliderProps {
  topImageSrc: string
  bottomImageSrc: string
  width?: string | number
  height?: string | number
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  topImageSrc,
  bottomImageSrc,
  width = '100%',
  height = 'auto'
}) => {
  const [sliderValue, setSliderValue] = useState<number>(50)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleMouseDown = (e: React.MouseEvent<SVGCircleElement>) => {
    e.preventDefault()

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = moveEvent.clientX - rect.left
      const value = (x / rect.width) * 100
      const clampedValue = Math.min(Math.max(value, 0), 100)
      setSliderValue(clampedValue)
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const normalizedWidth = typeof width === 'number' ? `${width}px` : width
  const normalizedHeight = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: normalizedWidth,
        height: normalizedHeight
      }}
    >
      <img
        src={bottomImageSrc}
        alt="Bottom image"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      <img
        src={topImageSrc}
        alt="Top image"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          clipPath: `inset(0 ${100 - sliderValue}% 0 0)`
        }}
      />
      {/* Vertical line */}
      <div
        style={{
          position: 'absolute',
          left: `${sliderValue}%`,
          top: 0,
          height: '100%',
          width: '2px',
          backgroundColor: 'white',
          pointerEvents: 'none',
          transform: 'translateX(-50%)', // Center the line on the position
          zIndex: 1 // Ensure it’s above images but below slider
        }}
      />
      {/* SVG slider */}
      <svg
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '20px',
          zIndex: 2 // Ensure slider is above the line
        }}
        viewBox="0 0 100 20"
      >
        <line x1="0" y1="10" x2="100" y2="10" stroke="black" strokeWidth="1" />
        <circle
          cx={sliderValue} // Matches the percentage value directly
          cy="10"
          r="5"
          fill="blue"
          onMouseDown={handleMouseDown}
          style={{ cursor: 'pointer' }}
        />
      </svg>
    </div>
  )
}

export default ImageSlider
