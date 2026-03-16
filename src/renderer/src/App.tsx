import { useState, useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface Todo {
  id: number
  text: string
  completed: boolean
}

type Theme = 'dark' | 'light'

function App(): React.JSX.Element {
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputValue, setInputValue] = useState('')
  const [theme, setTheme] = useState<Theme>('dark')
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const initialized = useRef(false)

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = (): void => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  // Load todos from electron-store on mount
  useEffect(() => {
    window.api.getTodos().then((saved) => {
      if (saved && saved.length > 0) {
        setTodos(saved)
      } else {
        setTodos([
          { id: 1, text: 'Buy groceries', completed: false },
          { id: 2, text: 'Read a book', completed: true },
          { id: 3, text: 'Go for a walk', completed: false }
        ])
      }
      initialized.current = true
    })
  }, [])

  // Persist todos to electron-store whenever they change (after init)
  useEffect(() => {
    if (!initialized.current) return
    window.api.setTodos(todos)
  }, [todos])

  const completedCount = todos.filter((t) => t.completed).length
  const pendingCount = todos.length - completedCount

  useEffect(() => {
    if (!chartRef.current) return
    // Dispose and reinit when theme changes so ECharts picks up the right palette
    if (chartInstance.current) {
      chartInstance.current.dispose()
      chartInstance.current = null
    }
    chartInstance.current = echarts.init(chartRef.current, theme === 'dark' ? 'dark' : undefined)
    chartInstance.current.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: {
        bottom: '5%',
        left: 'center',
        textStyle: { color: theme === 'dark' ? '#bbc' : '#444' }
      },
      series: [
        {
          name: 'Task Status',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: theme === 'dark' ? '#1e1e2e' : '#f0f2f8',
            borderWidth: 2
          },
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 16, fontWeight: 'bold' }
          },
          data: [
            { value: completedCount, name: 'Completed', itemStyle: { color: '#4ade80' } },
            { value: pendingCount, name: 'Pending', itemStyle: { color: '#f87171' } }
          ]
        }
      ]
    })
  }, [theme, completedCount, pendingCount])

  const addTodo = (): void => {
    const text = inputValue.trim()
    if (!text) return
    setTodos((prev) => [...prev, { id: Date.now(), text, completed: false }])
    setInputValue('')
  }

  const toggleTodo = (id: number): void => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  const deleteTodo = (id: number): void => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') addTodo()
  }

  return (
    <div className="app-container">
      <div className="app-header">
        <h1 className="app-title">📝 Todo App v1.2</h1>
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="main-layout">
        {/* Left: Todo list */}
        <div className="todo-section">
          <div className="input-row">
            <input
              className="todo-input"
              type="text"
              placeholder="Add a new task..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="add-btn" onClick={addTodo}>
              Add
            </button>
          </div>

          <ul className="todo-list">
            {todos.length === 0 && <li className="empty-hint">No tasks yet. Add one above!</li>}
            {todos.map((todo) => (
              <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="todo-checkbox"
                />
                <span className="todo-text">{todo.text}</span>
                <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
                  ✕
                </button>
              </li>
            ))}
          </ul>

          <div className="stats">
            <span>{completedCount} completed</span>
            <span>{pendingCount} pending</span>
            <span>{todos.length} total</span>
          </div>
        </div>

        {/* Right: Pie chart */}
        <div className="chart-section">
          <h2 className="chart-title">Task Overview</h2>
          {todos.length === 0 ? (
            <div className="chart-empty">Add tasks to see the chart</div>
          ) : (
            <div ref={chartRef} className="pie-chart" />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
