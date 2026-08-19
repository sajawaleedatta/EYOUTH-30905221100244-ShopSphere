import { Response } from "express";
import Review from "../models/Review";
import { AuthRequest } from "../types/auth";

const MAIN_APP_URL = process.env.MAIN_APP_URL || "http://localhost:5000";

const updateProductRating = async (productId: string): Promise<void> => {
  try {
    const stats = await Review.aggregate([
      { $match: { productId } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    const avg = stats[0] ? Math.round(stats[0].avgRating * 10) / 10 : 0;
    const count = stats[0]?.count ?? 0;

    await fetch(`${MAIN_APP_URL}/api/internal/products/${productId}/rating`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: avg, reviewCount: count }),
    });
  } catch (error) {
    console.error("Failed to update product rating:", error);
  }
};

export const getProductReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params as { productId: string };
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: reviews });
  } catch {
    res.status(500).json({ success: false, error: "Failed to fetch reviews." });
  }
};

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, rating, comment } = req.body as {
      productId?: string;
      rating?: number;
      comment?: string;
    };

    if (!productId || !rating || !comment) {
      res.status(400).json({ success: false, error: "Product ID, rating, and comment are required." });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ success: false, error: "Rating must be between 1 and 5." });
      return;
    }

    const existing = await Review.findOne({ productId, userId: req.user!.userId });
    if (existing) {
      res.status(409).json({ success: false, error: "You have already reviewed this product." });
      return;
    }

    const review = await Review.create({
      productId,
      userId: req.user!.userId,
      userName: req.user!.email,
      rating,
      comment,
    });

    await updateProductRating(productId);

    res.status(201).json({ success: true, data: review });
  } catch {
    res.status(500).json({ success: false, error: "Failed to create review." });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const review = await Review.findById(id);
    if (!review) {
      res.status(404).json({ success: false, error: "Review not found." });
      return;
    }

    if (review.userId !== req.user!.userId && req.user!.role !== "ADMIN") {
      res.status(403).json({ success: false, error: "Not authorized to delete this review." });
      return;
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(id);

    await updateProductRating(productId);

    res.json({ success: true, message: "Review deleted." });
  } catch {
    res.status(500).json({ success: false, error: "Failed to delete review." });
  }
};
