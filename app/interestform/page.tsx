"use client";
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from 'next/navigation';



const interests = [
  "Acting",
  "Singing",
  "Voice Acting",
  "Filmmaking",
  "Dubbing",
  "Dancing",
  "Screenwriting",
  "Directing",
  "Cinematography",
  "Sound Design",
  "Costume Design",
  "Set Design",
  "Animation",
  "Music Composition",
  "Photography",
];

export default function InterestsForm() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null); // Allow userId to be null initially

  // Fetch userId when the component mounts
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch('/api/auth/user');
        const data = await response.json();
        setUserId(data._id); // Set the userId state
      } catch (error) {
        console.error('Failed to fetch user ID:', error);
      }
    };

    fetchUserId();
  }, []);
  const handleInterestChange = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Selected interests:", selectedInterests);
  
    try {
      const response = await fetch('/api/updateInterests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId, // Replace with the actual user ID (must be a valid ObjectId string)
          interests: selectedInterests,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log('Interests updated successfully:', data.updatedProfile);
      } else {
        console.error('Failed to update interests:', data.message);
      }
    } catch (error) {
      console.error('Error submitting interests:', error);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10A881] via-[#1BCA9B] via-[#53E0BC] via-[#75DA8B] to-[#7CEC9F] flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#10A881] to-[#7CEC9F]">
              Select Your Interests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {interests.map((interest) => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest}
                      checked={selectedInterests.includes(interest)}
                      onCheckedChange={() => handleInterestChange(interest)}
                    />
                    <Label
                      htmlFor={interest}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {interest}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#10A881] to-[#1BCA9B] text-white font-semibold hover:from-[#1BCA9B] hover:to-[#53E0BC] transition-all duration-300" onClick={() => router.push('/dashboard')}
            >
              Submit
            </Button>

            <Button
            onClick={() => router.push('/dashboard')}
           
              className="w-full bg-gradient-to-r from-[#10A881] to-[#1BCA9B] text-white font-semibold hover:from-[#1BCA9B] hover:to-[#53E0BC] transition-all duration-300"
            >
              Skip
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}