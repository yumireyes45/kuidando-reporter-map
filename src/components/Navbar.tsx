
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Menu, X, User, LogOut, Map as MapIcon, Annoyed, MessageCirclePlus, Plus } from "lucide-react";
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


  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    closeMenu();
    if (location.pathname === '/') {
      // If we're already on index, just refresh
      window.location.reload();
    } else {
      // If we're on another page, navigate to index and refresh
      window.location.href = '/';
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 ${
        scrolled ? "bg-background/90 backdrop-blur-lg shadow-sm" : "bg-background"
      } transition-all duration-300`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 mt-2 md:mt-2">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2" 
            onClick={closeMenu}
          >
            <img
              src="/imagenes/loguito.webp"  // Reemplaza con la ruta a tu logo
              alt="Logo Kuidando"
              className="h-10 w-auto mr-2"

            />
          </Link>

          {/* Updated Logo click handler 
          <a 
            href="/"
            className="flex items-center space-x-2" 
            onClick={handleLogoClick}
          >
            <img
              src="/imagenes/loguito.webp"
              alt="Logo Kuidando"
              className="h-10 w-auto mr-2"
            />
          </a>
          */}

          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/map" 
              className={`transition-colors hover:text-amber-600 font-semibold ${
                location.pathname === "/map" ? "text-amber-600 " : ""
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                  <MapIcon className="w-5 h-5" />
                  <span>Mapa</span>
              </div>
            </Link>

            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`transition-colors hover:text-amber-600 font-semibold ${
                    location.pathname === "/dashboard" ? "text-amber-600 " : ""
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                      <Annoyed className="w-5 h-5" />
                      <span>Ver Reportes</span>
                  </div>
                </Link>

                <div className="flex items-center space-x-2 text-sm">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {user?.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">{user?.email}</span>
                </div>

                <Link to="/report">
                  <Button variant="outline" size="sm"
                  className="flex items-center gap-2 hover:bg-amber-400 hover:text-black transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Reporte</span>
                  </Button>
                </Link>

                <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar sesión</span>
                </Button>



              </>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm" className="button-custom flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Iniciar sesión</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="hover:bg-amber-400 hover:text-black transition-colors">
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
                className={`block transition-colors hover:text-amber-600 font-semibold ${
                  location.pathname === "/map" ? "text-amber-600 " : ""
                }`}
                onClick={closeMenu}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MapIcon className="w-5 h-5" />
                  <span>Mapa</span>
                </div>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`block transition-colors hover:text-amber-600 font-semibold ${
                      location.pathname === "/dashboard" ? "text-amber-600 " : ""
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 ">
                        <Annoyed className="w-5 h-5" />
                        <span>Ver Reportes</span>
                    </div>
                  </Link>


                  <div className="flex items-center justify-center space-x-3 py-2 pb-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {user?.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{user?.email}</span>
                  </div>

                  <Link to="/report">
                    <Button variant="outline" size="sm"
                    className="w-full justify-center flex items-center gap-2 bg-amber-400 text-black h-10">
                      <Plus className="w-4 h-4" />
                      <span>Nuevo Reporte</span>
                    </Button>
                  </Link>


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
                  <Button variant="default" className="button-custom w-full justify-center flex items-center gap-2">
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
