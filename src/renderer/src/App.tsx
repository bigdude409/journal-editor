import Versions from './components/Versions'
// import electronLogo from './assets/electron.svg'

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
      <Versions></Versions>
    </>
  )
}

export default App
