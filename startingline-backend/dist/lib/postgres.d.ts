import { Pool } from 'pg';
declare const pool: Pool;
export { pool };
export declare function insertUserDirect(userData: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
}): Promise<{
    data: any;
    error: null;
} | {
    data: null;
    error: any;
}>;
//# sourceMappingURL=postgres.d.ts.map