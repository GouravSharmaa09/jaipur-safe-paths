import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

const Splash = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Safe-Bazaar",
      description: "Your trusted companion for safe travel in the Pink City"
    },
    {
      title: "Real-time Safety",
      description: "Get live safety updates and navigate safely"
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 8000); // Total 8 seconds for both slides

    return () => clearTimeout(timer);
  }, [navigate]);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // 4 seconds per slide - second slide shows longer

    return () => clearInterval(slideTimer);
  }, [slides.length]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/20">
      {/* Video Background - Add your video here */}
      <video 
        autoPlay 
        muted 
        loop 
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      >
        <source src="/videos/jaipur-background.mp4" type="video/mp4" />
      </video>
      
      {/* Animated Mandala Pattern Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background/85">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 60, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-1/4 -left-32 w-64 h-64 opacity-10 border-4 border-primary rounded-full"
          style={{
            background: 'radial-gradient(circle, transparent 30%, hsl(var(--primary) / 0.3) 100%)'
          }}
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 45, repeat: Infinity, ease: "linear" },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute bottom-1/4 -right-32 w-80 h-80 opacity-10 border-4 border-accent rounded-full"
          style={{
            background: 'radial-gradient(circle, transparent 30%, hsl(var(--accent) / 0.3) 100%)'
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 max-w-md">
        {/* Logo with Rajasthani-inspired animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ 
            scale: 1, 
            rotate: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.3,
          }}
          className="relative"
        >
          <motion.div
            animate={{ 
              rotate: 360,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 blur-xl opacity-30"
            style={{
              background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))'
            }}
          />
          <img
            src={logo}
            alt="Safe-Bazaar"
            className="w-24 h-24 md:w-32 md:h-32 relative z-10 drop-shadow-2xl"
          />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center space-y-3"
          >
            <motion.h1 
              className="text-4xl md:text-5xl font-bold gradient-primary bg-clip-text text-transparent"
              animate={{
                textShadow: [
                  "0 0 20px rgba(255,255,255,0.3)",
                  "0 0 40px rgba(255,255,255,0.1)",
                  "0 0 20px rgba(255,255,255,0.3)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {slides[currentSlide].title}
            </motion.h1>
            <motion.p 
              className="text-sm md:text-base text-foreground/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {slides[currentSlide].description}
            </motion.p>
            
            {/* Decorative Rajasthani-inspired dots */}
            <motion.div 
              className="flex gap-2 justify-center pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary/40"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 0.8, 0.4]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 mt-4">
          {slides.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? "w-12 bg-gradient-to-r from-primary to-accent" : "w-2 bg-primary/30"
              }`}
              animate={{
                scale: index === currentSlide ? [1, 1.1, 1] : 0.8,
              }}
              transition={{
                scale: index === currentSlide ? {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                } : {}
              }}
            />
          ))}
        </div>

        <motion.button
          onClick={() => navigate("/home")}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
          }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ delay: 1.5, type: "spring" }}
          className="mt-6 px-10 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full font-semibold shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity"
            initial={false}
          />
          <span className="relative z-10">Get Started</span>
        </motion.button>
      </div>
    </div>
  );
};

export default Splash;
