import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { User } from '../models/index.js';

const router = Router();

async function buildTree(user, depth = 0, maxDepth = 5) {
  const node = {
    id: user._id,
    name: user.name,
    email: user.email,
    referralCode: user.referralCode,
    level: depth,
    children: []
  };

  if (depth >= maxDepth) return node;

  const children = await User.find({ referredBy: user._id })
    .select('name email referralCode referredBy')
    .sort({ createdAt: 1 })
    .lean();

  node.children = await Promise.all(children.map((child) => buildTree(child, depth + 1, maxDepth)));
  return node;
}

router.get('/tree', requireAuth, async (req, res, next) => {
  try {
    const tree = await buildTree(req.user);
    res.json({ tree });
  } catch (error) {
    next(error);
  }
});

export default router;
