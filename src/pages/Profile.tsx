import React, { useMemo, useState } from "react";
import { useAuth, UserType } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  User,
  MapPin,
  ArrowLeft,
  Save,
  Mail,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const isNewProfile = !profile;

  const [userType, setUserType] = useState<UserType>(
    profile?.userType ?? "customer",
  );

  const [formData, setFormData] = useState({
    displayName:
      profile?.displayName ||
      user?.displayName ||
      user?.email?.split("@")[0] ||
      "",
    shopName: profile?.shopName || "",
    shopAddress: profile?.shopAddress || "",
    searchRadius: profile?.searchRadius ?? 5,
  });

  const [saving, setSaving] = useState(false);

  const hasProfile = useMemo(() => Boolean(profile), [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        displayName: formData.displayName,
        userType,
      };

      if (user?.email) payload.email = user.email;
      if (user?.uid) payload.uid = user.uid;

      if (userType === "shop") {
        payload.shopName = formData.shopName;
        payload.shopAddress = formData.shopAddress;
      }

      if (userType === "customer") {
        payload.searchRadius = formData.searchRadius;
      }

      await updateProfile(payload);

      toast.success(
        isNewProfile
          ? "Profile created successfully!"
          : "Profile updated successfully!",
      );

      // Navigate to dashboard after successful save
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/50 backdrop-blur-md">
        <div className="container mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                {isNewProfile ? "Setup Profile" : "Settings"}
              </h1>
            </div>
          </div>
          <Badge className="gradient-hero text-white capitalize">
            {userType}
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isNewProfile && (
            <div className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-foreground">
                Let's set up your profile to get started.
              </p>
            </div>
          )}

          <div className="bg-card rounded-xl p-8 shadow-card border border-border">
            <h2 className="text-2xl font-bold mb-8">
              {isNewProfile ? "Create Profile" : "Edit Profile"}
            </h2>

            <div className="space-y-8">
              {/* Display Name */}
              <div>
                <Label
                  htmlFor="displayName"
                  className="text-sm font-semibold mb-2 block"
                >
                  Display Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                    placeholder="Enter your name"
                    className="pl-10 h-10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold mb-2 block"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="pl-10 h-10 bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Email cannot be changed
                </p>
              </div>

              {/* Customer Specific */}
              {userType === "customer" && (
                <div className="space-y-4 p-6 bg-primary/5 border border-primary/10 rounded-lg">
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">
                      Default Search Radius
                    </Label>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">
                        How far to search for products
                      </span>
                      <Badge className="gradient-hero text-white text-base">
                        {formData.searchRadius} km
                      </Badge>
                    </div>
                    <Slider
                      value={[formData.searchRadius]}
                      onValueChange={([v]) =>
                        setFormData({ ...formData, searchRadius: v })
                      }
                      min={1}
                      max={50}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>1 km</span>
                      <span>50 km</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Shop Specific */}
              {userType === "shop" && (
                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="shopName"
                      className="text-sm font-semibold mb-2 block"
                    >
                      Shop Name
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="shopName"
                        value={formData.shopName}
                        onChange={(e) =>
                          setFormData({ ...formData, shopName: e.target.value })
                        }
                        placeholder="Your shop name"
                        className="pl-10 h-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="shopAddress"
                      className="text-sm font-semibold mb-2 block"
                    >
                      Shop Address
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="shopAddress"
                        value={formData.shopAddress}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            shopAddress: e.target.value,
                          })
                        }
                        placeholder="Full address of your shop"
                        className="pl-10 h-10"
                      />
                    </div>
                  </div>

                  {profile?.latitude && profile?.longitude && (
                    <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-success mb-1">
                            Location Set
                          </p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {profile.latitude.toFixed(4)},{" "}
                            {profile.longitude.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Save Button */}
              <div className="pt-4 border-t border-border">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  size="lg"
                  className="w-full gradient-hero text-white font-medium h-11 rounded-lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving
                    ? "Saving..."
                    : isNewProfile
                      ? "Create Profile"
                      : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
