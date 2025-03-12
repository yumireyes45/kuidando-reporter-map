
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Menu, X, User, LogOut, Map as MapIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 ${
        scrolled ? "bg-background/90 backdrop-blur-lg shadow-sm" : "bg-background"
      } transition-all duration-300`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2" 
            onClick={closeMenu}
          >
            <MapPin className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Kuidando</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/map" 
              className={`transition-colors hover:text-primary ${
                location.pathname === "/map" ? "text-primary font-medium" : ""
              }`}
            >
              Mapa
            </Link>
            
            {isAuthenticated ? (
              <>
                <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar sesión</span>
                </Button>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{user?.name}</span>
                </div>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Iniciar sesión</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-background shadow-lg"
          >
            <div className="px-4 py-5 space-y-4">
              <Link 
                to="/map" 
                className="block py-2 text-center rounded-md hover:bg-secondary transition-colors"
                onClick={closeMenu}
              >
                <div className="flex items-center justify-center gap-2">
                  <MapIcon className="w-5 h-5" />
                  <span>Mapa</span>
                </div>
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="flex items-center justify-center space-x-3 py-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{user?.name}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full justify-center flex items-center gap-2"
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar sesión</span>
                  </Button>
                </>
              ) : (
                <Link 
                  to="/auth" 
                  className="block" 
                  onClick={closeMenu}
                >
                  <Button variant="default" className="w-full justify-center flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Iniciar sesión</span>
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
