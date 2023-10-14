import { createRoot } from 'react-dom/client'
import '@/popup/index.css'
import '@/assets/css/tailwind.css'
import Popup from '@/components/Popup'

const container = document.getElementById('root')
if (container === null) {
  throw new Error('Root element not found')
}

const root = createRoot(container)
root.render(<Popup/>)
