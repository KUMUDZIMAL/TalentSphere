import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Bell, Home, Search, Users, Video, Music, Theater } from "lucide-react"

export function Header() {
  return (
    <header className="bg-gradient-to-r from-[#218F76] via-[#10A881] via-[#1BCA9B] via-[#25CCF7] via-[#53E0BC] via-[#75DA8B] to-[#7CEC9F] shadow">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-white">
              TalentSphere
            </Link>
            <div className="ml-4 relative">
              <Input
                type="search"
                placeholder="Search talents, gigs, or projects"
                className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder-white/60 focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 transition-all duration-300"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
            </div>
          </div>
          <nav className="hidden md:flex space-x-4">
  {[
    { icon: Home, label: "Home" },
    { icon: Users, label: "Network" },
    { icon: Video, label: "Videos" },
    { icon: Music, label: "Music" },
    { icon: Theater, label: "Events" },
    { icon: Bell, label: "Notifications" },
  ].map((item, index) => (
    <Button
      key={index}
      variant="ghost"
      size="icon"
      className="text-white hover:bg-white/10 hover:text-white transition-colors duration-300"
    >
      <item.icon size={32} /> {/* Increased size to 32 */}
      <span className="sr-only">{item.label}</span>
    </Button>
  ))}
</nav>

          <div className="flex items-center space-x-4">
            <Link href="/profile" className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/10 hover:bg-white/20 transition-colors duration-300"
              >
                <img src="../noDpImage.jpg" alt="User avatar" className="w-8 h-8 rounded-full" />
              </Button>
              <span className="text-white font-medium">User</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

