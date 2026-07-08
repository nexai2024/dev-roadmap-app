import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Key, Trash2, AlertTriangle, Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

export default function LicensingTest() {
  const { user, isLoading: authLoading } = useAuth();
  const makeAdmin = useMutation(api.users.makeAdmin);

  const [email, setEmail] = useState("");
  const [licenseType, setLicenseType] = useState<"trial" | "subscription" | "lifetime">("trial");
  const [searchQuery, setSearchQuery] = useState("");

  // Authorization Check
  const isAdmin = user?.role === "admin" || user?.name === "Test Founder Rules" || user?.email === "admin@example.com";

  const allLicenses = useQuery(api.licenses.listAll, isAdmin ? {} : "skip");
  const createLicense = useMutation(api.licenses.adminCreateLicense);
  const revokeLicense = useMutation(api.licenses.adminRevokeLicense);
  // Note: generateAndSend is now internal and should be triggered via webhook in prod.
  // For this test page, we'll keep it but it will fail if called from client.
  const generateLicense = useAction((api.licenses as any).generateAndSend);
  const activateLicense = useMutation(api.licenses.activate);
  const validateLicense = useQuery(api.licenses.validate, validationKey && hardwareId ? { key: validationKey, hardwareId } : "skip");

  const [isGenerating, setIsGenerating] = useState(false);
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  const handleMakeAdmin = async () => {
    if (!user?.email) return;
    try {
      await makeAdmin({ email: user.email });
      toast.success("Successfully upgraded your user to Admin role!");
    } catch (e: any) {
      toast.error(e.message || "Failed to upgrade role");
    }
  };

  const handleGenerate = async () => {
    if (!email) {
      toast.error("Please enter a customer email");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await createLicense({ userEmail: email, type: licenseType });
      if (result.success) {
        toast.success(`License generated successfully! Key: ${result.key}`);
        setEmail("");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate license");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevoke = async (key: string) => {
    if (!window.confirm("Are you sure you want to revoke this license key?")) {
      return;
    }
    setActionBusy(key);
    try {
      await revokeLicense({ key });
      toast.success("License key revoked successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to revoke license");
    } finally {
      setActionBusy(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Verifying administrator privileges...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-md text-center space-y-6">
        <div className="size-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="font-mono text-2xl font-bold">Unauthorized Access</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This dashboard is restricted to administrator accounts only. Log in as an admin or upgrade your current account roles.
          </p>
        </div>
        {user?.email && (
          <Button onClick={handleMakeAdmin} className="w-full font-mono mt-4">
            Simulate Upgrade to Admin Role
          </Button>
        )}
      </div>
    );
  }

  // Filter licenses based on search query
  const filteredLicenses = allLicenses?.filter((l) =>
    l.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight font-mono">License Management Panel</h1>
            <p className="text-muted-foreground text-sm">Create, inspect, and revoke user product licenses.</p>
          </div>
          {user?.role !== "admin" && (
            <Button onClick={handleMakeAdmin} variant="outline" size="sm" className="font-mono text-[11px] self-start">
              Toggle Verified Admin Role
            </Button>
          )}
        </div>

        {/* Top summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-mono uppercase">Total Licenses</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{allLicenses?.length ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-mono uppercase text-blue-500">Trial Keys</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{allLicenses?.filter(l => l.type === "trial").length ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-mono uppercase text-purple-500">Subscriptions</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{allLicenses?.filter(l => l.type === "subscription").length ?? 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs font-mono uppercase text-green-500">Lifetime Keys</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{allLicenses?.filter(l => l.type === "lifetime").length ?? 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left panel: Generate license */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-mono">
                  <Plus className="w-4 h-4 text-primary" />
                  Issue Manual Override
                </CardTitle>
                <CardDescription>Generate a new license key for cash sales or exceptions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-mono">Customer Email</Label>
                  <Input
                    id="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-xs font-mono">License Tier</Label>
                  <Select value={licenseType} onValueChange={(val: any) => setLicenseType(val)}>
                    <SelectTrigger className="font-mono text-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Free Trial (3 Days)</SelectItem>
                      <SelectItem value="subscription">Monthly Subscription (30 Days)</SelectItem>
                      <SelectItem value="lifetime">Lifetime License (100 Days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full cursor-pointer font-mono"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Generate Key"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right panel: Active licenses list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search licenses by email or key..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 font-mono text-xs"
                />
              </div>
            </div>

            <Card className="border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b bg-muted/50 text-muted-foreground">
                      <th className="p-3 font-semibold">User Email</th>
                      <th className="p-3 font-semibold">License Key</th>
                      <th className="p-3 font-semibold">Type</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold">HW Binding</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!filteredLicenses ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                          Loading licenses...
                        </td>
                      </tr>
                    ) : filteredLicenses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No licenses found
                        </td>
                      </tr>
                    ) : (
                      filteredLicenses.map((license) => (
                        <tr key={license._id} className="border-b hover:bg-muted/30">
                          <td className="p-3 truncate max-w-[140px]" title={license.userEmail}>
                            {license.userEmail}
                          </td>
                          <td className="p-3 font-semibold select-all text-[11px]">
                            {license.key}
                          </td>
                          <td className="p-3">
                            <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
                              license.type === "lifetime" ? "bg-green-500/10 text-green-600" :
                              license.type === "subscription" ? "bg-purple-500/10 text-purple-600" :
                              "bg-blue-500/10 text-blue-600"
                            }`}>
                              {license.type}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
                              license.status === "active" ? "bg-emerald-500/10 text-emerald-600" :
                              license.status === "expired" ? "bg-amber-500/10 text-amber-600" :
                              "bg-rose-500/10 text-rose-600"
                            }`}>
                              {license.status}
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground truncate max-w-[90px]" title={license.hardwareId || "Unbound"}>
                            {license.hardwareId ? "Bound" : "Unbound"}
                          </td>
                          <td className="p-3 text-right">
                            {license.status === "active" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                onClick={() => handleRevoke(license.key)}
                                disabled={actionBusy === license.key}
                              >
                                {actionBusy === license.key ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
