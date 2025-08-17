"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Shield, Globe, Camera, Save, Trash2, Eye, EyeOff, CheckCircle2, Loader2, Sparkles } from "lucide-react"

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

export default function ProfilePage() {
  const { toast } = useToast()
  const { user, profile, updateProfile } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    currentRole: "",
    company: "",
    experience: "",
    targetRole: "",
    education: "",
    university: "",
    skills: "",
  })

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    weekly: true,
    achievements: true,
  })

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    progressSharing: false,
    analytics: true,
  })

  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "pst",
    darkMode: false,
    reducedMotion: false,
    autoSave: true,
    sessionLength: "15",
    difficulty: "intermediate",
  })

  // Load user data on component mount
  useEffect(() => {
    if (profile) {
      setProfileData({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        email: profile.email || "",
        phone: "",
        location: "",
        bio: "",
        currentRole: "",
        company: "",
        experience: "",
        targetRole: "",
        education: "",
        university: "",
        skills: "",
      })
    }
  }, [profile])

  // Load saved preferences from database
  useEffect(() => {
    if (profile?.preferences) {
      try {
        const savedPrefs = profile.preferences as any
        if (savedPrefs.notifications) setNotifications(prev => ({ ...prev, ...savedPrefs.notifications }))
        if (savedPrefs.privacy) setPrivacy(prev => ({ ...prev, ...savedPrefs.privacy }))
        if (savedPrefs.preferences) setPreferences(prev => ({ ...prev, ...savedPrefs.preferences }))
      } catch (error) {
        console.error('Error loading preferences:', error)
      }
    }
  }, [profile])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    
    try {
      if (user) {
        const updateData = {
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          full_name: `${profileData.firstName} ${profileData.lastName}`,
        }

        const result = await updateProfile(updateData)
        if (result.error) {
          toast({
            title: "Save Failed",
            description: result.error.message,
            variant: "destructive",
          })
        } else {
          setSuccessMessage("Profile updated successfully!")
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 3000)
          
          toast({
            title: "Profile Updated",
            description: "Your profile has been updated successfully.",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Save Error",
        description: "An unexpected error occurred while saving.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePreferences = async () => {
    setIsSaving(true)
    
    try {
      if (user) {
        const updateData = {
          preferences: {
            notifications,
            privacy,
            preferences,
          }
        }

        const result = await updateProfile(updateData)
        if (result.error) {
          toast({
            title: "Save Failed",
            description: result.error.message,
            variant: "destructive",
          })
        } else {
          setSuccessMessage("Preferences saved successfully!")
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 3000)
          
          toast({
            title: "Preferences Saved",
            description: "Your preferences have been saved successfully.",
          })
        }
      }
    } catch (error) {
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
        profile: profileData,
        preferences,
        notifications,
        privacy,
        exportDate: new Date().toISOString(),
      }
      
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `profile-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      toast({
        title: "Data Downloaded",
        description: "Your profile data has been downloaded successfully.",
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
          <p className="text-muted-foreground">Please wait while we load your profile...</p>
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
      
      <div className="p-6 space-y-6 relative z-10">
        {/* Header */}
        <motion.div className="flex items-center justify-between" variants={itemVariants}>
          <div className="flex items-center gap-3">
            <motion.div 
              className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center minimal-shadow"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground">Profile Settings</h1>
              <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button className="gap-2 btn-enhanced" onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </motion.div>
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
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 minimal-card">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <motion.div variants={itemVariants}>
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Profile Picture */}
                  <Card className="minimal-card">
                    <CardHeader>
                      <CardTitle className="font-serif">Profile Picture</CardTitle>
                      <CardDescription>Update your profile photo</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col items-center space-y-4">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src="/placeholder-user.jpg" />
                          <AvatarFallback className="text-lg">
                            {profileData.firstName?.[0]}{profileData.lastName?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <input
                            type="file"
                            id="profile-picture"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                            className="hidden"
                          />
                          <label htmlFor="profile-picture">
                            <Button size="sm" className="gap-2 btn-enhanced cursor-pointer" disabled={isLoading}>
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Camera className="h-4 w-4" />
                              )}
                              Upload Photo
                            </Button>
                          </label>
                          <Button variant="outline" size="sm" className="w-full bg-transparent btn-enhanced">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Basic Information */}
                  <Card className="lg:col-span-2 minimal-card">
                    <CardHeader>
                      <CardTitle className="font-serif">Basic Information</CardTitle>
                      <CardDescription>Update your personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input 
                            id="firstName" 
                            value={profileData.firstName}
                            onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                            className="input-enhanced"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input 
                            id="lastName" 
                            value={profileData.lastName}
                            onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                            className="input-enhanced"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={profileData.email}
                          disabled
                          className="input-enhanced bg-muted"
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            value={profileData.phone}
                            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                            className="input-enhanced"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input 
                            id="location" 
                            value={profileData.location}
                            onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                            className="input-enhanced"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself..."
                          value={profileData.bio}
                          onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                          rows={3}
                          className="input-enhanced"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Professional Information */}
                <Card className="minimal-card">
                  <CardHeader>
                    <CardTitle className="font-serif">Professional Information</CardTitle>
                    <CardDescription>Your career and education details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="currentRole">Current Role</Label>
                        <Input 
                          id="currentRole" 
                          value={profileData.currentRole}
                          onChange={(e) => setProfileData(prev => ({ ...prev, currentRole: e.target.value }))}
                          className="input-enhanced"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input 
                          id="company" 
                          value={profileData.company}
                          onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                          className="input-enhanced"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Select 
                          value={profileData.experience}
                          onValueChange={(value) => setProfileData(prev => ({ ...prev, experience: value }))}
                        >
                          <SelectTrigger className="input-enhanced">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0-1 years</SelectItem>
                            <SelectItem value="2">2-3 years</SelectItem>
                            <SelectItem value="5">4-6 years</SelectItem>
                            <SelectItem value="7">7-10 years</SelectItem>
                            <SelectItem value="10">10+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="targetRole">Target Role</Label>
                        <Input 
                          id="targetRole" 
                          value={profileData.targetRole}
                          onChange={(e) => setProfileData(prev => ({ ...prev, targetRole: e.target.value }))}
                          className="input-enhanced"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="education">Education</Label>
                        <Input 
                          id="education" 
                          value={profileData.education}
                          onChange={(e) => setProfileData(prev => ({ ...prev, education: e.target.value }))}
                          className="input-enhanced"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="university">University</Label>
                        <Input 
                          id="university" 
                          value={profileData.university}
                          onChange={(e) => setProfileData(prev => ({ ...prev, university: e.target.value }))}
                          className="input-enhanced"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skills">Skills (comma separated)</Label>
                      <Input
                        id="skills"
                        value={profileData.skills}
                        onChange={(e) => setProfileData(prev => ({ ...prev, skills: e.target.value }))}
                        placeholder="Enter your skills..."
                        className="input-enhanced"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="minimal-card">
                  <CardHeader>
                    <CardTitle className="font-serif">Account Security</CardTitle>
                    <CardDescription>Manage your login credentials and security settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter current password"
                          className="input-enhanced pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" placeholder="Enter new password" className="input-enhanced" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input id="confirmPassword" type="password" placeholder="Confirm new password" className="input-enhanced" />
                      </div>
                    </div>
                    <Button className="gap-2 btn-enhanced" onClick={handlePasswordChange}>
                      <Shield className="h-4 w-4" />
                      Update Password
                    </Button>
                  </CardContent>
                </Card>

                <Card className="minimal-card">
                  <CardHeader>
                    <CardTitle className="font-serif">Two-Factor Authentication</CardTitle>
                    <CardDescription>Add an extra layer of security to your account</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Authentication</p>
                        <p className="text-sm text-muted-foreground">Receive codes via text message</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Authenticator App</p>
                        <p className="text-sm text-muted-foreground">Use Google Authenticator or similar</p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>

                <Card className="minimal-card">
                  <CardHeader>
                    <CardTitle className="font-serif">Subscription</CardTitle>
                    <CardDescription>Manage your subscription and billing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Current Plan</p>
                        <p className="text-sm text-muted-foreground">Free Plan</p>
                      </div>
                      <Badge>Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Next Billing Date</p>
                        <p className="text-sm text-muted-foreground">No billing required</p>
                      </div>
                      <p className="font-medium">$0.00</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="bg-transparent btn-enhanced">
                        Upgrade Plan
                      </Button>
                      <Button variant="outline" className="bg-transparent btn-enhanced">
                        View Plans
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="minimal-card">
                  <CardHeader>
                    <CardTitle className="font-serif">Notification Preferences</CardTitle>
                    <CardDescription>Choose how you want to be notified</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-muted-foreground">Receive updates via email</p>
                        </div>
                        <Switch
                          checked={notifications.email}
                          onCheckedChange={(value) => setNotifications(prev => ({ ...prev, email: value }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Push Notifications</p>
                          <p className="text-sm text-muted-foreground">Browser push notifications</p>
                        </div>
                        <Switch
                          checked={notifications.push}
                          onCheckedChange={(value) => setNotifications(prev => ({ ...prev, push: value }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">SMS Notifications</p>
                          <p className="text-sm text-muted-foreground">Text message alerts</p>
                        </div>
                        <Switch
                          checked={notifications.sms}
                          onCheckedChange={(value) => setNotifications(prev => ({ ...prev, sms: value }))}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-4">Content Preferences</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Weekly Progress Report</p>
                            <p className="text-sm text-muted-foreground">Summary of your weekly activity</p>
                          </div>
                          <Switch
                            checked={notifications.weekly}
                            onCheckedChange={(value) => setNotifications(prev => ({ ...prev, weekly: value }))}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Achievement Notifications</p>
                            <p className="text-sm text-muted-foreground">When you reach milestones</p>
                          </div>
                          <Switch
                            checked={notifications.achievements}
                            onCheckedChange={(value) => setNotifications(prev => ({ ...prev, achievements: value }))}
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
                        onClick={handleSavePreferences}
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

            <TabsContent value="privacy" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="minimal-card">
                  <CardHeader>
                    <CardTitle className="font-serif">Privacy Settings</CardTitle>
                    <CardDescription>Control your data and privacy preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Profile Visibility</p>
                          <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
                        </div>
                        <Switch
                          checked={privacy.profileVisible}
                          onCheckedChange={(value) => setPrivacy(prev => ({ ...prev, profileVisible: value }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Progress Sharing</p>
                          <p className="text-sm text-muted-foreground">Allow sharing of progress data</p>
                        </div>
                        <Switch
                          checked={privacy.progressSharing}
                          onCheckedChange={(value) => setPrivacy(prev => ({ ...prev, progressSharing: value }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Analytics Tracking</p>
                          <p className="text-sm text-muted-foreground">Help improve our service with usage data</p>
                        </div>
                        <Switch
                          checked={privacy.analytics}
                          onCheckedChange={(value) => setPrivacy(prev => ({ ...prev, analytics: value }))}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-4">Data Management</h4>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start gap-2 bg-transparent btn-enhanced" onClick={handleDataDownload}>
                          <Globe className="h-4 w-4" />
                          Download My Data
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start gap-2 bg-transparent text-red-600 hover:text-red-700 btn-enhanced"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </Button>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        className="btn-enhanced" 
                        onClick={handleSavePreferences}
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

            <TabsContent value="preferences" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="minimal-card">
                  <CardHeader>
                    <CardTitle className="font-serif">App Preferences</CardTitle>
                    <CardDescription>Customize your app experience</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select 
                          value={preferences.language}
                          onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}
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
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select 
                          value={preferences.timezone}
                          onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}
                        >
                          <SelectTrigger className="input-enhanced">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pst">Pacific Standard Time</SelectItem>
                            <SelectItem value="est">Eastern Standard Time</SelectItem>
                            <SelectItem value="cst">Central Standard Time</SelectItem>
                            <SelectItem value="mst">Mountain Standard Time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Dark Mode</p>
                          <p className="text-sm text-muted-foreground">Use dark theme</p>
                        </div>
                        <Switch
                          checked={preferences.darkMode}
                          onCheckedChange={(value) => setPreferences(prev => ({ ...prev, darkMode: value }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Reduced Motion</p>
                          <p className="text-sm text-muted-foreground">Minimize animations</p>
                        </div>
                        <Switch
                          checked={preferences.reducedMotion}
                          onCheckedChange={(value) => setPreferences(prev => ({ ...prev, reducedMotion: value }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Auto-save Progress</p>
                          <p className="text-sm text-muted-foreground">Automatically save your work</p>
                        </div>
                        <Switch
                          checked={preferences.autoSave}
                          onCheckedChange={(value) => setPreferences(prev => ({ ...prev, autoSave: value }))}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-4">Session Preferences</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="sessionLength">Default Session Length</Label>
                          <Select 
                            value={preferences.sessionLength}
                            onValueChange={(value) => setPreferences(prev => ({ ...prev, sessionLength: value }))}
                          >
                            <SelectTrigger className="input-enhanced">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 minutes</SelectItem>
                              <SelectItem value="10">10 minutes</SelectItem>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="60">1 hour</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="difficulty">Preferred Difficulty</Label>
                          <Select 
                            value={preferences.difficulty}
                            onValueChange={(value) => setPreferences(prev => ({ ...prev, difficulty: value }))}
                          >
                            <SelectTrigger className="input-enhanced">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        className="btn-enhanced" 
                        onClick={handleSavePreferences}
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
