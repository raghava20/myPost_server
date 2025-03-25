import express from "express";
import {
  createPost,
  getPosts,
  updatePost,
  deletePost,
  getPostById,
} from "../controllers/post.controller";
import { verifyToken } from "../middleware/auth";
import multer from "multer";

const router = express.Router();

// Multer configuration to handle file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/create", verifyToken, upload.single("image"), createPost);
router.get("/", verifyToken, getPosts);
router.get("/:id", getPostById);
router.put("/edit/:id", verifyToken, upload.single("image"), updatePost);
router.delete("/delete/:id", verifyToken, deletePost);

export default router;
