import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getCurrentPosition } from "@/lib/geolocation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  LogOut,
  Store,
  CheckCircle2,
  XCircle,
  Inbox,
  MapPinned,
  User,
} from "lucide-react";

interface IncomingRequest {
  id: string;
  customerName: string;
  productName: string;
  status: "pending" | "accepted" | "rejected";
  radius: number;
  createdAt: any;
}

const ShopDashboard: React.FC = () => {
  const { profile, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<IncomingRequest[]>([]);
  const [locationSet, setLocationSet] = useState(!!profile?.latitude);

  useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, "searchRequests"),
      where("shopId", "==", profile.uid),
    );
    const unsub = onSnapshot(q, (snap) => {
      const reqs = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as IncomingRequest,
      );
      reqs.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
      );
      setRequests(reqs);
    });
    return unsub;
  }, [profile]);

  const setShopLocation = async () => {
    try {
      const pos = await getCurrentPosition();
      await updateProfile({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      setLocationSet(true);
      toast.success("Shop location set successfully!");
    } catch {
      toast.error("Please enable location access to set your shop location");
    }
  };

  const handleAction = async (
    requestId: string,
    action: "accepted" | "rejected",
  ) => {
    try {
      await updateDoc(doc(db, "searchRequests", requestId), { status: action });
      toast.success(
        action === "accepted" ? "Request accepted!" : "Request rejected",
      );
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/50 backdrop-blur-md">
        <div className="container mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-hero flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">NearMe</h1>
              <p className="text-xs text-muted-foreground">
                {profile?.shopName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {pendingCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-sm font-medium">
                  {pendingCount} pending
                </span>
              </div>
            )}
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
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">Manage requests</h2>
          <p className="text-lg text-muted-foreground">
            Respond to customer product inquiries
          </p>
        </motion.div>

        {/* Location Setup Card */}
        {!locationSet ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-8 mb-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">
                  Set Your Shop Location
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Customers can only find your shop if your location is set.
                  This helps them discover you when searching nearby.
                </p>
                <Button
                  onClick={setShopLocation}
                  className="gradient-hero text-white font-medium"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Enable Location
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-lg p-5 border border-border mb-8 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm mb-1">Your location is set</p>
              <p className="text-sm text-muted-foreground">
                {profile?.shopAddress}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={setShopLocation}>
              Update
            </Button>
          </motion.div>
        )}

        {/* Requests Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-bold">Product Requests</h3>
            {pendingCount > 0 && (
              <Badge className="gradient-hero text-white">
                {pendingCount} pending
              </Badge>
            )}
            {requests.length > 0 && (
              <Badge variant="outline">{requests.length} total</Badge>
            )}
          </div>

          {requests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-card rounded-lg border border-border"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Inbox className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="text-lg font-semibold mb-1">No requests yet</h4>
              <p className="text-muted-foreground">
                Product requests from customers will appear here
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {requests.map((req, i) => {
                const isPending = req.status === "pending";
                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-card rounded-lg p-6 shadow-sm border transition-all ${
                      isPending
                        ? "border-secondary/40 bg-gradient-to-r from-card to-secondary/5"
                        : "border-border"
                    } hover:shadow-card`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-semibold">
                            {req.productName}
                          </h4>
                          {isPending && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/20 border border-secondary/30">
                              <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                              <span className="text-xs font-medium text-secondary">
                                New
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {req.customerName}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">
                          Search radius:{" "}
                          <span className="font-medium">{req.radius} km</span>
                        </p>
                      </div>
                    </div>

                    {req.status === "pending" ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="flex gap-3 pt-4 border-t border-border"
                      >
                        <Button
                          onClick={() => handleAction(req.id, "accepted")}
                          className="flex-1 gradient-hero text-white font-medium h-10 rounded-lg"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleAction(req.id, "rejected")}
                          variant="outline"
                          className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/5 h-10 rounded-lg"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </motion.div>
                    ) : (
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="text-xs text-muted-foreground">
                          {req.status === "accepted"
                            ? "You accepted this request"
                            : "You rejected this request"}
                        </span>
                        <Badge
                          className={
                            req.status === "accepted"
                              ? "gradient-hero text-white"
                              : "bg-destructive/20 text-destructive border-destructive/30"
                          }
                        >
                          {req.status === "accepted" ? "Accepted" : "Rejected"}
                        </Badge>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ShopDashboard;
