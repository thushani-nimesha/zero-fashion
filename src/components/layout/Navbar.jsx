import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Shirt, Moon, Sun, UserCircle } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/theme-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const publicLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'About', to: '/about' },
];

export default function Navbar() {
  const { count, openCart } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [cartPop, setCartPop] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  React.useEffect(() => {
    if (count === 0) return;
    setCartPop(true);
    const timer = setTimeout(() => setCartPop(false), 500);
    return () => clearTimeout(timer);
  }, [count]);

  const submit = (e) => {
    e.preventDefault();
    navigate(`/shop?q=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-heading text-lg font-extrabold tracking-tight">
          <img src="/05_ZF_Rounded_Square_Icon.png" alt="Zero Fashion" className="h-9 w-9 rounded-lg shadow-[0_0_20px_-2px_hsl(var(--primary))] object-cover" />
          <span>ZERO<span className="text-primary"> FASHION</span></span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {publicLinks.map(l => (
            <Link key={l.to} to={l.to} className={`rounded-md px-3 py-2 text-sm font-medium transition hover:text-primary ${pathname === l.to ? 'text-primary' : 'text-muted-foreground'}`}>{l.label}</Link>
          ))}
        </nav>

        {/* Desktop Auth Links */}
        {!isAuthenticated && (
          <div className="hidden md:flex items-center gap-2 ml-4">
            <Button variant="ghost" size="sm" asChild><Link to="/login">Login</Link></Button>
            <Button size="sm" asChild><Link to="/register">Register</Link></Button>
          </div>
        )}

        <div className="ml-auto hidden items-center md:flex relative">
          <form 
            onSubmit={submit} 
            className="flex items-center"
            onMouseEnter={() => setSearchExpanded(true)}
            onMouseLeave={() => { if (!q) setSearchExpanded(false); }}
          >
            <div className={`relative flex items-center h-10 transition-all duration-500 ease-in-out ${searchExpanded ? 'w-64' : 'w-10'}`}>
              <button
                type="submit"
                onClick={(e) => {
                  if (!searchExpanded) {
                    e.preventDefault();
                    setSearchExpanded(true);
                  }
                }}
                className="absolute z-10 flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-300 left-0.5"
              >
                <Search className="h-4 w-4" />
              </button>
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search products…"
                className={`w-full h-9 bg-muted/40 border border-border text-sm rounded-full pl-9 pr-4 outline-none transition-all duration-500 ease-in-out focus:border-primary/50 focus:shadow-[0_0_15px_rgba(255,255,255,0.05)] ${
                  searchExpanded ? 'opacity-100 scale-x-100 origin-left' : 'opacity-0 scale-x-0 origin-left pointer-events-none'
                }`}
              />
            </div>
          </form>
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            className="relative touch-manipulation overflow-hidden rounded-full h-9 w-9 flex items-center justify-center"
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <Sun className={`h-5 w-5 text-yellow-500 absolute transition-all duration-500 ease-out ${
                theme === 'dark' ? 'translate-y-0 scale-100 opacity-100 rotate-0' : 'translate-y-6 scale-50 opacity-0 -rotate-90'
              }`} />
              <Moon className={`h-5 w-5 text-indigo-400 absolute transition-all duration-500 ease-out ${
                theme === 'light' ? 'translate-y-0 scale-100 opacity-100 rotate-0' : '-translate-y-6 scale-50 opacity-0 rotate-90'
              }`} />
            </div>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={openCart} 
            className={`relative touch-manipulation transition-all duration-300 ${cartPop ? 'scale-110 text-primary' : ''}`}
          >
            <ShoppingCart className={`h-5 w-5 transition-transform duration-300 ${cartPop ? 'scale-110' : ''}`} />
            {count > 0 && (
              <span className={`absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground transition-all duration-300 ${
                cartPop ? 'scale-110 animate-bounce' : ''
              }`}>
                {count}
              </span>
            )}
          </Button>

          {isAuthenticated && (
            <div className="relative group ml-1">
              <Link 
                to={user?.role === 'admin' ? '/admin' : '/dashboard'} 
                className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer overflow-visible"
              >
                {user?.name ? user.name[0].toUpperCase() : <UserCircle className="h-5 w-5" />}
              </Link>
              
              {/* Premium Hover Dropdown Card (Desktop Only) */}
              <div className="hidden md:block absolute right-0 top-full mt-2 w-56 rounded-2xl bg-card border border-border p-4 shadow-xl opacity-0 scale-95 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto z-50">
                <div className="flex flex-col gap-1 pb-3 border-b border-border text-left">
                  <p className="text-sm font-bold text-foreground truncate">{user?.name || 'Customer'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <div className="pt-2 flex flex-col gap-1 text-left">
                  <Link 
                    to={user?.role === 'admin' ? '/admin' : '/dashboard'} 
                    className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-muted/60 transition-colors flex items-center justify-between text-muted-foreground hover:text-foreground"
                  >
                    <span>Dashboard</span>
                    <span className="text-[10px] bg-primary/10 px-1.5 py-0.5 rounded text-primary uppercase font-bold">{user?.role || 'user'}</span>
                  </Link>
                  <button
                    onClick={async () => {
                      await logout();
                      navigate('/');
                    }}
                    className="text-xs text-left px-2.5 py-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors mt-1"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          <Button variant="ghost" size="icon" className="md:hidden touch-manipulation" onClick={() => setOpen(v => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border md:hidden bg-background">
          <div className="mx-auto max-w-7xl space-y-2 px-4 py-3">
            <form onSubmit={submit} className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products…" className="bg-muted/50 pl-9" />
            </form>
            {publicLinks.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm font-medium hover:text-primary">{l.label}</Link>
            ))}
            
            {/* Mobile Auth Links */}
            <div className="pt-4 mt-4 border-t border-border">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm font-medium text-muted-foreground">Signed in as {user?.email}</div>
                  <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setOpen(false)} className="block w-full text-left rounded-md px-3 py-2 text-sm font-medium hover:text-primary">My Account</Link>
                  <button 
                    onClick={async () => {
                      setOpen(false);
                      await logout();
                      navigate('/');
                    }} 
                    className="block w-full text-left rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 mt-1"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm font-medium hover:text-primary">Login</Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm font-medium text-primary hover:text-primary/80">Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}