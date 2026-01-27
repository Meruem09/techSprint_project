import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom';

interface Project {
    id: string;
    projectName: string;
    department: string;
    currentStatus: string;
    currentProgress: number;
    budget: number;
    location: any;
}

export default function ProjectListPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock API call - in prod use fetch('/api/projects')
        // For now we'll fetch from our server or use mock data if server isn't reachable from client easily (CORS)
        const fetchProjects = async () => {
            try {
                const response = await fetch('http://localhost:3001/projects');
                if (response.ok) {
                    const data = await response.json();
                    setProjects(data);
                } else {
                    console.error('Failed to fetch');
                }
            } catch (err) {
                console.error('Error fetching projects:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Public Projects</h1>
                <Button>Filter Projects</Button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : projects.length === 0 ? (
                <div className="text-muted-foreground text-center py-10">
                    No projects found. Check back later.
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) =>
                        <div key={project.id} className="group relative rounded-xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-xl tracking-tight text-foreground/90">{project.projectName}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{project.department} • {project.location?.district || 'Unknown Location'}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${project.currentStatus === 'COMPLETED' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                    project.currentStatus === 'DELAYED' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                        'bg-blue-50 text-blue-700 ring-blue-600/20'
                                    }`}>
                                    {project.currentStatus}
                                </span>
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Budget</span>
                                    <span className="font-medium">₹{project.budget.toLocaleString()}</span>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Progress</span>
                                        <span>{project.currentProgress}%</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-primary transition-all duration-500"
                                            style={{ width: `${project.currentProgress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-border/40 flex justify-end">
                                <Link to={`/projects/${project.id}`}>
                                    <Button variant="ghost" size="sm" className="hover:bg-primary/5 text-primary">
                                        View Details →
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
