import { Router, Response } from "express";
import prisma from "../config/database";
import { AuthRequest } from "../types/auth";

const router = Router();

router.patch("/products/:id/rating", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { rating, reviewCount } = req.body as { rating?: number; reviewCount?: number };

    if (rating === undefined || reviewCount === undefined) {
      res.status(400).json({ success: false, error: "rating and reviewCount are required." });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      res.status(404).json({ success: false, error: "Product not found." });
      return;
    }

    await prisma.product.update({
      where: { id },
      data: { rating, reviewCount },
    });

    res.json({ success: true, message: "Rating updated." });
  } catch {
    res.status(500).json({ success: false, error: "Failed to update rating." });
  }
});

export default router;
