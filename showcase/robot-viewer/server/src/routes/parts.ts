import { Router, Request, Response } from 'express';
import { getAllParts, searchParts, getPartDetails, getRelatedParts } from '../services/partMapper.js';
import { applyGeneratedDescriptions } from '../services/partDescriptions.js';

const router = Router();

// GET /api/parts - Return all parts
router.get('/', async (req: Request, res: Response) => {
  try {
    const forceAI = req.query.ai === 'true' || req.query.ai === '1';
    const parts = getAllParts();
    await applyGeneratedDescriptions(parts, { force: forceAI });
    res.json({ parts });
  } catch (error) {
    console.error('[Parts] Failed to load parts:', error);
    res.status(500).json({ error: 'Failed to load parts' });
  }
});

// GET /api/parts/search?q=query - Search parts
router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string;
    const forceAI = req.query.ai === 'true' || req.query.ai === '1';
    const parts = !q ? getAllParts() : searchParts(q);
    await applyGeneratedDescriptions(parts, { force: forceAI });
    res.json({ parts });
  } catch (error) {
    console.error('[Parts] Failed to search parts:', error);
    res.status(500).json({ error: 'Failed to search parts' });
  }
});

// GET /api/parts/:id - Get part details with related parts
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const forceAI = req.query.ai === 'true' || req.query.ai === '1';
    const part = getPartDetails(id);
    if (!part) {
      res.status(404).json({ error: 'Part not found' });
      return;
    }
    const relatedParts = getRelatedParts(id);
    await applyGeneratedDescriptions([part, ...relatedParts], { force: forceAI });
    res.json({ part, relatedParts });
  } catch (error) {
    console.error('[Parts] Failed to load part details:', error);
    res.status(500).json({ error: 'Failed to load part details' });
  }
});

export default router;
