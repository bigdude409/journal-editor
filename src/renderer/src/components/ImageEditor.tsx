/// <reference types="@webgpu/types" />

import { useRef, useEffect, useState } from 'react'
import { initWebGPU } from '../utils/webGPURenderer'

interface ImageEditorProps {
  src: string
  width?: string | number
  height?: string | number
}

function ImageEditor({ src, width = '100%', height = '100%' }: ImageEditorProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const webgpuRef = useRef<{
    device: GPUDevice | null
    uniformBuffer: GPUBuffer | null
    bindGroup: GPUBindGroup | null
  }>({
    device: null,
    uniformBuffer: null,
    bindGroup: null
  })
  const [isGPUInitialized, setIsGPUInitialized] = useState(false)

  const renderRef = useRef<(() => void) | null>(null)
  const [saturationValue, setSaturationValue] = useState(0.0)
  const [canvasWidth] = useState(width)
  const [canvasHeight] = useState(height)

  const [sliderValue, setSliderValue] = useState<number>(50)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isSliderVisible, setIsSliderVisible] = useState(false)
  const [previousSliderValue, setPreviousSliderValue] = useState<number>(50)

  function handleMouseDown(e: React.MouseEvent<SVGRectElement>): void {
    e.preventDefault()
    setIsDragging(true)

    function onMouseMove(moveEvent: MouseEvent): void {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = moveEvent.clientX - rect.left
      const value = (x / rect.width) * 100
      const clampedValue = Math.min(Math.max(value, 0), 100)
      setSliderValue(clampedValue)
    }

    function onMouseUp(): void {
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

  useEffect(() => {
    async function setupWebGPU(): Promise<void> {
      const canvas = canvasRef.current
      if (!canvas) return

      const context = await initWebGPU(canvas, src, 0.0, canvasWidth, canvasHeight)
      webgpuRef.current = context
      renderRef.current = context.render
      setIsGPUInitialized(true)
      if (context.render) {
        context.render()
      }
    }

    setupWebGPU()
  }, [src, canvasWidth, canvasHeight])

  useEffect(() => {
    const { device, uniformBuffer } = webgpuRef.current
    if (device && uniformBuffer && renderRef.current && isGPUInitialized) {
      device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([-1.0 * saturationValue]))
      renderRef.current()
    }
  }, [saturationValue, isSliderVisible, isGPUInitialized])

  const toggleSliderVisibility = (): void => {
    setIsSliderVisible((prev) => {
      if (prev) {
        setPreviousSliderValue(sliderValue)

        setSliderValue(0)
      } else {
        setSliderValue(previousSliderValue)
      }
      return !prev
    })
  }

  // Early return if no src is provided
  if (!src) {
    return (
      <div
        style={{
          width: normalizedWidth,
          height: normalizedHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#2c2c2c',
          borderRadius: '5px',
          color: '#fff',
          fontSize: '16px'
        }}
      >
        Select an image file...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: normalizedWidth,
          height: normalizedHeight,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
      >
        {isSliderVisible && (
          <img
            src={src}
            alt="Bottom image"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'block',
              borderRadius: '5px',
              clipPath: `inset(0 ${100 - sliderValue}% 0 0)`
            }}
          />
        )}
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            borderRadius: '5px'
          }}
        />
        {isSliderVisible && (
          <>
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'rgba(255, 255, 255, 0.5)',
                padding: '2px 5px',
                borderRadius: '5px',
                fontSize: '12px'
              }}
            >
              Before
            </div>

            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'rgba(255, 255, 255, 0.5)',
                padding: '2px 5px',
                borderRadius: '5px',
                fontSize: '12px'
              }}
            >
              After
            </div>
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
                  cursor: isDragging ? 'grabbing' : 'grab',
                  pointerEvents: 'auto'
                }}
              />
            </svg>
          </>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '10px',
          width: '40%',
          marginTop: '15px'
        }}
      >
        <div style={{ fontSize: '20px', marginLeft: '20px', fontWeight: 'bold' }}>-</div>

        <style>
          {`
              input[type="range"] {
                height: 15px;
                -webkit-appearance: none;
                background: #4a4a4a;
                border-radius: 5px;
              }
              input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 25px;
                height: 15px;
                border-radius: 5px;
                background: #0d80fb;
                cursor: pointer;
              }
            `}
        </style>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.01"
          value={saturationValue}
          onChange={(e) => setSaturationValue(parseFloat(e.target.value))}
          style={{ width: '100%', marginTop: '3px', padding: '0px 0px' }}
        />
        <div style={{ fontSize: '20px', fontWeight: 'bold' }}>+</div>

        <button
          onClick={() => setSaturationValue(0)}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: '0px 0px',
            marginTop: '2px',
            display: 'flex'
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
      <button
        onClick={toggleSliderVisibility}
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          width: '30px',
          height: '30px',
          background: 'rgba(0, 0, 0, 0.5)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '5px'
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="4" width="16" height="16" rx="2" />
          {!isSliderVisible && (
            <rect x="4" y="4" width="8" height="16" rx="1" fill="rgba(128, 128, 128, 0.5)" />
          )}
        </svg>
      </button>
    </div>
  )
}

export default ImageEditor
