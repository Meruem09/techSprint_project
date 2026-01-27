import { Router } from 'express';
import { createProject, getProjects, getProjectDetails, addEvent } from '../controllers/project.controller';

const router = Router();

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectDetails);
router.post('/:id/events', addEvent);

export default router;
