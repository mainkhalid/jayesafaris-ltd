import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

const Dashboard = () => {
  return (
    <div className="bg-gray-0">
      <Navbar/>
      <main className="pt-2">
        <Outlet />
      </main>
      <Footer/>
    </div>
  )
}

export default Dashboard
