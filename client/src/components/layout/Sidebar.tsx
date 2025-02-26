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
        "flex items-center px-4 py-3 text-white hover:bg-primary-600 font-medium cursor-pointer",
        active && "bg-primary-600"
      )}>
        <span className="h-5 w-5 mr-3 text-white">{icon}</span>
        <span className="text-white">{children}</span>
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
        className="fixed top-4 left-4 p-2 rounded-md lg:hidden z-40 text-neutral-600 hover:bg-neutral-100"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div 
        id="sidebar" 
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-30 w-64 transform transition duration-200 ease-in-out bg-primary-500 text-white",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-primary-600">
            <div className="flex items-center space-x-2">
              <Building className="h-8 w-8" />
              <h1 className="text-xl font-bold">AirMaint</h1>
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto pt-4">
            <div className="px-4 mb-3 text-sm font-medium text-primary-200 uppercase">Menú Principal</div>
            
            <NavItem href="/" icon={<Home />} active={location === '/'}>
              Panel de Control
            </NavItem>

            <div className="px-4 mt-6 mb-3 text-sm font-medium text-primary-200 uppercase">Mantenimiento</div>
            
            <NavItem href="/corrective" icon={<AlertTriangle />} active={location === '/corrective'}>
              Correctivo
            </NavItem>
            
            <NavItem href="/preventive" icon={<Clipboard />} active={location === '/preventive'}>
              Preventivo
            </NavItem>
            
            <NavItem href="/purchasing" icon={<ShoppingBag />} active={location === '/purchasing'}>
              Compras
            </NavItem>

            <div className="px-4 mt-6 mb-3 text-sm font-medium text-primary-200 uppercase">Organización</div>
            
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

          {user && (
            <div className="p-4 border-t border-primary-600">
              <div className="flex items-center">
                <img 
                  src={user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                  alt="User profile" 
                  className="h-8 w-8 rounded-full mr-3"
                />
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-primary-200">
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
    </>
  );
}
