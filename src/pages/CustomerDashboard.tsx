import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getCurrentPosition, calculateDistance } from "@/lib/geolocation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  LogOut,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Navigation,
  User,
} from "lucide-react";

interface SearchRequest {
  id: string;
  productName: string;
  status: "pending" | "accepted" | "rejected";
  shopName?: string;
  shopAddress?: string;
  shopLat?: number;
  shopLng?: number;
  distance?: number;
  createdAt: any;
}

const CustomerDashboard: React.FC = () => {
  const { profile, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [productQuery, setProductQuery] = useState("");
  const [radius, setRadius] = useState(profile?.searchRadius || 5);
  const [searching, setSearching] = useState(false);
  const [requests, setRequests] = useState<SearchRequest[]>([]);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  useEffect(() => {
    getCurrentPosition()
      .then((pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
      })
      .catch(() => toast.error("Please enable location access"));
  }, []);

  // Listen to user's requests
  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, "searchRequests"),
      where("customerId", "==", profile.uid),
    );
    const unsub = onSnapshot(q, (snap) => {
      const reqs = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as SearchRequest,
      );
      reqs.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
      );
      setRequests(reqs);
    });
    return unsub;
  }, [profile]);

  const handleSearch = async () => {
    if (!productQuery.trim()) {
      toast.error("Enter a product name");
      return;
    }
    if (!userLat || !userLng) {
      toast.error("Location not available");
      return;
    }
    setSearching(true);
    try {
      // Find shops within radius
      const shopsSnap = await getDocs(
        query(collection(db, "users"), where("userType", "==", "shop")),
      );
      const nearbyShops = shopsSnap.docs
        .map((d) => d.data())
        .filter((shop) => {
          if (!shop.latitude || !shop.longitude) return false;
          const dist = calculateDistance(
            userLat,
            userLng,
            shop.latitude,
            shop.longitude,
          );
          return dist <= radius;
        });

      if (nearbyShops.length === 0) {
        toast.info("No shops found within your radius. Try increasing it.");
        setSearching(false);
        return;
      }

      // Create a search request for each nearby shop
      for (const shop of nearbyShops) {
        await addDoc(collection(db, "searchRequests"), {
          customerId: profile!.uid,
          customerName: profile!.displayName,
          shopId: shop.uid,
          shopName: shop.shopName,
          shopAddress: shop.shopAddress,
          shopLat: shop.latitude,
          shopLng: shop.longitude,
          productName: productQuery,
          status: "pending",
          radius,
          customerLat: userLat,
          customerLng: userLng,
          createdAt: serverTimestamp(),
        });
      }

      await updateProfile({ searchRadius: radius });
      toast.success(`Request sent to ${nearbyShops.length} nearby shop(s)!`);
      setProductQuery("");
    } catch (err: any) {
      toast.error(err.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-secondary" />;
      case "accepted":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-secondary/15 text-secondary border-secondary/30",
      accepted: "bg-success/15 text-success border-success/30",
      rejected: "bg-destructive/15 text-destructive border-destructive/30",
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${variants[status]}`}
      >
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/50 backdrop-blur-md">
        <div className="container mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">NearMe</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground hidden sm:block">
              {profile?.displayName}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/profile")}
              className="hover:bg-muted"
            >
              <User className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold mb-2">Find products nearby</h2>
          <p className="text-lg text-muted-foreground">
            Search for products at shops in your area
          </p>
        </motion.div>

        {/* Search Card */}
        <motion.div
          id="search-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-8 shadow-card border border-border mb-8"
        >
          <div className="space-y-6">
            {/* Product Search */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                What are you looking for?
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search for a product... (e.g., iPhone, Milk, etc)"
                    value={productQuery}
                    onChange={(e) => setProductQuery(e.target.value)}
                    className="pl-12 h-11 text-base rounded-lg"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={searching}
                  className="gradient-hero text-white font-medium px-8 h-11 rounded-lg"
                >
                  {searching ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Radius Slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold">Search Radius</label>
                <Badge className="gradient-hero text-white text-base px-3 py-1">
                  {radius} km
                </Badge>
              </div>
              <Slider
                value={[radius]}
                onValueChange={([v]) => setRadius(v)}
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

            {/* Location Info */}
            {userLat && userLng && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Navigation className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Your location</p>
                  <p className="text-sm font-medium">
                    {userLat.toFixed(4)}, {userLng.toFixed(4)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Results Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-xl font-bold">Your Search Results</h3>
            {requests.length > 0 && (
              <Badge className="gradient-hero text-white">
                {requests.length}
              </Badge>
            )}
          </div>

          {requests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="text-lg font-semibold mb-1">No searches yet</h4>
              <p className="text-muted-foreground">
                Start searching for products to see results from nearby shops
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {requests.map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-lg p-5 shadow-sm border border-border hover:shadow-card transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-base mb-1">
                        {req.productName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {req.shopName}
                      </p>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>

                  {/* Status Details */}
                  {req.status === "accepted" &&
                    req.shopLat &&
                    req.shopLng &&
                    userLat &&
                    userLng && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 p-4 rounded-lg bg-success/5 border border-success/20"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-success" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-success text-sm mb-2">
                              Product Available!
                            </p>
                            <p className="text-sm text-foreground mb-2">
                              {req.shopAddress}
                            </p>
                            <div className="flex items-center gap-5 text-sm">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                {calculateDistance(
                                  userLat,
                                  userLng,
                                  req.shopLat,
                                  req.shopLng,
                                )}{" "}
                                km away
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                  {req.status === "pending" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 p-4 rounded-lg bg-secondary/5 border border-secondary/20"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        <p className="text-sm text-secondary">
                          Waiting for shop response...
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {req.status === "rejected" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 p-4 rounded-lg bg-destructive/5 border border-destructive/20"
                    >
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-destructive" />
                        <p className="text-sm text-destructive">
                          Product not available at this shop
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerDashboard;
