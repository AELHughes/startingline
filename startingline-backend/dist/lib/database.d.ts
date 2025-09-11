import { Pool } from 'pg';
import type { User, CreateUserData } from '../types';
declare const pool: Pool;
export declare function createUser(userData: CreateUserData): Promise<User>;
export declare function authenticateUser(email: string, password: string): Promise<User>;
export declare function getUserById(userId: string): Promise<User | null>;
export declare function getUserByEmail(email: string): Promise<User | null>;
export declare function updateUser(userId: string, updates: Partial<User>): Promise<User>;
export declare function deleteUser(userId: string): Promise<void>;
export declare function isAdminUser(email: string): Promise<boolean>;
export declare function updatePassword(userId: string, newPassword: string): Promise<void>;
export declare function verifyPassword(userId: string, password: string): Promise<boolean>;
export declare function testConnection(): Promise<boolean>;
export declare function getTableCounts(): Promise<Record<string, number>>;
export { pool };
export default pool;
//# sourceMappingURL=database.d.ts.map