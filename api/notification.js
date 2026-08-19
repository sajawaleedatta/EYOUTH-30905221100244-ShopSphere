export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed." });
  }

  const { type, payload } = req.body;

  if (!type || !payload) {
    return res.status(400).json({ success: false, error: "type and payload are required." });
  }

  try {
    let result;

    switch (type) {
      case "order_confirmation":
        result = await handleOrderConfirmation(payload);
        break;
      case "review_notification":
        result = await handleReviewNotification(payload);
        break;
      case "low_stock_alert":
        result = await handleLowStockAlert(payload);
        break;
      default:
        return res.status(400).json({ success: false, error: `Unknown notification type: ${type}` });
    }

    return res.status(200).json({ success: true, message: "Notification processed.", data: result });
  } catch (error) {
    console.error("Notification processing failed:", error);
    return res.status(500).json({ success: false, error: "Notification processing failed." });
  }
}

async function handleOrderConfirmation(payload) {
  const { orderId, userEmail, items, total } = payload;

  console.log(`[Notification] Order confirmation for ${userEmail}: Order #${orderId}, Total: $${total}`);

  return {
    type: "order_confirmation",
    orderId,
    email: userEmail,
    status: "queued",
    timestamp: new Date().toISOString(),
  };
}

async function handleReviewNotification(payload) {
  const { productId, userName, rating, productName } = payload;

  console.log(`[Notification] New review by ${userName} on ${productName}: ${rating}/5 stars`);

  return {
    type: "review_notification",
    productId,
    status: "queued",
    timestamp: new Date().toISOString(),
  };
}

async function handleLowStockAlert(payload) {
  const { productName, currentStock, threshold } = payload;

  console.log(`[Notification] Low stock alert: ${productName} has ${currentStock} units (threshold: ${threshold})`);

  return {
    type: "low_stock_alert",
    productName,
    status: "queued",
    timestamp: new Date().toISOString(),
  };
}
