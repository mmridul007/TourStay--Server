import express from 'express';
import { deleteCloudinaryImage } from '../controller/cloudinaryController.js';


const router = express.Router();

router.post('/delete', deleteCloudinaryImage);

export default router;