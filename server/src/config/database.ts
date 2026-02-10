import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
    log: ['error', 'warn'],
});

export async function connectDatabase() {
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
}

export async function disconnectDatabase() {
    await prisma.$disconnect();
}
