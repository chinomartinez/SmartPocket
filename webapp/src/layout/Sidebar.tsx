import { 
  HomeIcon, 
  CreditCardIcon, 
  BanknotesIcon, 
  TagIcon,
  ChartBarIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '@/router/routes';

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  { icon: HomeIcon, label: 'Dashboard', path: ROUTES.DASHBOARD },
  { icon: CreditCardIcon, label: 'Cuentas', path: ROUTES.ACCOUNTS },
  { icon: BanknotesIcon, label: 'Transacciones', path: ROUTES.TRANSACTIONS },
  { icon: TagIcon, label: 'Categorías', path: ROUTES.CATEGORIES },
  { icon: ChartBarIcon, label: 'Reportes', path: ROUTES.REPORTS },
  { icon: Cog6ToothIcon, label: 'Configuración', path: ROUTES.SETTINGS }
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  const handleItemClick = () => {
    // En móvil, cerrar sidebar al hacer click
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 
        glass-card-strong border-r
        transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transition-transform duration-300 ease-in-out
      `}>
        <div className="flex flex-col h-full">
          {/* Logo móvil */}
          <div className="lg:hidden p-6 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-sp-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">💰</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">SmartPocket</h2>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleItemClick}
                  className={`
                    group w-full flex items-center space-x-3 px-4 py-3 rounded-xl
                    transition-all duration-200 text-left
                    ${isActive 
                      ? 'bg-sp-blue-600/20 text-sp-blue-400 border border-sp-blue-600/30' 
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-slate-700/50">
            <div className="bg-slate-900/50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-2">Version</p>
              <p className="text-sm font-medium text-white">v1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
