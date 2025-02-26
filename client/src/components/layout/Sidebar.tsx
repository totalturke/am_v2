import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "@/lib/utils";

// Icons
import { 
  Home, 
  AlertTriangle, 
  Clipboard, 
  ShoppingBag, 
  MapPin, 
  Building, 
  Home as HomeIcon,
  Menu,
  X
} from "lucide-react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
}

const NavItem = ({ href, icon, children, active }: NavItemProps) => {
  return (
    <Link href={href}>
      {/* Direct span instead of anchor to avoid a inside a issue */}
      <span className={cn(
        "flex items-center px-4 py-4 text-white hover:bg-primary-800 font-medium cursor-pointer rounded-md my-1 mx-2 text-base",
        active && "bg-primary-800"
      )}>
        <span className="h-6 w-6 mr-4 text-white">{icon}</span>
        <span className="text-white font-medium">{children}</span>
      </span>
    </Link>
  );
};

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Handle sidebar toggle for mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    // Set initial state
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile sidebar toggle button */}
      <button 
        onClick={toggleSidebar}
        className="fixed top-4 left-4 p-3 rounded-md lg:hidden z-40 bg-primary-600 text-white hover:bg-primary-700 shadow-lg"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Sidebar */}
      <div 
        id="sidebar" 
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-30 w-72 transform transition duration-200 ease-in-out bg-gray-900 text-white shadow-xl overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* App logo and title */}
          <div className="p-5 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <Building className="h-9 w-9 text-primary-400" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-transparent">AirMaint</h1>
            </div>
          </div>
          
          {/* Navigation menu */}
          <nav className="flex-1 overflow-y-auto pt-5 pb-4">
            <div className="px-5 mb-2 text-sm font-bold text-primary-300 uppercase tracking-wider">Menú Principal</div>
            
            <NavItem href="/" icon={<Home />} active={location === '/'}>
              Panel de Control
            </NavItem>

            <div className="px-5 mt-6 mb-2 text-sm font-bold text-primary-300 uppercase tracking-wider">Mantenimiento</div>
            
            <NavItem href="/corrective" icon={<AlertTriangle />} active={location === '/corrective'}>
              Correctivo
            </NavItem>
            
            <NavItem href="/preventive" icon={<Clipboard />} active={location === '/preventive'}>
              Preventivo
            </NavItem>
            
            <NavItem href="/purchasing" icon={<ShoppingBag />} active={location === '/purchasing'}>
              Compras
            </NavItem>

            <div className="px-5 mt-6 mb-2 text-sm font-bold text-primary-300 uppercase tracking-wider">Organización</div>
            
            <NavItem href="/cities" icon={<MapPin />} active={location === '/cities'}>
              Ciudades
            </NavItem>
            
            <NavItem href="/buildings" icon={<Building />} active={location === '/buildings'}>
              Edificios
            </NavItem>
            
            <NavItem href="/apartments" icon={<HomeIcon />} active={location === '/apartments'}>
              Apartamentos
            </NavItem>
          </nav>

          {/* User profile section */}
          {user && (
            <div className="p-4 border-t border-gray-800 bg-gray-800 m-2 rounded-lg">
              <div className="flex items-center">
                <img 
                  src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                  alt="User profile" 
                  className="h-10 w-10 rounded-full mr-3 border-2 border-primary-400"
                />
                <div>
                  <p className="text-base font-medium text-white">{user.name}</p>
                  <p className="text-sm text-primary-300">
                    {user.role === 'control_center' ? 'Centro de Control' : 
                     user.role === 'maintenance_agent' ? 'Agente de Mantenimiento' : 
                     user.role === 'purchasing_agent' ? 'Agente de Compras' : user.role}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Semi-transparent overlay for mobile - closes sidebar when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
