import { motion } from "framer-motion";
import { User, Mail, Bell, Shield, LogIn } from "lucide-react";
import Navbar from "@/components/Navbar";
import SOSButton from "@/components/SOSButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Account = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 p-4 md:p-8">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
              Account
            </h1>
            <p className="text-muted-foreground">
              Manage your profile and preferences
            </p>
          </div>

          <Card className="shadow-soft mb-6">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <CardTitle>Welcome to Safe-Bazaar</CardTitle>
              <CardDescription>
                Sign in to access personalized features and contribute to the community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" size="lg">
                <LogIn className="mr-2 h-5 w-5" />
                Sign In / Sign Up
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Authentication coming soon via Supabase
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-secondary/20">
                      <Mail className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">
                        Get updates about new safe spots
                      </p>
                    </div>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-accent/20">
                      <Bell className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Safety Alerts</h3>
                      <p className="text-sm text-muted-foreground">
                        Real-time safety updates in your area
                      </p>
                    </div>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/20">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Saved Safe Spots</h3>
                      <p className="text-sm text-muted-foreground">
                        Bookmark your favorite locations
                      </p>
                    </div>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <Card className="shadow-soft bg-gradient-hero">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Future Features</h3>
                <p className="text-sm text-muted-foreground">
                  User profiles, contribution badges, saved routes, emergency contacts, and more. 
                  Stay tuned for exciting updates!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>

      <SOSButton />
    </div>
  );
};

export default Account;
