import { ElectronAPI } from '@electron-toolkit/preload'

interface Todo {
  id: number
  text: string
  completed: boolean
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getTodos: () => Promise<Todo[]>
      setTodos: (todos: Todo[]) => Promise<void>
    }
  }
}
