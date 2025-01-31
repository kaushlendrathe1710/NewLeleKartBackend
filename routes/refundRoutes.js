import express from "express";
import {
  createRefundRequest,
  getAllRefundRequests,
  getRefundRequestById,
  updateRefundRequest,
} from "../controllers/refundController.js";

const router = express.Router();

// Create a new refund request
router.post("/", createRefundRequest);

// Get all refund requests
router.get("/", getAllRefundRequests);

// Get a specific refund request
router.get("/:id", getRefundRequestById);

// Update refund request status
router.patch("/:id", updateRefundRequest);

export default router;
