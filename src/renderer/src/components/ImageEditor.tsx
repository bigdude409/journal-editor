/// <reference types="@webgpu/types" />

import { useRef, useEffect, useState } from 'react'

interface ImageEditorProps {
  grayscaleFactor?: number
  src: string
  width: number
  height: number
}

const initialGrayscaleFactor = 0.5

function ImageEditor({
  grayscaleFactor: initialFactor = initialGrayscaleFactor,
  src,
  width,
  height
}: ImageEditorProps): JSX.Element {
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
  const renderRef = useRef<(() => void) | null>(null)
  const [grayscaleFactor, setGrayscaleFactor] = useState(initialFactor)
  const [canvasWidth] = useState(width)
  const [canvasHeight] = useState(height)

  useEffect(() => {
    async function initWebGPU(): Promise<void> {
      if (!navigator.gpu) {
        console.error('WebGPU is not supported')
        return
      }
      const adapter = await navigator.gpu.requestAdapter()
      if (!adapter) {
        console.error('No GPU adapter found')
        return
      }
      const device = await adapter.requestDevice()
      webgpuRef.current.device = device

      const canvas = canvasRef.current!
      const context = canvas.getContext('webgpu')!
      context.configure({
        device,
        format: 'bgra8unorm',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST
      })

      // Load image
      const img = new Image()
      img.src = src
      await new Promise((resolve) => (img.onload = resolve))

      // Calculate scale factor to fit image within canvas
      const scaleFactor = Math.min(canvasWidth / img.width, canvasHeight / img.height)

      // Clamp scaled dimensions to a minimum of 1
      const aWidth = Math.max(1, Math.floor(img.width * scaleFactor))
      const aHeight = Math.max(1, Math.floor(img.height * scaleFactor))
      const scaledWidth = Math.max(aWidth, aHeight)
      const scaledHeight = Math.max(aWidth, aHeight)
      // const scaledHeight = 266

      // Create resized bitmap with clamped dimensions
      const resizedBitmap = await createImageBitmap(img, {
        resizeWidth: scaledWidth,
        resizeHeight: scaledHeight,
        resizeQuality: 'high'
      })

      // Create texture with matching dimensions
      const texture = device.createTexture({
        size: { width: scaledWidth, height: scaledHeight, depthOrArrayLayers: 1 },
        format: 'rgba8unorm',
        usage:
          GPUTextureUsage.TEXTURE_BINDING |
          GPUTextureUsage.COPY_DST |
          GPUTextureUsage.RENDER_ATTACHMENT
      })

      // Copy the bitmap to the texture
      device.queue.copyExternalImageToTexture(
        { source: resizedBitmap },
        { texture },
        { width: scaledWidth, height: scaledHeight }
      )

      // Calculate ratios for vertex positioning (NDC: -1 to 1)
      const widthRatio = (scaledWidth / canvasWidth) * 1
      const heightRatio = (scaledHeight / canvasHeight) * -1

      // Define shaders
      const shaderCode = `
        struct Uniforms {
          grayscaleFactor: f32,
          widthRatio: f32,
          heightRatio: f32,
        };

        struct VertexOutput {
          @builtin(position) position: vec4<f32>,
          @location(0) texCoord: vec2<f32>,
        };

        @group(0) @binding(0) var myTexture: texture_2d<f32>;
        @group(0) @binding(1) var mySampler: sampler;
        @group(0) @binding(2) var<uniform> uniforms: Uniforms;

        @vertex
        fn vertex_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
          let positions = array<vec2<f32>, 4>(
            vec2<f32>(uniforms.widthRatio, uniforms.heightRatio),
            vec2<f32>(uniforms.widthRatio, -uniforms.heightRatio),
            vec2<f32>(-uniforms.widthRatio, uniforms.heightRatio),
            vec2<f32>(-uniforms.widthRatio, -uniforms.heightRatio)
          );
          let texCoords = array<vec2<f32>, 4>(
            vec2<f32>(0.0, 1.0),
            vec2<f32>(1.0, 1.0),
            vec2<f32>(0.0, 0.0),
            vec2<f32>(1.0, 0.0)
          );
          var output: VertexOutput;
          output.position = vec4<f32>(positions[vertexIndex], 0.0, 1.0);
          output.texCoord = texCoords[vertexIndex];
          return output;
        }

        @fragment
        fn fragment_main(@location(0) texCoord: vec2<f32>) -> @location(0) vec4<f32> {
          let color = textureSample(myTexture, mySampler, texCoord);
          let gray = dot(color.rgb, vec3<f32>(0.299, 0.587, 0.114));
          let finalColor = mix(color.rgb, vec3<f32>(gray), uniforms.grayscaleFactor);
          return vec4<f32>(finalColor, color.a);
        }
      `

      const shaderModule = device.createShaderModule({ code: shaderCode })
      const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: { module: shaderModule, entryPoint: 'vertex_main' },
        fragment: {
          module: shaderModule,
          entryPoint: 'fragment_main',
          targets: [{ format: 'bgra8unorm' }]
        },
        primitive: { topology: 'triangle-strip' }
      })

      // Create uniform buffer
      const uniformBuffer = device.createBuffer({
        size: 12, // 3 floats (4 bytes each)
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      })
      webgpuRef.current.uniformBuffer = uniformBuffer
      const uniformData = new Float32Array([initialFactor, widthRatio, heightRatio])
      device.queue.writeBuffer(uniformBuffer, 0, uniformData)

      const sampler = device.createSampler({
        magFilter: 'linear',
        minFilter: 'linear'
      })

      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: texture.createView() },
          { binding: 1, resource: sampler },
          { binding: 2, resource: { buffer: uniformBuffer } }
        ]
      })
      webgpuRef.current.bindGroup = bindGroup

      function render(): void {
        const commandEncoder = device.createCommandEncoder()
        const textureView = context.getCurrentTexture().createView()
        const renderPass = commandEncoder.beginRenderPass({
          colorAttachments: [
            {
              view: textureView,
              loadOp: 'clear',
              storeOp: 'store',
              clearValue: { r: 0, g: 0, b: 0, a: 1 }
            }
          ]
        })
        renderPass.setPipeline(pipeline)
        renderPass.setBindGroup(0, bindGroup)
        renderPass.draw(4, 1, 0, 0)
        renderPass.end()
        device.queue.submit([commandEncoder.finish()])
      }

      renderRef.current = render
      render()
    }

    initWebGPU()
  }, [src, initialFactor, canvasWidth, canvasHeight])

  useEffect(() => {
    const { device, uniformBuffer } = webgpuRef.current
    if (device && uniformBuffer && renderRef.current) {
      device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([grayscaleFactor]))
      renderRef.current()
    }
  }, [grayscaleFactor])

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{ borderRadius: '5px' }}
        />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={grayscaleFactor}
          onChange={(e) => setGrayscaleFactor(parseFloat(e.target.value))}
          style={{ width: '100%', padding: '10px 0' }}
        />
      </div>
    </div>
  )
}

export default ImageEditor
