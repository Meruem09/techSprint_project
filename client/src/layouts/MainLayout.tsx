import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function MainLayout() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            <header className="border-b">
                <div className="container flex h-16 items-center justify-between px-4">
                    <Link to="/" className="text-2xl font-bold text-primary">
                        GovTransparency
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link to="/projects" className="text-sm font-medium transition-colors hover:text-primary">
                            Projects
                        </Link>
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">Hello, {user.name}</span>
                                <Button variant="outline" size="sm" onClick={logout}>
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <Link to="/login" className="text-sm font-medium transition-colors hover:text-primary">
                                Login
                            </Link>
                        )}
                    </nav>
                </div>
            </header>
            <main className="container py-6 px-4">
                <Outlet />
            </main>
            <footer className="border-t py-6 text-center text-sm text-muted-foreground">
                © 2026 Government Project Transparency Platform
            </footer>
        </div>
    );
}
