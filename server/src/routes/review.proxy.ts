import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/auth";
import { AuthRequest } from "../types/auth";

const REVIEW_SERVICE_URL = process.env.REVIEW_SERVICE_URL || "http://localhost:5001";

const router = Router();

const proxyToReviewService = async (
  req: AuthRequest,
  res: Response,
  path: string,
  method: string = "GET"
): Promise<void> => {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (req.headers.authorization) {
      headers["Authorization"] = req.headers.authorization;
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (method !== "GET" && method !== "DELETE") {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(`${REVIEW_SERVICE_URL}${path}`, fetchOptions);
    const data = await response.json();

    res.status(response.status).json(data);
  } catch (error) {
    console.error(`Review service unavailable for ${method} ${path}:`, error);
    res.status(503).json({
      success: false,
      error: "Reviews service is temporarily unavailable.",
      data: method === "GET" ? [] : undefined,
    });
  }
};

router.get("/product/:productId", (req: AuthRequest, res: Response) => {
  proxyToReviewService(req, res, `/api/reviews/product/${req.params.productId}`);
});

router.post("/", authenticate, (req: AuthRequest, res: Response) => {
  proxyToReviewService(req, res, "/api/reviews", "POST");
});

router.delete("/:id", authenticate, (req: AuthRequest, res: Response) => {
  proxyToReviewService(req, res, `/api/reviews/${req.params.id}`, "DELETE");
});

export default router;
