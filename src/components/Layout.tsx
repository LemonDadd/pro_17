import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Hexagon, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { to: '/', label: '色板' },
  { to: '/gradient', label: '渐变' },
  { to: '/shadow', label: '阴影' },
  { to: '/export', label: '导出' },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <NavLink to="/" className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
            <Hexagon className="h-5 w-5 text-violet-500" />
            <span>TokenForge</span>
          </NavLink>

          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'relative px-3 py-4 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-violet-400'
                      : 'text-zinc-400 hover:text-zinc-200'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-violet-500" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-zinc-400 hover:text-zinc-100 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-zinc-800 px-4 pb-3 md:hidden">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'block px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-violet-400'
                      : 'text-zinc-400 hover:text-zinc-200'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
