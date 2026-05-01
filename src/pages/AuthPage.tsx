import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, UserType } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  MapPin,
  ShoppingBag,
  Store,
  Mail,
  Lock,
  User as UserIcon,
  Building2,
} from "lucide-react";

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [userType, setUserType] = useState<UserType | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        toast.success("Welcome back!");
      } else {
        if (!userType) {
          toast.error("Please select your account type");
          setLoading(false);
          return;
        }
        const extra = userType === "shop" ? { shopName, shopAddress } : {};
        await signUp(email, password, displayName, userType, extra);
        toast.success("Account created successfully!");
      }
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left hero section */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-primary-foreground"
              style={{
                width: `${300 + i * 150}px`,
                height: `${300 + i * 150}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center max-w-sm">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-8"
          >
            <MapPin className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-primary-foreground mb-4"
          >
            NearMe
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-primary-foreground/80 leading-relaxed"
          >
            Discover products at nearby shops. Connect with local businesses
            instantly and find what you need.
          </motion.p>
        </div>
      </div>

      {/* Right form section */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold">NearMe</h1>
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {mode === "login" ? "Welcome back" : "Get started"}
            </h2>
            <p className="text-muted-foreground">
              {mode === "login"
                ? "Sign in to your account"
                : "Create an account to connect with your community"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === "signup" && !userType && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <Label className="text-sm font-medium">I am a</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      type="button"
                      onClick={() => setUserType("customer")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 border-2 rounded-lg flex flex-col items-center gap-2 cursor-pointer transition-all hover:border-primary hover:bg-primary/5"
                    >
                      <ShoppingBag className="w-6 h-6 text-primary" />
                      <span className="font-medium text-sm">Customer</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setUserType("shop")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 border-2 rounded-lg flex flex-col items-center gap-2 cursor-pointer transition-all hover:border-primary hover:bg-primary/5"
                    >
                      <Store className="w-6 h-6 text-primary" />
                      <span className="font-medium text-sm">Shop Owner</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {(mode === "login" || userType) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {mode === "signup" && userType && (
                    <motion.button
                      type="button"
                      onClick={() => setUserType(null)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ← Change account type
                    </motion.button>
                  )}

                  {mode === "login" && (
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email address
                      </Label>
                      <div className="relative mt-1.5">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                  )}

                  {mode === "signup" && (
                    <>
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium">
                          Full name
                        </Label>
                        <div className="relative mt-1.5">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="name"
                            placeholder="John Doe"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div>
                        <Label
                          htmlFor="email-signup"
                          className="text-sm font-medium"
                        >
                          Email address
                        </Label>
                        <div className="relative mt-1.5">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="email-signup"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {userType === "shop" && (
                        <>
                          <div>
                            <Label
                              htmlFor="shopName"
                              className="text-sm font-medium"
                            >
                              Shop name
                            </Label>
                            <div className="relative mt-1.5">
                              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="shopName"
                                placeholder="Your Shop"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                required
                                className="pl-10"
                              />
                            </div>
                          </div>

                          <div>
                            <Label
                              htmlFor="shopAddress"
                              className="text-sm font-medium"
                            >
                              Shop address
                            </Label>
                            <div className="relative mt-1.5">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="shopAddress"
                                placeholder="123 Main St, City, State"
                                value={shopAddress}
                                onChange={(e) => setShopAddress(e.target.value)}
                                required
                                className="pl-10"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  <div>
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 gradient-hero text-white font-medium rounded-lg"
                  >
                    {loading
                      ? "Loading..."
                      : mode === "login"
                        ? "Sign in"
                        : "Create account"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {mode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
            </span>
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setUserType(null);
              }}
              className="text-primary font-medium hover:underline"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
