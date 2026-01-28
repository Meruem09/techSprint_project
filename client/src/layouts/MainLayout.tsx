import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function MainLayout() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-background font-sans antialiased text-foreground">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4">
                    <Link to="/" className="text-2xl font-bold text-primary">
                        GovTransparency
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link to="/projects" className="text-sm font-medium transition-colors hover:text-primary">
                            Public Projects
                        </Link>

                        {user?.role === 'GOV_EMPLOYEE' && (
                            <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                                <Button variant="ghost">My Dashboard</Button>
                            </Link>
                        )}

                        {user?.role === 'ADMIN' && (
                            <Link to="/admin" className="text-sm font-medium transition-colors hover:text-primary">
                                <Button variant="ghost" className="text-purple-600">Admin Panel</Button>
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center gap-4 pl-4 border-l">
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-medium leading-none">{user.name}</span>
                                    <span className="text-xs text-muted-foreground">{user.role.replace('_', ' ')}</span>
                                </div>
                                <Button variant="outline" size="sm" onClick={logout}>
                                    Logout
                                </Button>
                            </div>
                        ) : (
                            <Link to="/login">
                                <Button>Login</Button>
                            </Link>
                        )}
                    </nav>
                </div>
            </header>
            <main className="container py-6 px-4">
                <Outlet />
            </main>
            <footer className="border-t bg-muted/30">
                <div className="container py-12 px-4 grid gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <Link to="/" className="text-xl font-bold text-primary">
                            GovTransparency
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Empowering citizens with real-time tracking of government projects.
                            Building trust through immutable records.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/projects" className="hover:text-primary">Explore Projects</Link></li>
                            <li><Link to="/login" className="hover:text-primary">Official Login</Link></li>
                            <li><Link to="#" className="hover:text-primary">Open Data API</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="#" className="hover:text-primary">Privacy Policy</Link></li>
                            <li><Link to="#" className="hover:text-primary">Terms of Service</Link></li>
                            <li><Link to="#" className="hover:text-primary">Accessibility</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Contact</h4>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>Ministry of Public Works</p>
                            <p>New Delhi, India</p>
                            <p>support@gov-transparency.in</p>
                        </div>
                    </div>
                </div>
                <div className="border-t py-6 text-center text-sm text-muted-foreground">
                    © 2026 Government Project Transparency Platform. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
