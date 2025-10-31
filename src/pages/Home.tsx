import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import MapComponent from "@/components/MapComponent";
import SOSButton from "@/components/SOSButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", label: "All Places" },
    { id: "cafe", label: "Cafes" },
    { id: "shop", label: "Shops" },
    { id: "night", label: "Night Spots" },
    { id: "monument", label: "Monuments" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col p-4 gap-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for places in Jaipur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-12 rounded-2xl shadow-card"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="rounded-full"
            >
              {category.label}
            </Button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-2 justify-center"
        >
          <Badge className="bg-secondary text-secondary-foreground">
            Safe Zone
          </Badge>
          <Badge className="bg-accent text-accent-foreground">
            Use Caution
          </Badge>
          <Badge className="bg-destructive text-destructive-foreground">
            Avoid at Night
          </Badge>
        </motion.div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex-1 min-h-[500px]"
        >
          <MapComponent
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
          />
        </motion.div>
      </main>

      <SOSButton />
    </div>
  );
};

export default Home;
