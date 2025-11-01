import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import MapComponent from "@/components/MapComponent";

const Map = () => {
  const [selectedCategory] = useState("all");
  const [searchQuery] = useState("");

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-50" />
      <Navbar />
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] rounded-3xl overflow-hidden shadow-elevated"
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
