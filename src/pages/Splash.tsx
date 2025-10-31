import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import heroImage from "@/assets/jaipur-hero.jpg";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      <motion.div
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0"
      >
        <img
          src={heroImage}
          alt="Jaipur"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/80" />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <motion.img
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.5,
          }}
          src={logo}
          alt="Safe-Bazaar"
          className="w-32 h-32"
        />

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
            Safe-Bazaar
          </h1>
          <p className="text-xl text-foreground/80 italic">
            Explore Jaipur Safely
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 1.5,
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="mt-8"
        >
          <div className="w-2 h-2 rounded-full bg-primary" />
        </motion.div>
      </div>
    </div>
  );
};

export default Splash;
