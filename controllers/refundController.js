import { PrismaClient } from "@prisma/client";
import WooCommerce from "../config/woocommerce.js";
const prisma = new PrismaClient();

// Create a new refund request
export const createRefundRequest = async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    if (!orderId || !reason) {
      return res.status(400).json({ error: "Order ID and reason are required" });
    }

    // Validate order exists in WooCommerce
    try {
      await WooCommerce.get(`orders/${orderId}`);
    } catch (error) {
      return res.status(404).json({ error: "Invalid order ID - Order not found in WooCommerce" });
    }
    

    const refundRequest = await prisma.refundRequest.create({
      data: {
        orderId,
        reason,
      },
    });

    res.status(201).json(refundRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all refund requests
export const getAllRefundRequests = async (req, res) => {
  try {
    const refundRequests = await prisma.refundRequest.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(refundRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single refund request by ID
export const getRefundRequestById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const refundRequest = await prisma.refundRequest.findUnique({
      where: { orderId }
    });

    if (!refundRequest) {
      return res.status(404).json({ error: "Refund request not found" });
    }

    res.json(refundRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update refund request status
export const updateRefundRequest = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!Object.values(prisma.RefundStatus).includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updatedRefundRequest = await prisma.refundRequest.update({
      where: { orderId },
      data: { status }  
    });

    res.json(updatedRefundRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
