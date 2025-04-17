import './App.css'
import { RouterProvider } from 'react-router-dom'
import { route } from './routes/Route'
import './components/styles/styles.css'
function App() {
  
  return (
    <> 
        <RouterProvider router={route}>
        </RouterProvider>
      
    </>
  )
}

export default App
