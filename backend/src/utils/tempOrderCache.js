const crypto = require('crypto');

// In-memory storage map
// Key: tempOrderId (string/uuid)
// Value: { data: object, expiresAt: number }
const tempOrders = new Map();

/**
 * Stores a temporary order in memory.
 * @param {string} tempOrderId - The unique ID of the temporary order.
 * @param {object} data - The order data (items, user, etc.).
 * @param {number} ttlMs - Time-to-live in milliseconds (default 30 minutes).
 */
const set = (tempOrderId, data, ttlMs = 30 * 60 * 1000) => {
  const expiresAt = Date.now() + ttlMs;
  tempOrders.set(tempOrderId, {
    data,
    expiresAt
  });
  console.log(`[TempOrderCache] Saved order ${tempOrderId}. Expires at ${new Date(expiresAt).toISOString()}`);
};

/**
 * Retrieves a temporary order from memory.
 * Checks expiry and deletes the record if expired.
 * @param {string} tempOrderId - The ID of the order to retrieve.
 * @returns {object|null} - The order data if found and valid, otherwise null.
 */
const get = (tempOrderId) => {
  const record = tempOrders.get(tempOrderId);
  if (!record) {
    return null;
  }

  // Check if expired
  if (record.expiresAt < Date.now()) {
    console.log(`[TempOrderCache] Order ${tempOrderId} has expired. Deleting...`);
    tempOrders.delete(tempOrderId);
    return null;
  }

  return record.data;
};

/**
 * Deletes a temporary order from memory.
 * @param {string} tempOrderId - The ID to delete.
 */
const remove = (tempOrderId) => {
  const existed = tempOrders.delete(tempOrderId);
  if (existed) {
    console.log(`[TempOrderCache] Deleted order ${tempOrderId}`);
  }
};

/**
 * Cleans up all expired temporary orders.
 * Designed to run periodically in the background.
 */
const cleanup = () => {
  const now = Date.now();
  let deletedCount = 0;
  for (const [key, value] of tempOrders.entries()) {
    if (value.expiresAt < now) {
      tempOrders.delete(key);
      deletedCount++;
    }
  }
  if (deletedCount > 0) {
    console.log(`[TempOrderCache] Cleaned up ${deletedCount} expired temporary orders.`);
  }
};

module.exports = {
  set,
  get,
  remove,
  cleanup
};
