"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Brain, Plus, Trash2, Eye, Download, Save, Sparkles, Target, Copy, Wand2 } from "lucide-react"

const aiRecommendations = [
  {
    section: "Professional Summary",
    suggestion: "Add quantifiable achievements and specific technologies",
    priority: "High",
    example:
      "Results-driven Full Stack Developer with 5+ years of experience building scalable web applications using React, Node.js, and AWS, delivering 20% faster load times and serving 100K+ users.",
  },
  {
    section: "Experience",
    suggestion: "Include more metrics and impact statements",
    priority: "High",
    example: "• Developed and deployed 15+ React applications, increasing user engagement by 35%",
  },
  {
    section: "Skills",
    suggestion: "Add trending technologies: React, AWS, Docker",
    priority: "Medium",
    example: "Frontend: React, TypeScript, Next.js | Backend: Node.js, Python | Cloud: AWS, Docker",
  },
  {
    section: "Education",
    suggestion: "Add relevant certifications and online courses",
    priority: "Low",
    example: "AWS Certified Solutions Architect (2024), React Developer Certification",
  },
]

const resumeTemplates = [
  { id: "modern", name: "Modern Professional", description: "Clean design with accent colors" },
  { id: "classic", name: "Classic ATS", description: "Traditional format optimized for ATS" },
  { id: "creative", name: "Creative Design", description: "Unique layout for creative roles" },
  { id: "minimal", name: "Minimal Clean", description: "Simple and elegant design" },
]

