import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Image, ThumbsUp, MessageCircle, Share2, Video, Music } from "lucide-react"

export function Feed() {
  return (
    <div className="space-y-6 p-4 bg-gradient-to-b from-[#f0f9f6] via-[#e1f3ed] via-[#d2ede4] via-[#c3e7db] via-[#b4e1d2] via-[#a5dbc9] to-[#96d5c0]">
      <Card className="bg-white/90 border-green-200">
        <CardHeader>
          <Textarea
            placeholder="Share your latest performance, project, or thoughts..."
            className="border-green-200 focus:border-green-300 focus:ring-green-300"
          />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: Image, label: "Photo" },
              { icon: Video, label: "Video" },
              { icon: Music, label: "Audio" },
              { icon: null, label: "Event" },
              { icon: null, label: "Portfolio Update" },
            ].map((item, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-green-700 border-green-300 hover:bg-green-50"
              >
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                {item.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      {[
        {
          user: "John Actor",
          role: "Actor",
          content: "Just wrapped up filming for my latest project! Can't wait to share more details soon.",
          image: "../actor.jpg?height=100&width=400&text=Film+Set",
          tags: ["Film", "Acting"],
        },
        {
          user: "Sarah Singer",
          role: "Singer-Songwriter",
          content: "New single dropping next week! Here's a sneak peek of the recording session.",
          image: "../singer.jpeg?height=100&width=400&text=Recording+Studio",
          tags: ["Music", "Single Release"],
        },
        {
          user: "Mike Dancer",
          role: "Choreographer",
          content: "Looking for talented dancers for an upcoming music video shoot. DM for details!",
          image: "../dancer.jpg?height=100&width=400&text=Dance+Audition",
          tags: ["Dance", "Audition", "Music Video"],
        },
      ].map((post, index) => (
        <Card key={index} className="bg-white/90 border-green-200">
          <CardHeader>
            <div className="flex items-center">
            <img src="../noDpImage.jpg" alt="User avatar" className="w-16 h-16 rounded-full" />
              
              <div>
                <h3 className="font-semibold text-green-800">{post.user}</h3>
                <p className="text-sm text-green-600">{post.role}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-800">{post.content}</p>
            <img
              src={post.image || "../singer.jpeg"}
              alt={`${post.user}'s post`}
              className="w-1/2 rounded-lg mb-4"
            />
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex space-x-4">
              {[
                { icon: ThumbsUp, label: "Applaud" },
                { icon: MessageCircle, label: "Comment" },
                { icon: Share2, label: "Share" },
              ].map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="text-green-700 hover:bg-green-50 hover:text-green-800"
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

