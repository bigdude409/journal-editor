import Versions from './components/Versions'
import ImageEditor from './components/ImageEditor'
import ImageSlider from './components/ImageSlider'

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
        <span className="ts">Saturation Adjustment (WebGPU)</span>
      </div>

      <div className="image-container">
        <ImageSlider
          topImageSrc={selectedImage}
          bottomImageSrc={'/media/DSC_0375.JPG'}
          width={800}
          height={800}
        />
        <ImageEditor initialFactor={0.0} src={selectedImage} width={800} height={800} />
      </div>

      <div style={{ textAlign: 'center', padding: '10px 0px' }}>
        <label
          onClick={handleFileSelect}
          style={{
            display: 'inline-block',
            marginBottom: '1rem',
            padding: '8px 16px',
            backgroundColor: '#2c2c2c',
            border: 'none',
            borderRadius: '20px',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Select Image
        </label>
        <span className="title" style={{ marginLeft: '10px' }}>
          {selectedImage}
        </span>
      </div>

      <Versions></Versions>
    </>
  )
}

export default App
