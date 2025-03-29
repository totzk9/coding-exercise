import { Pool, PoolClient } from 'pg';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL: string = process.env.SUPABASE_URL!;
const ANON_KEY: string = process.env.SUPABASE_ANON_KEY!;
const SERVICE_KEY: string = process.env.SUPABASE_SERVICE_KEY!;
const TEST_EMAIL_DOMAIN: string = '@example.com';
const TEST_PASSWORD: string = 'asdfasdf';
const TEST_USER_EMAILS: string[] = [
    `user1${TEST_EMAIL_DOMAIN}`,
    `user2${TEST_EMAIL_DOMAIN}`,
];

let pool: Pool;
let client: PoolClient;

const anonClient: SupabaseClient = createClient(
    SUPABASE_URL,
    ANON_KEY,
    {
        auth: { persistSession: false },
    }
);
const serviceClient: SupabaseClient = createClient(
    SUPABASE_URL,
    SERVICE_KEY,
    {
        auth: { persistSession: false },
    }
);

let authUser1Id: string;
let authUser2Id: string;
let courseId: string;

const login = async (username: 'user1' | 'user2'): Promise<[SupabaseClient, string]> => {
    const {
        data: { session },
        error,
    } = await anonClient.auth.signInWithPassword({
        email: `${username}${TEST_EMAIL_DOMAIN}`,
        password: TEST_PASSWORD,
    });

    if (!session || error) {
        throw new Error(`Failed to log in user ${username}: ${error?.message}`);
    }

    const supabaseClient: SupabaseClient = createClient(
        SUPABASE_URL,
        ANON_KEY,
        {
            auth: { persistSession: false },
            global: {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            },
        },
    );

    return [supabaseClient, session.user.id];
}

beforeAll(async (): Promise<void> => {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    client = await pool.connect();
});

beforeEach(async (): Promise<void> => {
    const { rows: existingUsers } = await client.query<{ id: string }>(
        'SELECT id FROM auth.users WHERE email IN ($1, $2)',
        TEST_USER_EMAILS
    );
    const existingUserIds = existingUsers.map((u) => u.id);

    //* Clear out the database except for the seed data
    await client.query('DELETE FROM public.courses_likes');
    await client.query('DELETE FROM public.courses');
    await client.query('DELETE FROM public.users WHERE auth_user_id = ANY($1)', [existingUserIds]);
    await client.query('DELETE FROM auth.users WHERE id = ANY($1)', [existingUserIds]);

    //* Create test users
    const { data: user1Data } = await serviceClient.auth.admin.createUser({
        email: TEST_USER_EMAILS[0],
        password: TEST_PASSWORD,
        email_confirm: true,
    });
    const { data: user2Data } = await serviceClient.auth.admin.createUser({
        email: TEST_USER_EMAILS[1],
        password: TEST_PASSWORD,
        email_confirm: true,
    });

    if (!user1Data.user || !user2Data.user) {
        throw new Error('Failed to create test users');
    }

    authUser1Id = user1Data.user.id;
    authUser2Id = user2Data.user.id;

    const { rows: courses } = await client.query<{ id: string }>(
        'INSERT INTO public.courses (title) VALUES ($1) RETURNING id',
        ['Title Course 1'],
    );
    courseId = courses[0].id;

});

describe('RLS for courses_likes', () => {
    it('Allow users to view only their own liked courses', async (): Promise<void> => {
        //* Get the test "public" users
        const { rows: publicUsers } = await client.query<{
            id: string;
            auth_user_id: string;
        }>(
            'SELECT id, auth_user_id FROM public.users WHERE auth_user_id IN ($1, $2)',
            [authUser1Id, authUser2Id],
        );

        const publicUser1Id: string = publicUsers.find((user: {
            id: string;
            auth_user_id: string;
        }) => user.auth_user_id === authUser1Id)?.id;
        const publicUser2Id: string = publicUsers.find((user: {
            id: string;
            auth_user_id: string;
        }) => user.auth_user_id === authUser2Id)?.id;

        if (!publicUser1Id || !publicUser2Id) {
            throw new Error('Failed to find test "public" users');
        }

        //* Create courses_likes entries for both users
        await client.query(
            'INSERT INTO public.courses_likes (user_id, course_id) VALUES ($1, $2), ($3, $2)',
            [
                publicUser1Id,
                courseId,
                publicUser2Id,
            ]
        );

        //* Simulate authenticated user
        const [user1Client, user1SessionId] = await login('user1');

        expect(user1SessionId).toBe(authUser1Id);

        const { data: likes, error } = await user1Client
            .from('courses_likes')
            .select('*');

        expect(error).toBeNull();

        likes.forEach((like: {
            user_id: string;
            course_id: string;
        }) => {
            expect(like.user_id).toBe(publicUser1Id);
        });

        const hasUser2Like = likes.some((like: {
            user_id: string;
            course_id: string;
        }) => like.user_id === publicUser2Id);
        expect(hasUser2Like).toBe(false);
    });
});

afterEach(async (): Promise<void> => {
    await client.query('DELETE FROM public.courses_likes');
    await client.query('DELETE FROM public.courses WHERE id = $1', [courseId]);
    await client.query('DELETE FROM public.users WHERE auth_user_id IN ($1, $2)', [authUser1Id, authUser2Id]);
    await client.query('DELETE FROM auth.users WHERE id IN ($1, $2)', [authUser1Id, authUser2Id]);
});

afterAll(async (): Promise<void> => {
    await client.release();
    await pool.end();
});