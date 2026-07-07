import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Key, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function LicensingTest() {
  const [email, setEmail] = useState("");
  const [licenseType, setLicenseType] = useState<"trial" | "subscription" | "lifetime">("trial");
  const [generatedKey, setGeneratedKey] = useState("");
  const [hardwareId, setHardwareId] = useState("TEST-HW-1234");
  const [activationKey, setActivationKey] = useState("");
  const [validationKey, setValidationKey] = useState("");

  const generateLicense = useAction(api.licenses.generateAndSend);
  const activateLicense = useMutation(api.licenses.activate);
  const validateLicense = useQuery(api.licenses.validate, validationKey && hardwareId ? { key: validationKey, hardwareId } : "skip");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const handleGenerate = async () => {
    if (!email) {
      toast.error("Please enter an email");
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateLicense({ userEmail: email, type: licenseType });
      if (result.success) {
        setGeneratedKey(result.key);
        setActivationKey(result.key);
        setValidationKey(result.key);
        toast.success("License generated and key sent to email!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate license");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleActivate = async () => {
    if (!activationKey || !hardwareId) {
      toast.error("Please enter both license key and hardware ID");
      return;
    }
    setIsActivating(true);
    try {
      const result = await activateLicense({ key: activationKey, hardwareId });
      if (result.success) {
        toast.success(`License activated successfully! Type: ${result.type}`);
        setValidationKey(activationKey);
      }
    } catch (error: any) {
      toast.error(error.message || "Activation failed");
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Licensing System Test Dashboard</h1>
          <p className="text-muted-foreground text-lg">Test the end-to-end license lifecycle</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Step 1: Generate */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-500" />
                1. Create License (Webhook)
              </CardTitle>
              <CardDescription>Simulate a webhook trigger from Stripe or Shopify</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Customer Email</Label>
                <Input
                  id="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">License Type</Label>
                <Select value={licenseType} onValueChange={(val: any) => setLicenseType(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Trial (14 Days)</SelectItem>
                    <SelectItem value="subscription">Subscription (1 Year)</SelectItem>
                    <SelectItem value="lifetime">Lifetime (Perpetual)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full cursor-pointer"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Generate & Email Key"}
              </Button>
              {generatedKey && (
                <div className="mt-4 p-3 bg-muted rounded-md break-all">
                  <p className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider">Generated Key:</p>
                  <code className="text-primary font-bold">{generatedKey}</code>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Activate */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                2. Activate License (Client App)
              </CardTitle>
              <CardDescription>Bind the license to a specific Hardware ID</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activate-key">License Key</Label>
                <Input
                  id="activate-key"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={activationKey}
                  onChange={(e) => setActivationKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hw-id">Machine Hardware ID</Label>
                <Input
                  id="hw-id"
                  value={hardwareId}
                  onChange={(e) => setHardwareId(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                onClick={handleActivate}
                disabled={isActivating}
              >
                {isActivating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Activate on this Device"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Step 3: Continuous Validation */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-purple-500" />
              3. Continuous Validation
            </CardTitle>
            <CardDescription>App checks license validity on every launch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Validating Key</Label>
                <Input
                  placeholder="Enter key to validate"
                  value={validationKey}
                  onChange={(e) => setValidationKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Against Hardware ID</Label>
                <Input value={hardwareId} readOnly className="bg-muted" />
              </div>
            </div>

            <div className="p-6 border rounded-xl bg-card">
              {!validationKey ? (
                <div className="text-center text-muted-foreground py-4">
                  Enter a key above to see validation status
                </div>
              ) : validateLicense === undefined ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (validateLicense as any).valid ? (
                <div className="flex flex-col items-center space-y-3 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                  <div>
                    <h3 className="text-xl font-bold text-green-600">License Valid</h3>
                    <p className="text-sm text-muted-foreground">
                      Access Granted ({(validateLicense as any).type})
                      {(validateLicense as any).expiresAt && ` • Expires: ${new Date((validateLicense as any).expiresAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3 text-center">
                  <XCircle className="w-12 h-12 text-red-500" />
                  <div>
                    <h3 className="text-xl font-bold text-red-600">Access Denied</h3>
                    <p className="text-sm text-muted-foreground">{(validateLicense as any).reason}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
