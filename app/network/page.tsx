"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserPlus, User } from "lucide-react"

interface UserData {
  id: number
  name: string
  username: string
  avatar: string
}

const mockUsers: UserData[] = [
  { id: 1, name: "Alice Johnson", username: "@alice", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 2, name: "Bob Smith", username: "@bobsmith", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 3, name: "Charlie Brown", username: "@charlieb", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 4, name: "Diana Prince", username: "@wonderwoman", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 5, name: "Ethan Hunt", username: "@mission_possible", avatar: "/placeholder.svg?height=40&width=40" },
]

export default function UserList() {
  const [users] = useState<UserData[]>(mockUsers)

  const handleFollow = (userId: number) => {
    console.log(`Following user with id: ${userId}`)
    // In a real application, this would send a request to follow the user
  }

  const handleViewProfile = (userId: number) => {
    // In a real application, this would navigate to the user's profile page
    console.log(`Viewing profile of user with id: ${userId}`)
  }

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#10A881] to-[#7CEC9F]">
            Users You May Know
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between mb-4 last:mb-0 p-3 rounded-lg hover:bg-gradient-to-r hover:from-[#E8FFF7] hover:to-[#F0FFF9] transition-all duration-300"
              >
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 ring-2 ring-[#53E0BC]">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-[#10A881] to-[#1BCA9B] text-white">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-[#218F76]">{user.username}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    className="bg-gradient-to-r from-[#10A881] to-[#1BCA9B] text-white font-semibold hover:from-[#1BCA9B] hover:to-[#53E0BC] transition-all duration-300"
                    size="sm"
                    onClick={() => handleFollow(user.id)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Follow
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#53E0BC] text-[#10A881] hover:bg-[#E8FFF7] hover:text-[#1BCA9B] transition-all duration-300"
                    onClick={() => handleViewProfile(user.id)}
                  >
                    <User className="h-4 w-4 mr-1" />
                    Profile
                  </Button>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

