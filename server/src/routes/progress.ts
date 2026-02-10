import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/progress
router.get('/', async (req: Request, res: Response) => {
    try {
        // TODO: Implement get progress logic
        res.status(501).json({
            success: false,
            message: 'Get progress endpoint not yet implemented',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

export default router;
