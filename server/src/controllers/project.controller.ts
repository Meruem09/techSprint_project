import { Request, Response } from 'express';
import { LedgerService } from '../services/ledger.service';
import { Role } from '../types';

// Mock projects store
const projects: any[] = [];

export const createProject = async (req: Request, res: Response) => {
    try {
        // @ts-ignore - In real app, user is attached by auth middleware
        const user = req.user;

        // MVP Check: Allow if role is GOV_EMPLOYEE or ADMIN (skipped for now as middleware isn't enforcing yet)

        const { projectName, department, budget, location } = req.body;

        const newProject = {
            id: Math.random().toString(36).substr(2, 9),
            projectName,
            department,
            budget,
            location,
            status: 'SANCTIONED',
            progress: 0,
            createdBy: 'mock-user-id', // Use req.user.id
            createdAt: new Date()
        };

        projects.push(newProject);

        // Create Genesis Event
        LedgerService.createEvent(
            newProject.id,
            'PROJECT_CREATED',
            { projectName, department, budget },
            'mock-user-id'
        );

        res.status(201).json({ message: 'Project created', project: newProject });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create project', error });
    }
};

export const getProjects = async (req: Request, res: Response) => {
    try {
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch projects', error });
    }
};

export const getProjectDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const projectId = id as string;
        const project = projects.find(p => p.id === projectId);

        if (!project) return res.status(404).json({ message: 'Project not found' });

        const timeline = LedgerService.getTimeline(projectId);
        const integrity = LedgerService.verifyIntegrity(projectId);

        res.json({ project, timeline, integrity });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching details', error });
    }
};

export const addEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const projectId = id as string;
        const { eventType, data } = req.body;

        // Verify project exists
        const project = projects.find(p => p.id === projectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });

        const event = LedgerService.createEvent(projectId, eventType, data, 'mock-user-id');

        // Update project status if needed
        if (eventType === 'PROGRESS_UPDATE' && data.progress) {
            project.progress = data.progress;
        }

        res.status(201).json({ message: 'Event added', event });
    } catch (error) {
        res.status(500).json({ message: 'Error adding event', error });
    }
};
