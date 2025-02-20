import Versions from './components/Versions'
import ImageEditor from './components/ImageEditor'

function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <div className="text">
        <span className="ts">WebGPU</span>
      </div>
      <div className="title">Grayscale Adjustment</div>
      <div className="image-container">
        <img src="/dog.jpeg" style={{ borderRadius: '5px' }} />
        <ImageEditor grayscaleFactor={0.5} src="/dog.jpeg" />
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
