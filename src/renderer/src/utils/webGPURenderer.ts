interface WebGPUContext {
  device: GPUDevice | null
  uniformBuffer: GPUBuffer | null
  bindGroup: GPUBindGroup | null
  render: (() => void) | null
}

export async function initWebGPU(
  canvas: HTMLCanvasElement,
  src: string,
  saturation: number,
  canvasWidth: number | string,
  canvasHeight: number | string
): Promise<WebGPUContext> {
  if (!navigator.gpu) {
    console.error('WebGPU is not supported')
    return { device: null, uniformBuffer: null, bindGroup: null, render: null }
  }

  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) {
    console.error('No GPU adapter found')
    return { device: null, uniformBuffer: null, bindGroup: null, render: null }
  }

  const device = await adapter.requestDevice()
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
  const scaleFactor = Math.min(Number(canvasWidth) / img.width, Number(canvasHeight) / img.height)

  const aWidth = Math.max(1, Math.floor(img.width * scaleFactor))
  const aHeight = Math.max(1, Math.floor(img.height * scaleFactor))
  const scaledWidth = Math.max(aWidth, aHeight)
  const scaledHeight = Math.max(aWidth, aHeight)

  const resizedBitmap = await createImageBitmap(img, {
    resizeWidth: scaledWidth,
    resizeHeight: scaledHeight,
    resizeQuality: 'high'
  })

  const texture = device.createTexture({
    size: { width: scaledWidth, height: scaledHeight, depthOrArrayLayers: 1 },
    format: 'rgba8unorm',
    usage:
      GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
  })

  device.queue.copyExternalImageToTexture(
    { source: resizedBitmap },
    { texture },
    { width: scaledWidth, height: scaledHeight }
  )

  const widthRatio = (scaledWidth / Number(canvasWidth)) * 1.0
  const heightRatio = (scaledHeight / Number(canvasHeight)) * -1.0

  // Load shader code
  const vertexShaderResponse = await fetch('/src/shaders/vertex.wgsl')
  const fragmentShaderResponse = await fetch('/src/shaders/fragment.wgsl')
  const vertexShaderCode = await vertexShaderResponse.text()
  const fragmentShaderCode = await fragmentShaderResponse.text()

  const vertexShaderModule = device.createShaderModule({ code: vertexShaderCode })
  const fragmentShaderModule = device.createShaderModule({ code: fragmentShaderCode })

  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: { module: vertexShaderModule, entryPoint: 'vertex_main' },
    fragment: {
      module: fragmentShaderModule,
      entryPoint: 'fragment_main',
      targets: [{ format: 'bgra8unorm' }]
    },
    primitive: { topology: 'triangle-strip' }
  })

  const uniformBuffer = device.createBuffer({
    size: 12,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
  })

  const uniformData = new Float32Array([saturation, widthRatio, heightRatio])
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

  return { device, uniformBuffer, bindGroup, render }
}
