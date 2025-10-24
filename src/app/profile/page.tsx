"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/user-context";
import { AlertModal } from "@/components/alert-modal";
import {
  User,
  Camera,
  Mail,
  Lock,
  Save,
  Eye,
  EyeOff,
  Shield,
  Calendar,
  KeyRound,
  Info,
} from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // User data state
  const [userData, setUserData] = useState({
    email: user?.email || "",
    role: user?.role || "user",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    createdAt: user?.createdAt || "",
  });

  // Fetch latest user data from database on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?._id) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/${user._id}`);
        const data = await response.json();

        if (data.success) {
          console.log("Fetched user data from database:", data.data);
          // Update both context and local state with fresh data
          setUser(data.data);
          setUserData({
            email: data.data.email,
            role: data.data.role,
            firstName: data.data.firstName || "",
            lastName: data.data.lastName || "",
            phone: data.data.phone || "",
            createdAt: data.data.createdAt,
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user?._id, setUser]);

  // Update userData when user context changes
  useEffect(() => {
    if (user) {
      setUserData({
        email: user.email,
        role: user.role,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        createdAt: user.createdAt,
      });
    }
  }, [user]);

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update avatar preview when user context changes
  useEffect(() => {
    if (user?.avatar && !avatarFile) {
      setAvatarPreview(user.avatar);
    }
  }, [user, avatarFile]);

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Alert modal state
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "warning" | "info",
  });

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "warning" | "info" = "info"
  ) => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertModal({ ...alertModal, isOpen: false });
  };

  // Loading states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        showAlert("Invalid File Type", "Please upload an image file", "warning");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showAlert("File Too Large", "Image size should be less than 5MB", "warning");
        return;
      }

      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      if (!user) {
        showAlert("Authentication Error", "User not found. Please log in again.", "error");
        setIsSavingProfile(false);
        return;
      }

      // Prepare update data
      const updateData = {
        userId: user._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        avatar: avatarPreview || user.avatar,
      };

      console.log("Saving profile data:", updateData);

      // Call API to update profile
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      console.log("Profile update response:", data);

      if (data.success) {
        // Update user context with new data
        setUser(data.data);
        showAlert("Success", "Profile updated successfully!", "success");
      } else {
        showAlert("Update Failed", data.message || "Failed to update profile", "error");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showAlert("Error", "Failed to update profile", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);

    // Validation
    if (!passwordData.currentPassword) {
      showAlert("Validation Error", "Please enter your current password", "warning");
      setIsSavingPassword(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showAlert("Validation Error", "New password must be at least 6 characters", "warning");
      setIsSavingPassword(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showAlert("Validation Error", "New passwords do not match", "warning");
      setIsSavingPassword(false);
      return;
    }

    try {
      if (!user) {
        showAlert("Authentication Error", "User not found. Please log in again.", "error");
        setIsSavingPassword(false);
        return;
      }

      // Call API to update password
      const response = await fetch("/api/auth/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showAlert("Success", "Password changed successfully!", "success");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        showAlert("Update Failed", data.message || "Failed to change password", "error");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      showAlert("Error", "Failed to change password", "error");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    return role === "manager"
      ? "bg-purple-100 text-purple-800 border-purple-200"
      : "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getRoleIcon = (role: string) => {
    return role === "manager" ? (
      <Shield className="h-4 w-4" />
    ) : (
      <User className="h-4 w-4" />
    );
  };

  // Show loading spinner while fetching profile data
  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#3867d6] border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Avatar & Quick Info */}
        <div className="lg:col-span-1 space-y-5">
          <Card className="p-5">
            <div className="flex flex-col items-center text-center space-y-3">
              {/* Avatar */}
              <div className="relative">
                {avatarPreview ? (
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={avatarPreview} alt="Profile" />
                    <AvatarFallback className="bg-[#3867d6]/10 text-[#3867d6] text-3xl">
                      {userData.firstName && userData.lastName
                        ? `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase()
                        : userData.email?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-32 w-32 rounded-full bg-[#3867d6]/10 flex items-center justify-center">
                    <User className="h-16 w-16 text-[#3867d6]" />
                  </div>
                )}
                <Button
                  type="button"
                  size="icon"
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full"
                  onClick={handleAvatarClick}
                >
                  <Camera className="h-5 w-5" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* User Info */}
              <div className="space-y-1.5">
                              <h3 className="text-xl font-semibold">
                                {userData.firstName && userData.lastName 
                                  ? `${userData.firstName} ${userData.lastName}`
                                  : userData.firstName || userData.lastName || userData.email}
                              </h3>
                              {(userData.firstName || userData.lastName) && (
                                <p className="text-sm text-muted-foreground">{userData.email}</p>
                              )}
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full border ${getRoleBadgeClass(
                    userData.role
                  )}`}
                >
                  {getRoleIcon(userData.role)}
                  <span className="capitalize">{userData.role}</span>
                </span>
              </div>

              {/* Additional Info */}
              <div className="w-full pt-3 border-t space-y-1.5">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-xs">{userData.email}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">
                    Joined {new Date(userData.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground pt-1.5">
                Upload a new avatar by clicking the camera icon. Max size: 5MB
              </p>
            </div>
          </Card>

          {/* Account Information */}
          <Card className="p-5">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Info className="h-5 w-5 text-[#3867d6]" />
              Account Information
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Account Role</span>
                <span className="font-medium capitalize">{userData.role}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-muted-foreground">Account Created</span>
                <span className="font-medium">
                  {new Date(userData.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Account Status</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-200">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Active
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-5">
          {/* Personal Information */}
          <Card className="p-5">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-[#3867d6]" />
              Personal Information
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={userData.firstName}
                    onChange={(e) =>
                      setUserData({ ...userData, firstName: e.target.value })
                    }
                    placeholder="John"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={userData.lastName}
                    onChange={(e) =>
                      setUserData({ ...userData, lastName: e.target.value })
                    }
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  disabled
                  className="bg-muted cursor-not-allowed"
                  placeholder="john.doe@example.com"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={userData.phone}
                  onChange={(e) =>
                    setUserData({ ...userData, phone: e.target.value })
                  }
                  placeholder="+1 234 567 8900"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSavingProfile}>
                <Save className="h-4 w-4 mr-2" />
                {isSavingProfile ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Card>

          {/* Change Password */}
          <Card className="p-5">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-[#3867d6]" />
              Change Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Enter new password (min. 6 characters)"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="secondary"
                disabled={isSavingPassword}
              >
                <Lock className="h-4 w-4 mr-2" />
                {isSavingPassword ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}

