import Versions from './components/Versions'
import ImageEditor from './components/ImageEditor'
import { useState } from 'react'

function App(): JSX.Element {
  const [selectedImage, setSelectedImage] = useState<string>('/media/DSC_0374.JPG')

  const handleFileSelect = async (): Promise<void> => {
    const filePath = await window.electron.ipcRenderer.invoke(
      'select-file',
      '~/Projects/photo-journal-editor/public/media'
    )
    if (filePath) {
      setSelectedImage(`/media/${filePath.split('/').pop()}`)
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
          onClick={handleFileSelect}
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
      </div>

      <Versions></Versions>
    </>
  )
}

export default App
