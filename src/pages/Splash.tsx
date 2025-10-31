import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";
import hawaMahal from "@/assets/jaipur-hawa-mahal.jpg";
import amerFort from "@/assets/jaipur-amer-fort.jpg";
import cityPalace from "@/assets/jaipur-city-palace.jpg";
import bazaar from "@/assets/jaipur-bazaar.jpg";

const Splash = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Safe-Bazaar",
      description: "Your trusted companion for safe travel in the Pink City",
      image: hawaMahal
    },
    {
      title: "Real-time Safety",
      description: "Get live safety updates from the community",
      image: amerFort
    },
    {
      title: "Voice Navigation",
      description: "Navigate with bilingual voice guidance",
      image: cityPalace
    },
    {
      title: "Report & Help",
      description: "Help others by sharing your safety experiences",
      image: bazaar
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 15000);

    return () => clearTimeout(timer);
  }, [navigate]);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 250);

    return () => clearInterval(slideTimer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentSlide].image}
            alt="Jaipur"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 max-w-md">
        <motion.img
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.3,
          }}
          src={logo}
          alt="Safe-Bazaar"
          className="w-24 h-24 md:w-32 md:h-32"
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="text-center space-y-3"
          >
            <h1 className="text-4xl md:text-5xl font-bold gradient-primary bg-clip-text text-transparent">
              {slides[currentSlide].title}
            </h1>
            <p className="text-sm md:text-base text-foreground/70">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2 mt-4">
          {slides.map((_, index) => (
            <motion.div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentSlide ? "w-8 bg-primary" : "w-1.5 bg-primary/30"
              }`}
              animate={{
                scale: index === currentSlide ? 1 : 0.8,
              }}
            />
          ))}
        </div>

        <motion.button
          onClick={() => navigate("/home")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
        >
          Get Started
        </motion.button>
      </div>
    </div>
  );
};

export default Splash;
