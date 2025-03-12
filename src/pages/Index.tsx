
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, Map, AlertTriangle, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

const Index = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: MapPin,
      title: "Reporta problemas",
      description: "Informa sobre problemas urbanos como veredas rotas, pistas con huecos, basura acumulada y más."
    },
    {
      icon: Map,
      title: "Visualiza en el mapa",
      description: "Mira todos los problemas reportados por los ciudadanos en un mapa interactivo."
    },
    {
      icon: AlertTriangle,
      title: "Suma tu apoyo",
      description: "Súmate a reportes existentes para aumentar su visibilidad y prioridad de atención."
    },
    {
      icon: CheckCircle,
      title: "Mejora tu comunidad",
      description: "Contribuye a tener una ciudad más limpia, segura y bien mantenida para todos."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 md:px-6">
        <div className="container max-w-6xl mx-auto">
          <motion.div 
            className="flex flex-col items-center text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
              <span>Plataforma ciudadana</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
              Mejora tu ciudad reportando problemas urbanos
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Kuidando te permite reportar y visualizar problemas urbanos en tu comunidad para que las autoridades puedan atenderlos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/map">
                <Button size="lg" className="gap-2">
                  <Map className="h-5 w-5" />
                  <span>Ver mapa</span>
                </Button>
              </Link>
              
              <Link to={isAuthenticated ? "/report" : "/auth"}>
                <Button size="lg" variant="outline" className="gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{isAuthenticated ? "Reportar problema" : "Iniciar sesión"}</span>
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4 md:px-6 bg-secondary/50">
        <div className="container max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-4">¿Cómo funciona Kuidando?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Una plataforma simple pero poderosa para reportar y atender los problemas de infraestructura urbana
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-background border border-border/50 shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6">
        <div className="container max-w-6xl mx-auto">
          <motion.div 
            className="bg-primary/5 border border-primary/10 rounded-2xl p-8 lg:p-12"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center lg:text-left">
                <h2 className="text-3xl font-bold">¿Listo para reportar un problema?</h2>
                <p className="text-muted-foreground max-w-xl">
                  Ayuda a mejorar tu comunidad reportando los problemas que encuentres en las calles, parques y espacios públicos.
                </p>
              </div>
              
              <div className="flex gap-4">
                <Link to="/map">
                  <Button variant="outline" size="lg" className="gap-2">
                    <Map className="h-5 w-5" />
                    <span>Ver mapa</span>
                  </Button>
                </Link>
                
                <Link to={isAuthenticated ? "/report" : "/auth"}>
                  <Button size="lg" className="gap-2">
                    <ArrowRight className="h-5 w-5" />
                    <span>{isAuthenticated ? "Reportar" : "Comenzar"}</span>
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="mt-auto py-10 px-4 md:px-6 border-t border-border">
        <div className="container max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">Kuidando</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Kuidando. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
