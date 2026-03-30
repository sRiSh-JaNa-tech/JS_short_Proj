import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <main>
        <div className="container" style={{ color: 'black', fontSize : '24px' }}>
          <p>
            Count is : {count}
          </p>
          <div className = 'button-container'>
            <button className = 'button-prop' onClick = {()=> setCount(count + 1)}>
              Increase
            </button>
            <button className = 'button-prop' onClick = {()=>setCount(count - 1)}>
              Decrease
            </button>
          </div>
        </div>
      </main>
    </>
  )
}

export default App
