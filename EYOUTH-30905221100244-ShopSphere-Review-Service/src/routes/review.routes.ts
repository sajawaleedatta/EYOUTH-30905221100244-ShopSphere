import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getProductReviews, createReview, deleteReview } from "../controllers/review.controller";

const router = Router();

router.get("/product/:productId", getProductReviews);
router.post("/", authenticate, createReview);
router.delete("/:id", authenticate, deleteReview);

export default router;
