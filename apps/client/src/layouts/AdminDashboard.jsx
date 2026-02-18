import { Outlet } from "react-router-dom";
import  SideBar  from "../components/shared/SideBar";
export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideBar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}