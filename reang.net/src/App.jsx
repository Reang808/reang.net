import {Routes, Route } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import Dashboard from '../pages/Dashboard'
import Tasks from '../pages/Tasks'
import Customers from '../pages/Customers'
import CustomerDetail from '../pages/CustomerDetail'
import Schedule from '../pages/Schedule'

function App() {
  return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 bg-gray-50">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/schedule" element={<Schedule />} />
            </Routes>
          </main>
        </div>
      </div>
   
  )
}

export default App