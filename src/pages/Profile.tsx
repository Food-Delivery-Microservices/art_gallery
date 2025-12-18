import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, ShoppingBag, Upload, LogOut, ArrowLeft, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSaveProfile = () => {
    // Save profile logic here
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    // Change password logic here
    setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4 sm:mb-6 hover:bg-muted"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Back to Gallery</span>
          <span className="sm:hidden">Back</span>
        </Button>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Profile
              </h1>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  {user.role.toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Logged in as {user.username}
                </span>
              </div>
            </div>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info Card */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Profile Information
                  </h2>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveProfile}>
                        Save
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Username
                    </label>
                    <Input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </Card>

              {/* Change Password Card */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Change Password
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>

                  <Button onClick={handleChangePassword} className="w-full sm:w-auto">
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>
                </div>
              </Card>
            </div>

            {/* Admin Actions Sidebar */}
            {user.role === "admin" && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Admin Actions
                  </h2>
                  <Separator className="mb-4" />
                  
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate("/admin/artworks")}
                    >
                      <Grid3x3 className="w-4 h-4 mr-2" />
                      View All Artworks
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate("/admin/purchases")}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      View Purchase Details
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate("/admin/upload")}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Artwork
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 bg-muted/50">
                  <h3 className="font-semibold text-foreground mb-2">Quick Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Artworks</span>
                      <span className="font-medium">6</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Orders</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="font-medium">₹0</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;

// Made with Bob
