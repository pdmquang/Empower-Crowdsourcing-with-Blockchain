import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import "./main.css"

ReactDOM.createRoot(document.getElementById('root')!).render(
  /**
   * StrictMode causes Components render twice
   * @link 
   * https://stackoverflow.com/questions/60618844/react-hooks-useeffect-is-called-twice-even-if-an-empty-array-is-used-as-an-ar
   */
    <App />

)
