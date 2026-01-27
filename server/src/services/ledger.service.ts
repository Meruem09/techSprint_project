import crypto from 'crypto';

interface EventData {
    projectId: string;
    eventType: string;
    data: any;
    timestamp: string;
    actorId: string;
}

export class LedgerService {
    // In-memory store for MVP since DB isn't ready
    private static events: any[] = [];
    private static genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';

    static calculateHash(data: EventData, previousHash: string): string {
        const payload = JSON.stringify(data) + previousHash;
        return crypto.createHash('sha256').update(payload).digest('hex');
    }

    static createEvent(projectId: string, eventType: string, data: any, actorId: string) {
        // Find last event for project to get previous hash
        const projectEvents = this.events.filter(e => e.projectId === projectId);
        const lastEvent = projectEvents[projectEvents.length - 1];
        const previousHash = lastEvent ? lastEvent.currentHash : this.genesisHash;

        const timestamp = new Date().toISOString();
        const eventData: EventData = {
            projectId,
            eventType,
            data,
            timestamp,
            actorId
        };

        const currentHash = this.calculateHash(eventData, previousHash);

        const newEvent = {
            id: Math.random().toString(36).substr(2, 9),
            ...eventData,
            previousHash,
            currentHash
        };

        this.events.push(newEvent);
        return newEvent;
    }

    static getTimeline(projectId: string) {
        return this.events
            .filter(e => e.projectId === projectId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Newest first
    }

    static verifyIntegrity(projectId: string): { valid: boolean; brokenAt?: string } {
        const projectEvents = this.events
            .filter(e => e.projectId === projectId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); // Oldest first

        if (projectEvents.length === 0) return { valid: true };

        for (let i = 0; i < projectEvents.length; i++) {
            const event = projectEvents[i];
            const previousHash = i === 0 ? this.genesisHash : projectEvents[i - 1].currentHash;

            if (event.previousHash !== previousHash) {
                return { valid: false, brokenAt: event.id };
            }

            const eventData: EventData = {
                projectId: event.projectId,
                eventType: event.eventType,
                data: event.data,
                timestamp: event.timestamp,
                actorId: event.actorId
            };

            const calculatedHash = this.calculateHash(eventData, previousHash);

            if (calculatedHash !== event.currentHash) {
                return { valid: false, brokenAt: event.id };
            }
        }

        return { valid: true };
    }
}
