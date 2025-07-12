
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Camera, Edit, Save, X, Loader2, Calendar, MapPin, Globe, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { getUserRecentActivity } from '@/lib/mockData';
import { userAPI } from '@/services/api';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: '',
    email: '',
    bio: '',
    location: '',
    website: ''
  });
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatar);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [stats, setStats] = useState({ questions: 0, answers: 0, reputation: 0, badges: 0 });

  useEffect(() => {
    if (user) {
      setEditedUser({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || 'Passionate developer who loves solving problems and sharing knowledge.',
        location: user.location || 'Unknown',
        website: user.website || ''
      });
      setAvatarPreview(user.avatar);
      setAvatarFile(null);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      userAPI.getStats().then(setStats).catch(() => setStats({ questions: 0, answers: 0, reputation: 0, badges: 0 }));
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      document.getElementById('avatar-upload-input')?.click();
    }
  };

  const handleSave = async () => {
    if (!editedUser.username.trim()) {
      toast({
        title: "Validation Error",
        description: "Username cannot be empty.",
        variant: "destructive"
      });
      return;
    }

    if (!editedUser.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email cannot be empty.",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedUser.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      let avatarData = avatarPreview;
      // If user removed the preview, fallback to DiceBear
      if (!avatarData) {
        avatarData = `https://api.dicebear.com/7.x/avataaars/svg?seed=${editedUser.email}&options[gender]=female`;
      }
      const result = await updateProfile({
        username: editedUser.username.trim(),
        email: editedUser.email.trim(),
        bio: editedUser.bio.trim(),
        location: editedUser.location.trim(),
        website: editedUser.website.trim(),
        avatar: avatarData
      });

      if (result.success) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
        setIsEditing(false);
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Failed to update profile. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedUser({
      username: user.username || '',
      email: user.email || '',
      bio: user.bio || 'Passionate developer who loves solving problems and sharing knowledge.',
      location: user.location || 'Unknown',
      website: user.website || ''
    });
    setIsEditing(false);
  };

  const recentActivity = getUserRecentActivity(user.id);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  {/* Stats Row */}
                  <div className="flex gap-4 mb-4">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-semibold">{stats.questions}</span>
                      <span className="text-xs text-muted-foreground">Questions</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-semibold">{stats.answers}</span>
                      <span className="text-xs text-muted-foreground">Answers</span>
                    </div>
                  </div>
                  <div className="relative group">
                    <Avatar className="h-24 w-24 cursor-pointer transition-all duration-200 group-hover:scale-105" onClick={handleAvatarClick}>
                      <AvatarImage src={avatarPreview} alt={user.username} />
                      <AvatarFallback className="text-2xl">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <>
                        <input
                          id="avatar-upload-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0 bg-white/80 backdrop-blur-md border border-zinc-200 shadow group-hover:scale-110"
                          onClick={handleAvatarClick}
                          type="button"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-4 text-center w-full">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={editedUser.username}
                            onChange={(e) => setEditedUser({...editedUser, username: e.target.value})}
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={editedUser.email}
                            onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                            disabled={isLoading}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={handleSave} 
                            className="flex-1"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save
                              </>
                            )}
                          </Button>
                          <Button 
                            onClick={handleCancel} 
                            variant="outline" 
                            className="flex-1"
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
                        <p className="text-gray-600 flex items-center justify-center gap-1">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </p>
                        <Badge variant="secondary" className="mt-2">
                          {user.role}
                        </Badge>
                        <Button
                          onClick={() => setIsEditing(true)}
                          variant="outline"
                          className="mt-4 w-full"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Bio</Label>
                    {isEditing ? (
                      <Textarea
                        className="w-full mt-1 resize-none"
                        rows={3}
                        value={editedUser.bio}
                        onChange={(e) => setEditedUser({...editedUser, bio: e.target.value})}
                        disabled={isLoading}
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-sm text-gray-600 mt-1">{user.bio || 'No bio provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Location
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editedUser.location}
                        onChange={(e) => setEditedUser({...editedUser, location: e.target.value})}
                        className="mt-1"
                        disabled={isLoading}
                        placeholder="Enter your location..."
                      />
                    ) : (
                      <p className="text-sm text-gray-600 mt-1">{user.location || 'Location not specified'}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Website
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editedUser.website}
                        onChange={(e) => setEditedUser({...editedUser, website: e.target.value})}
                        className="mt-1"
                        disabled={isLoading}
                        placeholder="https://your-website.com"
                      />
                    ) : (
                      user.website ? (
                        <a
                          href={user.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline mt-1 block"
                        >
                          {user.website}
                        </a>
                      ) : (
                        <p className="text-sm text-gray-600 mt-1">No website provided</p>
                      )
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Member Since
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>Your activity on StackIt</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.questions}</div>
                    <div className="text-sm text-gray-600">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.answers}</div>
                    <div className="text-sm text-gray-600">Answers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.reputation}</div>
                    <div className="text-sm text-gray-600">Reputation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.badges}</div>
                    <div className="text-sm text-gray-600">Badges</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Questions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Questions</CardTitle>
                <CardDescription>Your latest questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity
                    .filter(activity => activity.type === 'question')
                    .slice(0, 3)
                    .map((activity) => (
                      <div key={activity.id} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-medium">{activity.title}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>{activity.answers} answers</span>
                          <span>{activity.votes} votes</span>
                          <span>{formatRelativeTime(activity.createdAt)}</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {activity.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  {recentActivity.filter(activity => activity.type === 'question').length === 0 && (
                    <p className="text-gray-500 text-center py-4">No questions yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Answers */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Answers</CardTitle>
                <CardDescription>Your latest answers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity
                    .filter(activity => activity.type === 'answer')
                    .slice(0, 3)
                    .map((activity) => (
                      <div key={activity.id} className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-medium">{activity.title}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>{activity.votes} votes</span>
                          <span>{formatRelativeTime(activity.createdAt)}</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {activity.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  {recentActivity.filter(activity => activity.type === 'answer').length === 0 && (
                    <p className="text-gray-500 text-center py-4">No answers yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
