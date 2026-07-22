import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, User, Key, ShieldCheck, Twitter, Info, Bell, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ProfileType {
  _id: string;
  email?: string;
  displayName?: string;
  twitterHandle?: string;
  bio?: string;
  accountabilityEnabled?: boolean;
  remindersEnabled?: boolean;
  licenseType?: string;
  licenseKey?: string;
}

function generateSafeHardwareId() {
  if (typeof window !== "undefined" && window.crypto) {
    if (typeof window.crypto.randomUUID === "function") {
      return `WEB-${window.crypto.randomUUID().replace(/-/g, "").substring(0, 12).toUpperCase()}`;
    }
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    const hex = Array.from(array, (dec) => dec.toString(16).padStart(8, "0")).join("");
    return `WEB-${hex.substring(0, 12).toUpperCase()}`;
  }
  return `WEB-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

export default function SettingsPage() {
  const profile = useQuery(api.notebook.currentProfile);

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <SettingsForm profile={profile} />;
}

function SettingsForm({ profile }: { profile: ProfileType }) {
  const updateProfile = useMutation(api.notebook.updateProfile);
  const activateLicense = useMutation(api.licenses.activate);
  const resetMyPaidStatus = useMutation(api.users.resetMyPaidStatus);

  const [displayName, setDisplayName] = useState(profile.displayName || "");
  const [twitterHandle, setTwitterHandle] = useState(profile.twitterHandle || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [accountabilityEnabled, setAccountabilityEnabled] = useState(!!profile.accountabilityEnabled);
  const [remindersEnabled, setRemindersEnabled] = useState(!!profile.remindersEnabled);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [licenseKey, setLicenseKey] = useState("");
  const [isActivating, setIsActivating] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await updateProfile({
        displayName: displayName.trim() || undefined,
        twitterHandle: twitterHandle.trim() || undefined,
        bio: bio.trim() || undefined,
        accountabilityEnabled,
        remindersEnabled,
      });
      toast.success("Profile updated successfully");
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      toast.error(errMsg || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleActivateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;

    setIsActivating(true);
    try {
      const hwId = localStorage.getItem("idb_hw_id") || generateSafeHardwareId();
      localStorage.setItem("idb_hw_id", hwId);

      const result = await activateLicense({ key: licenseKey.trim(), hardwareId: hwId });
      if (result.success) {
        toast.success(`License activated: ${result.type}`);
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      toast.error(errMsg || "Activation failed");
    } finally {
      setIsActivating(false);
    }
  };

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

        {/* Accountability Section */}
        <Card className="nb-card border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono uppercase tracking-wider text-sm">
              <Bell className="h-4 w-4" />
              Accountability Checks
            </CardTitle>
            <CardDescription>
              Reminders to stay on pace and respect rest days.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-mono uppercase tracking-widest">Enable Checks</Label>
                <p className="text-xs text-muted-foreground">Automatically check for missed days or overworking.</p>
              </div>
              <Switch
                checked={accountabilityEnabled}
                onCheckedChange={setAccountabilityEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-mono uppercase tracking-widest">Email Reminders</Label>
                <p className="text-xs text-muted-foreground">Send an alert to {profile.email} if you fall behind.</p>
              </div>
              <Switch
                checked={remindersEnabled}
                onCheckedChange={setRemindersEnabled}
                disabled={!accountabilityEnabled}
              />
            </div>

            <div className="p-4 rounded-md border bg-primary/5 flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-bold uppercase tracking-wider mb-1">How it works:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>If your suggested day is behind your elapsed days from start, we'll nudge you.</li>
                  <li>Working 6+ days in a row triggers a "Burnout Warning".</li>
                  <li>Checks run when you visit the dashboard.</li>
                </ul>
              </div>
            </div>
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
            <div className="p-4 rounded-md border bg-muted/50 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-2 rounded-full mt-0.5">
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
              <Button
                variant="outline"
                size="sm"
                className="font-mono text-xs text-destructive border-destructive/30 shrink-0"
                onClick={async () => {
                  try {
                    await resetMyPaidStatus({});
                    toast.success("Account reset to Trial mode");
                  } catch {
                    toast.error("Failed to reset account");
                  }
                }}
              >
                Reset to Trial
              </Button>
            </div>

            {profile.licenseKey && (
              <div className="p-4 rounded-md border bg-muted/30 flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Active License Key</div>
                  <div className="font-mono text-sm font-bold">{profile.licenseKey}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[10px] uppercase font-mono"
                  onClick={() => {
                    if (profile.licenseKey) {
                      navigator.clipboard.writeText(profile.licenseKey);
                      toast.success("License key copied to clipboard");
                    }
                  }}
                >
                  Copy
                </Button>
              </div>
            )}

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
