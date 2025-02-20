import Versions from './components/Versions'
import ImageEditor from './components/ImageEditor'

function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <div className="text">
        <span className="ts">WebGPU</span>
      </div>
      <div className="title">Saturation Adjustment</div>
      <div className="image-container">
        <img src="/DSC_0374.JPG" style={{ borderRadius: '5px', width: '400px', height: '400px' }} />
        <ImageEditor grayscaleFactor={0.0} src="/DSC_0374.JPG" width={400} height={400} />
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
