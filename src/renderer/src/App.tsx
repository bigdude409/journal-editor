import Versions from './components/Versions'
import ImageEditor from './components/ImageEditor'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <div className="text">
        <span className="ts">And now it begins...</span>
      </div>
      <div className="action">
        <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
          Ping!
        </a>
      </div>
      <img src="/dog.jpeg" />
      <ImageEditor />
      <Versions></Versions>
    </>
  )
}

export default App
