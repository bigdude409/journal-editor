import ImageEditor from './components/ImageEditor'

import { useState } from 'react'

function App(): JSX.Element {
  const [selectedImage, setSelectedImage] = useState<string>('')

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
      <div className="">
        <span className="">Saturation Adjustment (WebGPU)</span>
      </div>

      <div className="image-container">
        <ImageEditor src={selectedImage} width={800} height={800} />
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
    </>
  )
}

export default App
