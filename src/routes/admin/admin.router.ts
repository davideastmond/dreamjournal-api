import * as express from "express";

const router = express.Router();

/**
 * This gets a de-hashed user object. Requires admin password in the auth header
 */
router.get("/user");

export default router;
