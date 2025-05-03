import express from 'express';
import { login, meFunction, register } from '../controller/auth.js';

const router = express.Router();    // Create a new router 

// Create user
router.post('/register', register)
router.post('/login', login)
router.get('/me', meFunction)

export default router;    // Export the router  
