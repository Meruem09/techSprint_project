import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"

export default function LandingPage() {
    return (
        <div className="flex flex-col items-center justify-center space-y-10 py-20 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl">
                Transparency in <span className="text-primary">Government Projects</span>
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground">
                A tamper-proof, public accountability platform ensuring every government scheme update is permanent and visible to citizens.
            </p>
            <div className="flex gap-4">
                <Link to="/projects">
                    <Button size="lg">View Public Projects</Button>
                </Link>
                <Link to="/register">
                    <Button variant="outline" size="lg">Official Sign Up</Button>
                </Link>
            </div>
        </div>
    );
}
