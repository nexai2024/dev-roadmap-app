import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, User, Key, ShieldCheck, Twitter, Info } from "lucide-react";

export default function SettingsPage() {
  const profile = useQuery(api.notebook.currentProfile);
  const updateProfile = useMutation(api.notebook.updateProfile);
  const activateLicense = useMutation(api.licenses.activate);

  const [displayName, setDisplayName] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [bio, setBio] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [licenseKey, setLicenseKey] = useState("");
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setTwitterHandle(profile.twitterHandle || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await updateProfile({
        displayName: displayName.trim() || undefined,
        twitterHandle: twitterHandle.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleActivateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;

    setIsActivating(true);
    try {
      // For this app, we'll use a fixed or generated hardware ID if needed,
      // but let's assume "WEB-APP" for now as a placeholder or use a random one.
      const hwId = localStorage.getItem("idb_hw_id") || `WEB-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      localStorage.setItem("idb_hw_id", hwId);

      const result = await activateLicense({ key: licenseKey.trim(), hardwareId: hwId });
      if (result.success) {
        toast.success(`License activated: ${result.type}`);
        setLicenseKey("");
      }
    } catch (error: any) {
      toast.error(error.message || "Activation failed");
    } finally {
      setIsActivating(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-mono text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your protocol notebook profile and license.
        </p>
      </div>

      <div className="grid gap-8">
        {/* Profile Section */}
        <Card className="nb-card border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono uppercase tracking-wider text-sm">
              <User className="h-4 w-4" />
              Profile Details
            </CardTitle>
            <CardDescription>
              This information is used for your daily logs and public shares.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="font-mono text-xs uppercase tracking-widest">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter" className="font-mono text-xs uppercase tracking-widest flex items-center gap-1">
                  <Twitter className="h-3 w-3" /> X / Twitter Handle
                </Label>
                <Input
                  id="twitter"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value.replace(/^@/, ""))}
                  placeholder="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="font-mono text-xs uppercase tracking-widest">Short Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="What are you building?"
                  rows={3}
                />
              </div>
              <Button type="submit" disabled={isUpdatingProfile} className="nb-press">
                {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Licensing Section */}
        <Card className="nb-card border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono uppercase tracking-wider text-sm">
              <Key className="h-4 w-4" />
              Licensing & Access
            </CardTitle>
            <CardDescription>
              Manage your protocol license and subscription status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-md border bg-muted/50 flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-mono text-sm font-bold uppercase tracking-wider">
                  Current Tier: <span className="text-primary">{(profile.licenseType ?? "free").toUpperCase()}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(profile.licenseType === "free" || !profile.licenseType) && "You are currently on the 3-day free trial."}
                  {profile.licenseType === "trial" && "You have active trial access."}
                  {profile.licenseType === "subscription" && "You have an active annual subscription."}
                  {profile.licenseType === "lifetime" && "You have permanent lifetime access."}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="licenseKey" className="font-mono text-xs uppercase tracking-widest">Activate License Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="licenseKey"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    className="font-mono"
                  />
                  <Button
                    onClick={handleActivateLicense}
                    disabled={isActivating || !licenseKey.trim()}
                    className="nb-press shrink-0"
                  >
                    {isActivating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Activate"}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" /> Keys are usually sent via email after purchase.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
