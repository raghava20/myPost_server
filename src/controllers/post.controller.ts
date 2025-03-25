import { Request, Response } from "express";
import Post from "../models/Post";
import { AuthRequest } from "../middleware/auth";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createPost = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { title, text } = req.body;
  let post;
  try {
    if (req.file) {
      // Upload image to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "posts" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      let imageUrl = (uploadResult as any).secure_url; // Cloudinary image URL

      // Save post in MongoDB
      post = await Post.create({
        title,
        text,
        image: imageUrl,
        user: userId,
      });
      res.status(201).json(post);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

export const getPosts = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  try {
    const posts = await Post.find({ user: userId }).populate("user", "email");
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};
export const getPostById = async (req: Request, res: Response) => {
  console.log("first post by id");
  try {
    const posts = await Post.findById(req.params.id);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, text, image } = req.body;

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "posts" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      let imageUrl = (uploadResult as any).secure_url;

      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        { title, text, image: imageUrl },
        { new: true }
      );
      res.json(updatedPost);
    } else {
      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        { title, text, image },
        { new: true }
      );
      res.json(updatedPost);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update post" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete post" });
  }
};
