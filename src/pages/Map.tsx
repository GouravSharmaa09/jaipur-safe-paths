import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import MapComponent from "@/components/MapComponent";

const Map = () => {
  const [selectedCategory] = useState("all");
  const [searchQuery] = useState("");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar />
      
      <main className="flex-1 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-[calc(100vh-120px)] rounded-2xl overflow-hidden shadow-elevated"
        >
          <MapComponent 
            selectedCategory={selectedCategory} 
            searchQuery={searchQuery}
          />
        </motion.div>
      </main>
    </div>
  );
};

export default Map;
