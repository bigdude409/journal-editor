import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">
        <div className="action">
          <a href="https://electron-vite.org/" target="_blank" rel="noreferrer">
            Get the Docs!
          </a>
        </div>
        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
            Ping It!
          </a>
        </div>
      </div>
      <div
        style={{
          backgroundColor: 'var(--ev-button-alt-bg)',
          borderRadius: '12px',
          padding: '0px 12px',
          marginTop: '20px' // Added margin-top to add distance from the previous element
        }}
      >
        <h1 className="text-2xl italic text-gray-500">Hello Tailwind!</h1>
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
