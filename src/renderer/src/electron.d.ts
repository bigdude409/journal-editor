interface IElectronAPI {
  ipcRenderer: {
    invoke(channel: 'select-file', defaultPath: string): Promise<string | null>
  }
}

declare global {
  interface Window {
    electron: IElectronAPI
  }
}

export {} 