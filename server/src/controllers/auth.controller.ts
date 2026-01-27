import { Request, Response } from 'express';
import { User, Role, RegisterRequest } from '../types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock DB with Seed Data
const users: User[] = [
    {
        id: 'admin-123',
        name: 'System Admin',
        email: 'admin@gov.in',
        passwordHash: '$2b$10$YourHashedPasswordHere', // We need a real hash or logic to bypass for mock
        role: Role.ADMIN,
        verified: true,
        mfaEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'gov-123',
        name: 'Demo Officer',
        email: 'demo@gov.in',
        passwordHash: '$2b$10$YourHashedPasswordHere',
        role: Role.GOV_EMPLOYEE,
        verified: true, // Auto-verified for demo
        department: 'Public Works',
        mfaEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, department } = req.body as RegisterRequest;

        if (users.find(u => u.email === email)) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            email,
            passwordHash,
            role: Role.PUBLIC, // Default
            department: department || undefined,
            verified: false,
            mfaEnabled: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Auto-verify/role for dev convenience if needed, otherwise stick to PRD
        if (department) {
            newUser.role = Role.GOV_EMPLOYEE;
            // In PRD, verified should be false until Admin approves.
        }

        users.push(newUser);

        res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Mock password check for seeded users to avoid needing valid bcrypt hash of "password"
        let validPassword = false;
        if (user.id === 'admin-123' || user.id === 'gov-123') {
            validPassword = password === 'password';
        } else {
            validPassword = await bcrypt.compare(password, user.passwordHash);
        }

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.role === Role.GOV_EMPLOYEE && !user.verified) {
            return res.status(403).json({ message: 'Account pending verification' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role, email: user.email },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '15m' }
        );

        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error });
    }
};
