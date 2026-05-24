import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App'
import './index.css'

// Глобальный обработчик ошибок для отладки
window.onerror = function(msg, _url, _lineNo, _columnNo, error) {
  console.error('Runtime Error:', msg, error);
  const root = document.getElementById('root');
  if (root && root.innerHTML === '') {
    root.innerHTML = `<div style="padding: 20px; color: white; background: #800; font-family: sans-serif;">
      <h1>Произошла ошибка при запуске</h1>
      <pre>${msg}\\n${error?.stack || ''}</pre>
    </div>`;
  }
  return false;
};

// Простой компонент-предохранитель
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white p-10">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Что-то пошло не так</h1>
          <pre className="bg-black/50 p-4 rounded overflow-auto text-sm">
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 px-4 py-2 rounded"
          >
            Обновить страницу
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
)