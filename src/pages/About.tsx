import { motion } from "framer-motion";
import { Shield, Heart, Users, Target } from "lucide-react";
import Navbar from "@/components/Navbar";
import SOSButton from "@/components/SOSButton";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@/assets/jaipur-hero.jpg";

const About = () => {
  const features = [
    {
      icon: Shield,
      title: "Safety First",
      description: "Our primary mission is ensuring every traveler explores Jaipur with confidence and security.",
    },
    {
      icon: Heart,
      title: "Women Empowerment",
      description: "Special focus on creating safe spaces for solo women travelers to explore freely.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Built on verified reports from local residents and experienced travelers.",
    },
    {
      icon: Target,
      title: "Tourism Support",
      description: "Promoting Jaipur's rich culture while prioritizing visitor safety and wellbeing.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-64 md:h-80 overflow-hidden"
        >
          <img
            src={heroImage}
            alt="Jaipur"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/60 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold mb-4"
              >
                About Safe-Bazaar
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl max-w-2xl mx-auto"
              >
                Empowering travelers to explore the Pink City safely
              </motion.p>
            </div>
          </div>
        </motion.div>

        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto mb-12"
          >
            <Card className="shadow-soft">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-4 text-center">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed text-center">
                  Safe-Bazaar was created to bridge the gap between Jaipur's incredible cultural heritage 
                  and the safety concerns that travelers, especially solo women, often face. We believe 
                  that everyone should experience the magic of the Pink City without compromising their 
                  security. Through community-verified data and real-time updates, we're building a safer, 
                  more inclusive travel experience for all.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="h-full shadow-card hover:shadow-soft transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-12 text-center"
          >
            <Card className="max-w-2xl mx-auto shadow-soft">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl font-bold mb-3">Join Our Community</h3>
                <p className="text-muted-foreground mb-4">
                  Help us make Jaipur safer for everyone. Share your experiences, report locations, 
                  and contribute to a growing community of responsible travelers.
                </p>
                <p className="text-sm text-muted-foreground italic">
                  Together, we're making travel safer, one location at a time.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <SOSButton />
    </div>
  );
};

export default About;
