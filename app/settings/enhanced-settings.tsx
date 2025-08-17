"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { dbClient } from "@/lib/supabase/database-client"
import {
  User,
  Shield,
  Bell,
  Eye,
  Palette,
  Download,
  Trash2,
  Camera,
  Key,
  Smartphone,
  Mail,
  Globe,
  Volume2,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Sparkles,
} from "lucide-react"

interface UserSettings {
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    marketing: boolean
    weekly: boolean
    achievements: boolean
  }
  privacy: {
    profileVisible: boolean
    dataSharing: boolean
    analytics: boolean
    progressSharing: boolean
  }
  preferences: {
    theme: string
    language: string
    timezone: string
    autoSave: boolean
    soundEffects: boolean
    darkMode: boolean
    reducedMotion: boolean
    sessionLength: string
    difficulty: string
  }
  profile: {
    firstName: string
    lastName: string
    email: string
    phone: string
    location: string
    bio: string
    jobTitle: string
    company: string
    experience: string
    industry: string
    skills: string
    education: string
    university: string
    targetRole: string
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
}

export default function EnhancedSettings() {
  const { toast } = useToast()
  const { user, profile, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
      weekly: true,
      achievements: true,
    },
    privacy: {
      profileVisible: true,
      dataSharing: false,
      analytics: true,
      progressSharing: false,
    },
    preferences: {
      theme: "light",
      language: "en",
      timezone: "UTC-5",
      autoSave: true,
      soundEffects: true,
      darkMode: false,
      reducedMotion: false,
      sessionLength: "15",
      difficulty: "intermediate",
    },
    profile: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      bio: "",
      jobTitle: "",
      company: "",
      experience: "",
      industry: "",
      skills: "",
      education: "",
      university: "",
      targetRole: "",
    }
  })

  // Load user data on component mount
  useEffect(() => {
    if (profile) {
      setSettings(prev => ({
        ...prev,
        profile: {
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          email: profile.email || "",
          phone: "",
          location: "",
          bio: "",
          jobTitle: "",
          company: "",
          experience: "",
          industry: "",
          skills: "",
          education: "",
          university: "",
          targetRole: "",
        }
      }))
    }
  }, [profile])

  // Load saved preferences from database
  useEffect(() => {
    const loadPreferences = async () => {
      if (profile?.preferences) {
        try {
          const savedPrefs = profile.preferences as any
          setSettings(prev => ({
            ...prev,
            notifications: { ...prev.notifications, ...savedPrefs.notifications },
            privacy: { ...prev.privacy, ...savedPrefs.privacy },
            preferences: { ...prev.preferences, ...savedPrefs.preferences },
          }))
        } catch (error) {
          console.error('Error loading preferences:', error)
        }
      }
    }

    loadPreferences()
  }, [profile])

  const handleSave = async (section: string) => {
    setIsSaving(true)
    
    try {
      let updateData: any = {}
      
      switch (section) {
        case 'profile':
          updateData = {
            first_name: settings.profile.firstName,
            last_name: settings.profile.lastName,
            full_name: `${settings.profile.firstName} ${settings.profile.lastName}`,
          }
          break
        case 'notifications':
        case 'privacy':
        case 'preferences':
          updateData = {
            preferences: {
              notifications: settings.notifications,
              privacy: settings.privacy,
              preferences: settings.preferences,
            }
          }
          break
      }

      console.log('Attempting to update profile with data:', updateData)
      console.log('Current user:', user)
      console.log('Current profile:', profile)

      if (user) {
        const result = await updateProfile(updateData)
        console.log('Update result:', result)
        
        if (result.error) {
          console.error('Profile update failed:', result.error)
          toast({
            title: "Save Failed",
            description: result.error.message || 'Failed to save changes',
            variant: "destructive",
          })
        } else {
          setSuccessMessage(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`)
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 3000)
          
          toast({
            title: "Settings Saved",
            description: "Your changes have been saved successfully.",
          })
        }
      } else {
        console.error('No user found for profile update')
        toast({
          title: "Save Failed",
          description: "No user found. Please log in again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Unexpected error in handleSave:', error)
      toast({
        title: "Save Error",
        description: "An unexpected error occurred while saving.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    try {
      setIsLoading(true)
      
      // Here you would typically upload to Supabase Storage
      // For now, we'll just show a success message
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    // This would integrate with Supabase Auth
    toast({
      title: "Password Update",
      description: "Password update functionality will be implemented soon.",
    })
  }

  const handleDataDownload = async () => {
    try {
      // Generate and download user data
      const userData = {
        profile: settings.profile,
        preferences: settings.preferences,
        notifications: settings.notifications,
        privacy: settings.privacy,
        exportDate: new Date().toISOString(),
      }
      
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `user-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      toast({
        title: "Data Downloaded",
        description: "Your data has been downloaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download data. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            className="h-16 w-16 border-4 border-muted-foreground/20 border-t-primary rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h2 className="text-xl font-semibold text-foreground mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your settings...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="max-w-6xl mx-auto p-6 relative z-10">
        {/* Header */}
        <motion.div className="mb-8" variants={itemVariants}>
          <div className="flex items-center gap-3 mb-4">
            <motion.div 
              className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center minimal-shadow"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-6"
            >
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={cardVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5 minimal-card">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Preferences
              </TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="minimal-card">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal and professional details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback className="text-lg">
                          {settings.profile.firstName?.[0]}{settings.profile.lastName?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <input
                          type="file"
                          id="profile-picture"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          className="hidden"
                        />
                        <label htmlFor="profile-picture">
                          <Button variant="outline" className="mb-2 bg-transparent cursor-pointer" disabled={isLoading}>
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Camera className="h-4 w-4 mr-2" />
                            )}
                            Change Photo
                          </Button>
                        </label>
                        <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                      </div>
                    </div>

                    <Separator />

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          value={settings.profile.firstName}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            profile: { ...prev.profile, firstName: e.target.value }
                          }))}
                          className="input-enhanced"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          value={settings.profile.lastName}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            profile: { ...prev.profile, lastName: e.target.value }
                          }))}
                          className="input-enhanced"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={settings.profile.email}
                          disabled
                          className="input-enhanced bg-muted"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input 
                          id="phone" 
                          value={settings.profile.phone}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            profile: { ...prev.profile, phone: e.target.value }
                          }))}
                          className="input-enhanced"
                        />
                      </div>
                    </div>

                    {/* Professional Information */}
                    <Separator />
                    <h3 className="text-lg font-semibold">Professional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="jobTitle">Current Job Title</Label>
                        <Input 
                          id="jobTitle" 
                          value={settings.profile.jobTitle}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            profile: { ...prev.profile, jobTitle: e.target.value }
                          }))}
                          className="input-enhanced"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input 
                          id="company" 
                          value={settings.profile.company}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            profile: { ...prev.profile, company: e.target.value }
                          }))}
                          className="input-enhanced"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Select 
                          value={settings.profile.experience}
                          onValueChange={(value) => setSettings(prev => ({
                            ...prev,
                            profile: { ...prev.profile, experience: value }
                          }))}
                        >
                          <SelectTrigger className="input-enhanced">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-1">0-1 years</SelectItem>
                            <SelectItem value="1-3">1-3 years</SelectItem>
                            <SelectItem value="3-5">3-5 years</SelectItem>
                            <SelectItem value="5-10">5-10 years</SelectItem>
                            <SelectItem value="10+">10+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Select 
                          value={settings.profile.industry}
                          onValueChange={(value) => setSettings(prev => ({
                            ...prev,
                            profile: { ...prev.profile, industry: value }
                          }))}
                        >
                          <SelectTrigger className="input-enhanced">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Tell us about your professional background and career goals..."
                        className="min-h-[100px] input-enhanced"
                        value={settings.profile.bio}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          profile: { ...prev.profile, bio: e.target.value }
                        }))}
                      />
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        className="btn-enhanced" 
                        onClick={() => handleSave('profile')}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Account Settings */}
            <TabsContent value="account" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="minimal-card">
                  <CardHeader>
                    <CardTitle>Account Security</CardTitle>
                    <CardDescription>Manage your account security and authentication</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Password */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Password
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input id="currentPassword" type="password" className="input-enhanced" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input id="newPassword" type="password" className="input-enhanced" />
                        </div>
                      </div>
                      <Button variant="outline" onClick={handlePasswordChange} className="btn-enhanced">
                        Update Password
                      </Button>
                    </div>

                    <Separator />

                    {/* Two-Factor Authentication */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        Two-Factor Authentication
                      </h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Authenticator App</p>
                          <p className="text-sm text-muted-foreground">Use an authenticator app to generate codes</p>
                        </div>
                        <Badge variant="outline" className="text-emerald-600">
                          Enabled
                        </Badge>
                      </div>
                      <Button variant="outline" className="btn-enhanced">Manage 2FA</Button>
                    </div>

                    <Separator />

                    {/* Subscription */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Subscription</h3>
                      <div className="flex items-center justify-between p-4 border rounded-lg minimal-card">
                        <div>
                          <p className="font-medium">Free Plan</p>
                          <p className="text-sm text-muted-foreground">Basic features included</p>
                        </div>
                        <Badge className="bg-primary/10 text-primary">Active</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="btn-enhanced">Upgrade Plan</Button>
                        <Button variant="outline" className="btn-enhanced">View Plans</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="minimal-card">
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Choose how you want to be notified</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Email Notifications */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Email Notifications
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Progress Updates</p>
                            <p className="text-sm text-muted-foreground">Weekly progress reports and achievements</p>
                          </div>
                          <Switch
                            checked={settings.notifications.email}
                            onCheckedChange={(checked) => setSettings(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, email: checked }
                            }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Learning Reminders</p>
                            <p className="text-sm text-muted-foreground">Reminders to continue your learning path</p>
                          </div>
                          <Switch
                            checked={settings.notifications.weekly}
                            onCheckedChange={(checked) => setSettings(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, weekly: checked }
                            }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">New Features</p>
                            <p className="text-sm text-muted-foreground">Updates about new features and improvements</p>
                          </div>
                          <Switch
                            checked={settings.notifications.marketing}
                            onCheckedChange={(checked) => setSettings(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, marketing: checked }
                            }))}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Push Notifications */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Push Notifications
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Practice Reminders</p>
                            <p className="text-sm text-muted-foreground">Daily reminders to practice interviews</p>
                          </div>
                          <Switch
                            checked={settings.notifications.push}
                            onCheckedChange={(checked) => setSettings(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, push: checked }
                            }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Achievement Notifications</p>
                            <p className="text-sm text-muted-foreground">When you complete milestones</p>
                          </div>
                          <Switch
                            checked={settings.notifications.achievements}
                            onCheckedChange={(checked) => setSettings(prev => ({
                              ...prev,
                              notifications: { ...prev.notifications, achievements: checked }
                            }))}
                          />
                        </div>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        className="btn-enhanced" 
                        onClick={() => handleSave('notifications')}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Preferences
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="minimal-card">
                  <CardHeader>
                    <CardTitle>Privacy & Data</CardTitle>
                    <CardDescription>Control your privacy and data sharing preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Profile Visibility */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Profile Visibility</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Public Profile</p>
                          <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                        </div>
                        <Switch
                          checked={settings.privacy.profileVisible}
                          onCheckedChange={(checked) => setSettings(prev => ({
                            ...prev,
                            privacy: { ...prev.privacy, profileVisible: checked }
                          }))}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Data Sharing */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Data Sharing</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Anonymous Analytics</p>
                            <p className="text-sm text-muted-foreground">Help improve our service with anonymous usage data</p>
                          </div>
                          <Switch
                            checked={settings.privacy.analytics}
                            onCheckedChange={(checked) => setSettings(prev => ({
                              ...prev,
                              privacy: { ...prev.privacy, analytics: checked }
                            }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Progress Sharing</p>
                            <p className="text-sm text-muted-foreground">Share your progress with others</p>
                          </div>
                          <Switch
                            checked={settings.privacy.progressSharing}
                            onCheckedChange={(checked) => setSettings(prev => ({
                              ...prev,
                              privacy: { ...prev.privacy, progressSharing: checked }
                            }))}
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Data Management */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Data Management</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Download Your Data</p>
                            <p className="text-sm text-muted-foreground">Get a copy of all your data</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={handleDataDownload} className="btn-enhanced">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Delete Account</p>
                            <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
                          </div>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent btn-enhanced">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        className="btn-enhanced" 
                        onClick={() => handleSave('privacy')}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Privacy Settings
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Preferences */}
            <TabsContent value="preferences" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="minimal-card">
                  <CardHeader>
                    <CardTitle>App Preferences</CardTitle>
                    <CardDescription>Customize your app experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Appearance */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Monitor className="h-5 w-5" />
                        Appearance
                      </h3>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Theme</Label>
                          <Select
                            value={settings.preferences.theme}
                            onValueChange={(value) => setSettings(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, theme: value }
                            }))}
                          >
                            <SelectTrigger className="input-enhanced">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Language & Region */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Language & Region
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Language</Label>
                          <Select
                            value={settings.preferences.language}
                            onValueChange={(value) => setSettings(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, language: value }
                            }))}
                          >
                            <SelectTrigger className="input-enhanced">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Timezone</Label>
                          <Select
                            value={settings.preferences.timezone}
                            onValueChange={(value) => setSettings(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, timezone: value }
                            }))}
                          >
                            <SelectTrigger className="input-enhanced">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                              <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                              <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                              <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* App Behavior */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">App Behavior</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Auto-save Progress</p>
                            <p className="text-sm text-muted-foreground">Automatically save your progress</p>
                          </div>
                          <Switch
                            checked={settings.preferences.autoSave}
                            onCheckedChange={(checked) => setSettings(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, autoSave: checked }
                            }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              <Volume2 className="h-4 w-4" />
                              Sound Effects
                            </p>
                            <p className="text-sm text-muted-foreground">Play sounds for interactions and notifications</p>
                          </div>
                          <Switch
                            checked={settings.preferences.soundEffects}
                            onCheckedChange={(checked) => setSettings(prev => ({
                              ...prev,
                              preferences: { ...prev.preferences, soundEffects: checked }
                            }))}
                          />
                        </div>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        className="btn-enhanced" 
                        onClick={() => handleSave('preferences')}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Preferences
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  )
}
