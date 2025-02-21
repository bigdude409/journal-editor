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
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleMouseDown = (e: React.MouseEvent<SVGRectElement>): void => {
    e.preventDefault()
    setIsDragging(true)

    const onMouseMove = (moveEvent: MouseEvent): void => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = moveEvent.clientX - rect.left
      const value = (x / rect.width) * 100
      const clampedValue = Math.min(Math.max(value, 0), 100)
      setSliderValue(clampedValue)
    }

    const onMouseUp = (): void => {
      setIsDragging(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const normalizedWidth = typeof width === 'number' ? `${width}px` : width
  const normalizedHeight = typeof height === 'number' ? `${height}px` : height

  const handleHeight = 20
  const centerY =
    typeof height === 'number' ? height / 2 - handleHeight / 2 : `calc(50% - ${handleHeight / 2}px)`

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: normalizedWidth,
        height: normalizedHeight,
        cursor: isDragging ? 'grabbing' : 'default' // Container cursor still toggles
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
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          willChange: 'transform'
        }}
        viewBox={`0 0 ${normalizedWidth} ${normalizedHeight}`}
      >
        <defs>
          <linearGradient id="handleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4A90E2" />
            <stop offset="100%" stopColor="#357ABD" />
          </linearGradient>
          <filter id="handleShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3" />
          </filter>
        </defs>
        <line
          x1={sliderValue * (typeof width === 'number' ? width / 100 : 1)}
          y1="0"
          x2={sliderValue * (typeof width === 'number' ? width / 100 : 1)}
          y2={typeof height === 'number' ? height : '100%'}
          stroke="white"
          strokeWidth="2"
          pointerEvents="none"
        />
        <rect
          x={sliderValue * (typeof width === 'number' ? width / 100 : 1) - 5}
          y={centerY}
          width="10"
          height={handleHeight}
          rx="5"
          fill="url(#handleGradient)"
          filter="url(#handleShadow)"
          onMouseDown={handleMouseDown}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab', // Handle cursor toggles
            pointerEvents: 'auto'
          }}
        />
      </svg>
    </div>
  )
}

export default ImageSlider
