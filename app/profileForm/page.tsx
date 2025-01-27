"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"

const professions = [
  "Actor",
  "Singer",
  "Dancer",
  "Voice Actor",
  "Dubbing Artist",
  "Filmmaker",
  "Director",
  "Screenwriter",
  "Cinematographer",
  "Sound Designer",
  "Costume Designer",
  "Set Designer",
  "Animator",
  "Music Composer",
  "Photographer",
]

interface Experience {
  title: string
  description: string
}

interface FormData {
  professions: string[]
  skills: string[]
  experiences: Experience[]
  about: string
}

export default function ProfileForm() {
  const [formData, setFormData] = useState<FormData>({
    professions: [],
    skills: [],
    experiences: [],
    about: "",
  })
  const [newSkill, setNewSkill] = useState("")
  const [newExperience, setNewExperience] = useState<Experience>({ title: "", description: "" })

  const handleProfessionChange = (profession: string) => {
    setFormData((prev) => ({
      ...prev,
      professions: prev.professions.includes(profession)
        ? prev.professions.filter((p) => p !== profession)
        : [...prev.professions, profession],
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }))
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault()
    if (newExperience.title.trim() && newExperience.description.trim()) {
      setFormData((prev) => ({
        ...prev,
        experiences: [...prev.experiences, { ...newExperience }],
      }))
      setNewExperience({ title: "", description: "" })
    }
  }

  const handleRemoveExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form data:", formData)
    // Here you would typically send the data to your backend
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10A881] via-[#1BCA9B] via-[#53E0BC] via-[#75DA8B] to-[#7CEC9F] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#10A881] to-[#7CEC9F]">
              Tell Us More About Yourself
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Professions</h3>
              <ScrollArea className="h-[200px] pr-4 border rounded-md p-4">
                <div className="space-y-2">
                  {professions.map((profession) => (
                    <div key={profession} className="flex items-center space-x-2">
                      <Checkbox
                        id={profession}
                        checked={formData.professions.includes(profession)}
                        onCheckedChange={() => handleProfessionChange(profession)}
                      />
                      <Label
                        htmlFor={profession}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {profession}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div>
              <Label htmlFor="skills" className="text-lg font-semibold">
                Skills
              </Label>
              <div className="flex mt-1 mb-2">
                <Input
                  id="skills"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Enter a skill"
                  className="mr-2"
                />
                <Button
                  type="button"
                  onClick={handleAddSkill}
                  className="bg-gradient-to-r from-[#10A881] to-[#1BCA9B] text-white font-semibold hover:from-[#1BCA9B] hover:to-[#53E0BC] transition-all duration-300"
                >
                  Add Skill
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-[#E8FFF7] text-[#10A881] px-2 py-1 rounded-full text-sm flex items-center"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 text-[#10A881] hover:text-[#1BCA9B] focus:outline-none"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="experiences" className="text-lg font-semibold">
                Experiences
              </Label>
              <div className="space-y-2 mt-1">
                <Input
                  id="experience-title"
                  value={newExperience.title}
                  onChange={(e) => setNewExperience((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Experience title"
                  className="mb-2"
                />
                <Textarea
                  id="experience-description"
                  value={newExperience.description}
                  onChange={(e) => setNewExperience((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your experience"
                  rows={3}
                />
                <Button
                  type="button"
                  onClick={handleAddExperience}
                  className="w-full bg-gradient-to-r from-[#10A881] to-[#1BCA9B] text-white font-semibold hover:from-[#1BCA9B] hover:to-[#53E0BC] transition-all duration-300"
                >
                  Add Experience
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                {formData.experiences.map((experience, index) => (
                  <div key={index} className="bg-[#E8FFF7] p-2 rounded-md relative">
                    <h4 className="font-semibold text-[#10A881]">{experience.title}</h4>
                    <p className="text-sm text-[#218F76] mt-1">{experience.description}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(index)}
                      className="absolute top-2 right-2 text-[#10A881] hover:text-[#1BCA9B] focus:outline-none"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="about" className="text-lg font-semibold">
                About You
              </Label>
              <Textarea
                id="about"
                name="about"
                value={formData.about}
                onChange={handleInputChange}
                placeholder="Tell us more about yourself, your passions, and your goals"
                className="mt-1"
                rows={6}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#10A881] to-[#1BCA9B] text-white font-semibold hover:from-[#1BCA9B] hover:to-[#53E0BC] transition-all duration-300"
            >
              Submit Profile Information
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

