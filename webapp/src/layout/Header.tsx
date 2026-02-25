import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="glass-card border-b px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Menu + Logo */}
        <div className="flex items-center space-x-4">
          <Button
            onClick={onMenuClick}
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-300 hover:bg-slate-700/50"
          >
            <Bars3Icon className="size-6" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-sp-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">💰</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SmartPocket</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Financial Management</p>
            </div>
          </div>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            className="text-slate-300 hover:bg-slate-700/50 relative"
          >
            <BellIcon className="size-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
          </Button>
          
          <Button
            variant="ghost"
            className="text-slate-300 hover:bg-slate-700/50"
          >
            <UserCircleIcon className="size-8" />
            <span className="hidden sm:block text-sm font-medium ml-2">Usuario</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
