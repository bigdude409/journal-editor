import Versions from './components/Versions'
import ImageEditor from './components/ImageEditor'
import { useState } from 'react'

function App(): JSX.Element {
  const [selectedImage, setSelectedImage] = useState<string>('/media/DSC_0374.JPG')

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (file) {
      // const imageUrl = URL.createObjectURL(file)
      setSelectedImage(`/media/${file.name}`)
    }
  }

  return (
    <>
      <div className="text">
        <span className="ts">WebGPU Saturation Adjustment</span>
      </div>
      <div className="title">{selectedImage}</div>

      <div className="image-container">
        <img src={selectedImage} style={{ borderRadius: '5px', width: '400px', height: '400px' }} />
        <ImageEditor grayscaleFactor={0.0} src={selectedImage} width={400} height={400} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <label
          htmlFor="file-upload"
          style={{
            display: 'inline-block',
            marginBottom: '1rem',
            padding: '8px 16px',
            backgroundColor: '#2c2c2c',
            border: 'none',
            borderRadius: '20px',
            color: '#888',
            cursor: 'pointer'
          }}
        >
          Select Image
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{
            display: 'none'
          }}
        />
      </div>

      <Versions></Versions>
    </>
  )
}

export default App