export default function ResumeBuilderPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("modern")
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/johndoe",
      portfolio: "johndoe.dev",
    },
    summary: "Experienced software developer with expertise in full-stack development...",
    experience: [
      {
        id: 1,
        title: "Senior Software Engineer",
        company: "Tech Innovations Inc.",
        location: "San Francisco, CA",
        startDate: "2022-01",
        endDate: "Present",
        description:
          "• Led development of React-based web applications\n• Collaborated with cross-functional teams\n• Implemented CI/CD pipelines",
      },
    ],
    education: [
      {
        id: 1,
        degree: "Bachelor of Science in Computer Science",
        school: "Stanford University",
        location: "Stanford, CA",
        graduationDate: "2020-05",
      },
    ],
    skills: ["JavaScript", "React", "Node.js", "Python", "AWS"],
    certifications: [],
  })

  const [activeRecommendation, setActiveRecommendation] = useState(null)

  const applyRecommendation = (recommendation) => {
    // Simulate applying AI recommendation
    console.log("Applying recommendation:", recommendation)
    setActiveRecommendation(null)
  }

  const addExperience = () => {
    const newExp = {
      id: Date.now(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    }
    setResumeData((prev) => ({
      ...prev,
      experience: [...prev.experience, newExp],
    }))
  }

  const removeExperience = (id) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Resume Builder</h1>
          <p className="text-muted-foreground">Create and optimize your resume with AI-powered recommendations</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Resume
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="content" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="optimize">AI Optimize</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={resumeData.personalInfo.fullName}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, fullName: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, email: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, phone: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={resumeData.personalInfo.location}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, location: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={resumeData.personalInfo.linkedin}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, linkedin: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="portfolio">Portfolio</Label>
                      <Input
                        id="portfolio"
                        value={resumeData.personalInfo.portfolio}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, portfolio: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif">Professional Summary</CardTitle>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Wand2 className="h-4 w-4" />
                      AI Enhance
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Write a compelling professional summary..."
                    value={resumeData.summary}
                    onChange={(e) => setResumeData((prev) => ({ ...prev, summary: e.target.value }))}
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Experience */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif">Work Experience</CardTitle>
                    <Button onClick={addExperience} size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Experience
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {resumeData.experience.map((exp, index) => (
                    <div key={exp.id} className="space-y-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Experience {index + 1}</h4>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                            <Wand2 className="h-4 w-4" />
                            AI Improve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeExperience(exp.id)}
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Job Title</Label>
                          <Input
                            value={exp.title}
                            onChange={(e) => {
                              const updated = resumeData.experience.map((item) =>
                                item.id === exp.id ? { ...item, title: e.target.value } : item,
                              )
                              setResumeData((prev) => ({ ...prev, experience: updated }))
                            }}
                            placeholder="Senior Software Engineer"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Company</Label>
                          <Input
                            value={exp.company}
                            onChange={(e) => {
                              const updated = resumeData.experience.map((item) =>
                                item.id === exp.id ? { ...item, company: e.target.value } : item,
                              )
                              setResumeData((prev) => ({ ...prev, experience: updated }))
                            }}
                            placeholder="Tech Company Inc."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Location</Label>
                          <Input
                            value={exp.location}
                            onChange={(e) => {
                              const updated = resumeData.experience.map((item) =>
                                item.id === exp.id ? { ...item, location: e.target.value } : item,
                              )
                              setResumeData((prev) => ({ ...prev, experience: updated }))
                            }}
                            placeholder="San Francisco, CA"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Duration</Label>
                          <div className="flex gap-2">
                            <Input
                              value={exp.startDate}
                              onChange={(e) => {
                                const updated = resumeData.experience.map((item) =>
                                  item.id === exp.id ? { ...item, startDate: e.target.value } : item,
                                )
                                setResumeData((prev) => ({ ...prev, experience: updated }))
                              }}
                              placeholder="2022-01"
                            />
                            <Input
                              value={exp.endDate}
                              onChange={(e) => {
                                const updated = resumeData.experience.map((item) =>
                                  item.id === exp.id ? { ...item, endDate: e.target.value } : item,
                                )
                                setResumeData((prev) => ({ ...prev, experience: updated }))
                              }}
                              placeholder="Present"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={exp.description}
                          onChange={(e) => {
                            const updated = resumeData.experience.map((item) =>
                              item.id === exp.id ? { ...item, description: e.target.value } : item,
                            )
                            setResumeData((prev) => ({ ...prev, experience: updated }))
                          }}
                          placeholder="• Describe your key achievements and responsibilities..."
                          rows={4}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-serif">Skills</CardTitle>
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Target className="h-4 w-4" />
                      Skill Suggestions
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="gap-2">
                          {skill}
                          <button
                            onClick={() => {
                              const updated = resumeData.skills.filter((_, i) => i !== index)
                              setResumeData((prev) => ({ ...prev, skills: updated }))
                            }}
                            className="hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input placeholder="Add a skill..." />
                      <Button size="sm">Add</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="design" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Choose Template</CardTitle>
                  <CardDescription>Select a professional template for your resume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {resumeTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedTemplate === template.id
                            ? "border-emerald-600 bg-emerald-50"
                            : "hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <div className="aspect-[3/4] bg-gray-100 rounded mb-3 flex items-center justify-center">
                          <FileText className="h-12 w-12 text-gray-400" />
                        </div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="optimize" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <Brain className="h-5 w-5 text-emerald-600" />
                    AI Recommendations
                  </CardTitle>
                  <CardDescription>Improve your resume with AI-powered suggestions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiRecommendations.map((rec, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                            <Sparkles className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{rec.section}</h4>
                            <Badge
                              variant={
                                rec.priority === "High"
                                  ? "default"
                                  : rec.priority === "Medium"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {rec.priority} Priority
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveRecommendation(activeRecommendation === index ? null : index)}
                            className="bg-transparent"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" onClick={() => applyRecommendation(rec)}>
                            Apply
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.suggestion}</p>
                      {activeRecommendation === index && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium mb-2">Example:</p>
                          <p className="text-sm text-muted-foreground">{rec.example}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resume Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[3/4] bg-gray-50 border rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Resume preview</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 bg-transparent">
                <Copy className="h-4 w-4" />
                Duplicate Resume
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 bg-transparent">
                <Brain className="h-4 w-4" />
                AI Content Generator
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 bg-transparent">
                <Target className="h-4 w-4" />
                Job Match Analysis
              </Button>
            </CardContent>
          </Card>

          {/* Resume Score */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Resume Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">82%</div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Content Quality</span>
                  <span className="font-medium">85%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>ATS Compatibility</span>
                  <span className="font-medium">90%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Keyword Match</span>
                  <span className="font-medium">70%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
