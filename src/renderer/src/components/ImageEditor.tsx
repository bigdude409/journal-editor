import React, { useRef, useEffect, useState } from 'react'

const ImageEditor: React.FC = () => {
  // References for canvas and WebGPU objects
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

  // State for grayscale factor controlled by the slider
  const [grayscaleFactor, setGrayscaleFactor] = useState(0.5)

  // Initialize WebGPU and set up rendering
  useEffect(() => {
    async function initWebGPU(): Promise<void> {
      // Check WebGPU support
      if (!navigator.gpu) {
        console.error('WebGPU is not supported')
        return
      }

      // Request GPU adapter and device
      const adapter = await navigator.gpu.requestAdapter()
      if (!adapter) {
        console.error('No GPU adapter found')
        return
      }
      const device = await adapter.requestDevice()
      webgpuRef.current.device = device

      // Configure canvas context
      const canvas = canvasRef.current!
      const context = canvas.getContext('webgpu')!
      context.configure({
        device,
        format: 'bgra8unorm'
      })

      // Load image and create texture
      const img = new Image()
      img.src = '/dog.jpeg' // Replace with your image path
      await new Promise((resolve) => (img.onload = resolve))
      const bitmap = await createImageBitmap(img)
      canvas.width = bitmap.width
      canvas.height = bitmap.height

      const texture = device.createTexture({
        size: { width: bitmap.width, height: bitmap.height, depthOrArrayLayers: 1 },
        format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
      })
      device.queue.copyExternalImageToTexture(
        { source: bitmap },
        { texture },
        { width: bitmap.width, height: bitmap.height }
      )

      // Define shaders in WGSL
      const shaderCode = `
        struct VertexOutput {
          @builtin(position) position: vec4<f32>,
          @location(0) texCoord: vec2<f32>,
        };

        @vertex
        fn vertex_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
          let positions = array<vec2<f32>, 4>(
            vec2<f32>(-1.0, -1.0),
            vec2<f32>(1.0, -1.0),
            vec2<f32>(-1.0, 1.0),
            vec2<f32>(1.0, 1.0)
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

        @group(0) @binding(0) var myTexture: texture_2d<f32>;
        @group(0) @binding(1) var mySampler: sampler;
        @group(0) @binding(2) var<uniform> grayscaleFactor: f32;

        @fragment
        fn fragment_main(@location(0) texCoord: vec2<f32>) -> @location(0) vec4<f32> {
          let color = textureSample(myTexture, mySampler, texCoord);
          let gray = dot(color.rgb, vec3<f32>(0.299, 0.587, 0.114));
          let finalColor = mix(color.rgb, vec3<f32>(gray), grayscaleFactor);
          return vec4<f32>(finalColor, color.a);
        }
      `

      // Create shader module and render pipeline
      const shaderModule = device.createShaderModule({ code: shaderCode })
      const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
          module: shaderModule,
          entryPoint: 'vertex_main'
        },
        fragment: {
          module: shaderModule,
          entryPoint: 'fragment_main',
          targets: [{ format: 'bgra8unorm' }]
        },
        primitive: { topology: 'triangle-strip' }
      })

      // Create uniform buffer for grayscale factor
      const uniformBuffer = device.createBuffer({
        size: 4, // Size of a single float32
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      })
      webgpuRef.current.uniformBuffer = uniformBuffer

      // Create sampler
      const sampler = device.createSampler({
        magFilter: 'linear',
        minFilter: 'linear'
      })

      // Create bind group
      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: texture.createView() },
          { binding: 1, resource: sampler },
          { binding: 2, resource: { buffer: uniformBuffer } }
        ]
      })
      webgpuRef.current.bindGroup = bindGroup

      // Define render function
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
        renderPass.draw(4, 1, 0, 0) // Draw quad with 4 vertices
        renderPass.end()
        device.queue.submit([commandEncoder.finish()])
      }

      // Store render function and perform initial render
      renderRef.current = render
      render()
    }

    initWebGPU()
  }, []) // Runs once on mount

  // Update uniform buffer and re-render on grayscaleFactor change
  useEffect(() => {
    const { device, uniformBuffer, bindGroup } = webgpuRef.current
    if (device && uniformBuffer && bindGroup && renderRef.current) {
      device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([grayscaleFactor]))
      renderRef.current()
    }
  }, [grayscaleFactor])

  // Render canvas and slider
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <canvas ref={canvasRef} />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={grayscaleFactor}
          onChange={(e) => setGrayscaleFactor(parseFloat(e.target.value))}
        />
      </div>
    </div>
  )
}

export default ImageEditor
