import { Router } from 'express';
import { getRoadmap } from '../controllers/roadmap.controller';

const router = Router();

router.get('/', getRoadmap);

export default router;
