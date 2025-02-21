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

  const handleMouseDown = (e: React.MouseEvent<SVGCircleElement>): void => {
    e.preventDefault()

    const onMouseMove = (moveEvent: MouseEvent): void => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = moveEvent.clientX - rect.left
      const value = (x / rect.width) * 100
      const clampedValue = Math.min(Math.max(value, 0), 100)
      setSliderValue(clampedValue)
    }

    const onMouseUp = (): void => {
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
        viewBox={`0 0 ${normalizedWidth} ${normalizedHeight}`} // Dynamic viewBox matching container size
      >
        {/* Vertical line */}
        <line
          x1={sliderValue * (typeof width === 'number' ? width / 100 : 1)}
          y1="0"
          x2={sliderValue * (typeof width === 'number' ? width / 100 : 1)}
          y2={typeof height === 'number' ? height : '100%'}
          stroke="white"
          strokeWidth="2" // Fixed pixel width
          pointerEvents="none"
        />
        {/* Slider handle (blue circle) */}
        <circle
          cx={sliderValue * (typeof width === 'number' ? width / 100 : 1)}
          cy={typeof height === 'number' ? height - 10 : 'calc(100% - 10)'}
          r="5" // Fixed radius in pixels
          fill="blue"
          onMouseDown={handleMouseDown}
          style={{ cursor: 'pointer', pointerEvents: 'auto' }}
        />
      </svg>
    </div>
  )
}

export default ImageSlider
