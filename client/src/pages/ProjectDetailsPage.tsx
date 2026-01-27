import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';


interface TimelineEvent {
    id: string;
    eventType: string;
    data: any;
    timestamp: string;
    currentHash: string;
    previousHash: string;
}

interface ProjectDetails {
    project: any;
    timeline: TimelineEvent[];
    integrity: { valid: boolean; brokenAt?: string };
}

export default function ProjectDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [projectData, setProjectData] = useState<ProjectDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await fetch(`http://localhost:3000/projects/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProjectData(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetails();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!projectData) return <div>Project not found</div>;

    const { project, timeline, integrity } = projectData;

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{project.projectName}</h1>
                        <p className="text-muted-foreground">{project.department} • {project.location?.district || 'Unknown Location'}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg border ${integrity.valid ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                        Integrity Check: {integrity.valid ? 'PASSED ✓' : 'FAILED ⚠'}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Budget</div>
                        <div className="text-xl font-bold">₹{project.budget}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground">Status</div>
                        <div className="text-xl font-bold">{project.status}</div>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4">Project Timeline (Immutable Ledger)</h2>
                <div className="relative border-l-2 border-muted ml-3 space-y-8 pb-8">
                    {timeline.map((event) => (
                        <div key={event.id} className="relative pl-8">
                            <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-primary border-4 border-background" />
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <h3 className="font-semibold">{event.eventType}</h3>
                                    <span className="text-sm text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</span>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-md text-sm">
                                    {event.eventType === 'PROJECT_CREATED' && (
                                        <p>Project sanctioned with budget ₹{event.data.budget}</p>
                                    )}
                                    {event.eventType === 'PROGRESS_UPDATE' && (
                                        <p>Progress reported: {event.data.progress}%</p>
                                    )}
                                    <div className="mt-2 pt-2 border-t border-dashed border-gray-300 text-xs font-mono text-gray-500 break-all">
                                        Hash: {event.currentHash}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
