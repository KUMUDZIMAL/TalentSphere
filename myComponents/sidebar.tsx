import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export function Sidebar() {
  return (
    <aside className="w-0.75 lg:w-80 space-y-6 p-4 bg-gradient-to-b from-[#e0f5e9] via-[#d1f0e0] via-[#c2ebd7] via-[#b3e6ce] via-[#a4e1c5] via-[#95dcbc] to-[#86d7b3]">
      <Card className="bg-white/90 border-green-200 text-gray-800">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <img src="../noDpImage.jpg" alt="User avatar" className="w-16 h-16 rounded-full" />
            <div>
              <h2 className="font-semibold text-lg">Emma Thompson</h2>
              <p className="text-sm text-green-700">Actress | Singer | Dancer</p>
            </div>
          </div>
          <Link href="/profile" passHref>
            <Button className="w-full mt-4" variant="outline">
              View Full Profile
            </Button>
          </Link>
        </CardContent>
      </Card>
      <Card className="bg-white/90 border-green-200 text-gray-800">
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Auditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { title: "Lead Role in 'Starlight'", date: "June 15, 2023" },
            { title: "Voice Over for Animated Series", date: "June 20, 2023" },
            { title: "Dance Ensemble for Music Video", date: "June 25, 2023" },
          ].map((audition, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{audition.title}</h3>
                <p className="text-sm text-green-700">{audition.date}</p>
              </div>
              <Button variant="outline" size="sm" className="text-green-700 border-green-300 hover:bg-green-50">
                Details
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </aside>
  )
}

