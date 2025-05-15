import ImageEditor from './components/ImageEditor'

import { useState } from 'react'

declare global {
  interface Window {
    api: {
      toggleKiosk: (value: boolean) => Promise<void>
    }
  }
}

function App(): JSX.Element {
  const [selectedImage, setSelectedImage] = useState<string>('')
  // Kiosk mode state
  const [isKiosk, setIsKiosk] = useState<boolean>(false)

  const handleFileSelect = async (): Promise<void> => {
    const filePath = await window.electron.ipcRenderer.invoke(
      'select-file',
      '~/Projects/photo-journal-editor/public/media'
    )
    if (filePath) {
      setSelectedImage(`/media/${filePath.split('/').pop()}`)
    }
  }

  // Toggle kiosk mode via API
  const handleToggleKiosk = async (): Promise<void> => {
    const newVal = !isKiosk
    await window.api.toggleKiosk(newVal)
    setIsKiosk(newVal)
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
        {/* Kiosk mode toggle */}
        <label
          onClick={handleToggleKiosk}
          style={{
            display: 'inline-block',
            marginLeft: '20px',
            padding: '8px 16px',
            backgroundColor: '#007acc',
            border: 'none',
            borderRadius: '20px',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          {isKiosk ? 'Exit Kiosk Mode' : 'Enter Kiosk Mode'}
        </label>
      </div>
    </>
  )
}

export default App
