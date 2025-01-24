import { Header } from "../../myComponents/header"
import { Sidebar } from "../../myComponents/sidebar"
import { Feed } from "../../myComponents/feed"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar />
          <main className="flex-grow">
            <Feed />
          </main>
        </div>
      </div>
    </div>
  )
}

