import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Activity,
  Shield,
  Building2,
  UserRound,
  Mail,
  LockKeyhole,
  ArrowRight,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const roleOptions = [
  { value: "hospital", label: "Hospital Portal", icon: Building2 },
  { value: "admin", label: "Government Admin", icon: Shield },
  { value: "official", label: "Health Official", icon: UserRound },
];

const demoCredentials = [
  { role: "hospital", email: "hospital@auralis.org", password: "Hospital@123" },
  { role: "admin", email: "admin@auralis.org", password: "Admin@123" },
  { role: "official", email: "official@auralis.org", password: "Official@123" },
];

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register, resetPassword, isLoadingAuth, authError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [activeTab, setActiveTab] = useState("signin");
  const [rememberMe, setRememberMe] = useState(true);
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "hospital",
  });
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "hospital",
  });
  const [resetForm, setResetForm] = useState({
    email: "",
    role: "hospital",
    newPassword: "",
    confirmPassword: "",
  });
  const floatingDots = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        id: index,
        left: ((index * 37) % 100) + "%",
        top: ((index * 53) % 100) + "%",
        size: 2 + (index % 4),
        delay: (index % 9) * 0.35,
        duration: 5 + (index % 5),
        drift: 8 + (index % 7),
      })),
    []
  );

  const selectedRoleLabel = useMemo(() => {
    return roleOptions.find((option) => option.value === form.role)?.label || "Role";
  }, [form.role]);

  const redirectByRole = (role) => {
    if (role === "admin") {
      navigate("/admin");
      return;
    }

    if (role === "hospital") {
      navigate("/hospital");
      return;
    }

    navigate("/official");
  };

  const validate = () => {
    if (!form.email.trim() || !form.password) {
      setFormError("Email and password are required.");
      return false;
    }

    const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basicEmailRegex.test(form.email.trim())) {
      setFormError("Please enter a valid email address.");
      return false;
    }

    setFormError("");
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const user = await login({
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });

      toast({
        title: "Login successful",
        description: `Signed in as ${user.name}`,
      });

      redirectByRole(user.role);
    } catch (error) {
      setFormError(error?.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUseDemo = (demo) => {
    setForm({
      email: demo.email,
      password: demo.password,
      role: demo.role,
    });
    setFormError("");

    toast({
      title: "Demo account loaded",
      description: `${demo.role} credentials are ready. Click Sign In to continue.`,
    });
  };

  const handleCreateAccount = async (event) => {
    event.preventDefault();

    const email = createForm.email.trim();
    if (!createForm.name.trim() || !email || !createForm.password) {
      setFormError("Name, email, role and password are required.");
      return;
    }

    const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basicEmailRegex.test(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (createForm.password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    if (createForm.password !== createForm.confirmPassword) {
      setFormError("Password confirmation does not match.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      await register({
        name: createForm.name.trim(),
        email,
        password: createForm.password,
        role: createForm.role,
      });

      toast({
        title: "Account created",
        description: "You can now sign in with your new account.",
      });

      setForm({
        email,
        password: createForm.password,
        role: createForm.role,
      });
      setActiveTab("signin");
      setCreateForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "hospital",
      });
    } catch (error) {
      setFormError(error?.message || "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    const email = resetForm.email.trim();
    if (!email || !resetForm.newPassword) {
      setFormError("Email, role and new password are required.");
      return;
    }

    if (resetForm.newPassword.length < 8) {
      setFormError("New password must be at least 8 characters.");
      return;
    }

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setFormError("Password confirmation does not match.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      await resetPassword({
        email,
        role: resetForm.role,
        newPassword: resetForm.newPassword,
      });

      toast({
        title: "Password updated",
        description: "You can now sign in with your new password.",
      });

      setForm((prev) => ({
        ...prev,
        email,
        password: resetForm.newPassword,
        role: resetForm.role,
      }));
      setActiveTab("signin");
      setResetForm({
        email: "",
        role: "hospital",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setFormError(error?.message || "Unable to reset password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#14325a] px-4 py-4 text-slate-100 sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(45,212,191,0.16),transparent_38%),radial-gradient(circle_at_85%_10%,rgba(56,189,248,0.12),transparent_35%),linear-gradient(180deg,#173b6a,#123257)]" />
        <div className="absolute inset-0 [background-image:radial-gradient(rgba(94,234,212,0.35)_1px,transparent_1px)] [background-size:130px_130px] opacity-35" />
        {floatingDots.map((dot) => (
          <motion.span
            key={dot.id}
            className="absolute rounded-full bg-cyan-300/55"
            style={{
              left: dot.left,
              top: dot.top,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
            }}
            animate={{
              y: [0, -dot.drift, 0],
              x: [0, dot.drift * 0.35, 0],
              opacity: [0.15, 0.9, 0.15],
            }}
            transition={{
              duration: dot.duration,
              delay: dot.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-lg">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-4 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-900/40">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">Auralis</h1>
              <p className="text-sm font-semibold text-cyan-300">Sense Early Act Smarter</p>
            </div>
          </div>
          <p className="mx-auto mt-2 max-w-md text-base font-medium leading-tight text-slate-300">
            Federated Learning Platform for Seasonal & Widespread Disease Surveillance
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="overflow-hidden rounded-2xl border border-slate-300/20 bg-slate-700/45 shadow-2xl shadow-black/35 backdrop-blur-md"
        >
          <div className="grid grid-cols-2 border-b border-slate-300/15 bg-slate-700/40 text-base font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("signin")}
              className={`px-4 py-3 transition-colors ${activeTab === "signin" ? "bg-slate-200/10 text-white" : "text-slate-300"}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("create")}
              className={`px-4 py-3 transition-colors ${activeTab === "create" ? "bg-slate-200/10 text-white" : "text-slate-300"}`}
            >
              Create Account
            </button>
          </div>

          {activeTab === "signin" && (
            <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-200">Email Address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="you@example.com"
                    className="h-11 rounded-xl border-slate-200/25 bg-slate-200/20 pl-11 text-base text-white placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-200">Password</Label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder="Enter your password"
                    className="h-11 rounded-xl border-slate-200/25 bg-slate-200/20 pl-11 pr-11 text-base text-white placeholder:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-semibold text-slate-300">Portal Role</Label>
                <Select value={form.role} onValueChange={(value) => setForm((prev) => ({ ...prev, role: value }))}>
                  <SelectTrigger id="role" className="h-10 rounded-xl border-slate-200/25 bg-slate-200/10 text-sm text-white">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-300">Selected: {selectedRoleLabel}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-300">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300/40 bg-slate-100/20"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="font-semibold text-cyan-300 hover:text-cyan-200"
                  onClick={() => setActiveTab("reset")}
                >
                  Forgot password?
                </button>
              </div>

              {(formError || authError) && (
                <div className="rounded-xl border border-red-300/35 bg-red-500/15 px-3 py-2 text-sm text-red-100">
                  {formError || authError}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting || isLoadingAuth}
                className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-xl font-bold text-white shadow-lg shadow-cyan-950/40 hover:from-blue-400 hover:to-cyan-400"
              >
                <ArrowRight className="mr-2 h-5 w-5" />
                {submitting ? "Signing In..." : "Sign In to Auralis"}
              </Button>

              <div className="space-y-3 rounded-2xl border border-slate-200/20 bg-slate-900/20 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cyan-300">
                  <Sparkles className="h-4 w-4" />
                  Demo Account Access
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {demoCredentials.map((demo) => (
                    <div key={demo.role} className="space-y-1 rounded-xl border border-slate-200/20 bg-slate-100/5 p-2.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">{demo.role}</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="w-full border-cyan-200/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20"
                        onClick={() => handleUseDemo(demo)}
                      >
                        Fill
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          )}

          {activeTab === "create" && (
            <form onSubmit={handleCreateAccount} className="space-y-4 p-5 sm:p-6">
              <div className="space-y-2">
                <Label htmlFor="create-name" className="text-sm font-semibold text-slate-200">Full Name</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  <Input
                    id="create-name"
                    value={createForm.name}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Your full name"
                    className="h-11 rounded-xl border-slate-200/25 bg-slate-200/20 pl-11 text-base text-white placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-email" className="text-sm font-semibold text-slate-200">Email Address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  <Input
                    id="create-email"
                    type="email"
                    value={createForm.email}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="you@example.com"
                    className="h-11 rounded-xl border-slate-200/25 bg-slate-200/20 pl-11 text-base text-white placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-role" className="text-sm font-semibold text-slate-200">Portal Role</Label>
                <Select value={createForm.role} onValueChange={(value) => setCreateForm((prev) => ({ ...prev, role: value }))}>
                  <SelectTrigger id="create-role" className="h-10 rounded-xl border-slate-200/25 bg-slate-200/10 text-sm text-white">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-password" className="text-sm font-semibold text-slate-200">Password</Label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  <Input
                    id="create-password"
                    type={showCreatePassword ? "text" : "password"}
                    value={createForm.password}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder="At least 8 characters"
                    className="h-11 rounded-xl border-slate-200/25 bg-slate-200/20 pl-11 pr-11 text-base text-white placeholder:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                    aria-label={showCreatePassword ? "Hide password" : "Show password"}
                  >
                    {showCreatePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-confirm" className="text-sm font-semibold text-slate-200">Confirm Password</Label>
                <Input
                  id="create-confirm"
                  type="password"
                  value={createForm.confirmPassword}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  placeholder="Repeat password"
                  className="h-11 rounded-xl border-slate-200/25 bg-slate-200/20 text-base text-white placeholder:text-slate-300"
                />
              </div>

              {(formError || authError) && (
                <div className="rounded-xl border border-red-300/35 bg-red-500/15 px-3 py-2 text-sm text-red-100">
                  {formError || authError}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting || isLoadingAuth}
                className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-lg font-bold text-white"
              >
                {submitting ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          )}

          {activeTab === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4 p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-200">Reset your password</p>
                <button
                  type="button"
                  className="text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                  onClick={() => setActiveTab("signin")}
                >
                  Back to Sign In
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-sm font-semibold text-slate-200">Account Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetForm.email}
                  onChange={(event) => setResetForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="you@example.com"
                  className="h-11 rounded-xl border-slate-200/25 bg-slate-200/20 text-base text-white placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-role" className="text-sm font-semibold text-slate-200">Portal Role</Label>
                <Select value={resetForm.role} onValueChange={(value) => setResetForm((prev) => ({ ...prev, role: value }))}>
                  <SelectTrigger id="reset-role" className="h-10 rounded-xl border-slate-200/25 bg-slate-200/10 text-sm text-white">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-password" className="text-sm font-semibold text-slate-200">New Password</Label>
                <div className="relative">
                  <Input
                    id="reset-password"
                    type={showResetPassword ? "text" : "password"}
                    value={resetForm.newPassword}
                    onChange={(event) => setResetForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                    placeholder="At least 8 characters"
                    className="h-11 rounded-xl border-slate-200/25 bg-slate-200/20 pr-11 text-base text-white placeholder:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                    aria-label={showResetPassword ? "Hide password" : "Show password"}
                  >
                    {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-confirm" className="text-sm font-semibold text-slate-200">Confirm New Password</Label>
                <Input
                  id="reset-confirm"
                  type="password"
                  value={resetForm.confirmPassword}
                  onChange={(event) => setResetForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  placeholder="Repeat new password"
                  className="h-11 rounded-xl border-slate-200/25 bg-slate-200/20 text-base text-white placeholder:text-slate-300"
                />
              </div>

              {(formError || authError) && (
                <div className="rounded-xl border border-red-300/35 bg-red-500/15 px-3 py-2 text-sm text-red-100">
                  {formError || authError}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting || isLoadingAuth}
                className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-lg font-bold text-white"
              >
                {submitting ? "Updating Password..." : "Update Password"}
              </Button>
            </form>
          )}
        </motion.div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-xs font-medium text-slate-300">
          <button type="button" className="hover:text-white">About</button>
          <button type="button" className="hover:text-white">Privacy Policy</button>
          <button type="button" className="hover:text-white">Terms of Service</button>
          <button type="button" className="hover:text-white">Contact</button>
        </div>
      </div>
    </div>
  );
}
