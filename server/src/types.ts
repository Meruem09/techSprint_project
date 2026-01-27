// Manual types definition since Prisma generation failed

export enum Role {
    PUBLIC = 'PUBLIC',
    GOV_EMPLOYEE = 'GOV_EMPLOYEE',
    ADMIN = 'ADMIN',
    AUDITOR = 'AUDITOR'
}

export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
    department?: string;
    verified: boolean;
    mfaEnabled: boolean;
    mfaSecret?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthRequest {
    email: string;
    password: string;
}

export interface RegisterRequest extends AuthRequest {
    name: string;
    role?: Role; // Only Admin can assign generally, but for dev...
    department?: string;
}
