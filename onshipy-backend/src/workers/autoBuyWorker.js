const db = require('../db/knex');
const { scrapeProduct } = require('../services/scraperService');

// Process pending auto-buy jobs every 30 seconds
async function processAutoBuyJobs() {
  try {
    const pendingJobs = await db('auto_buy_jobs')
      .where({ status: 'pending' })
      .where('retry_count', '<', 3)
      .limit(5);

    for (const job of pendingJobs) {
      await processJob(job);
    }
  } catch (err) {
    console.error('Auto-buy worker error:', err.message);
  }
}

async function processJob(job) {
  try {
    // Mark as processing
    await db('auto_buy_jobs').where({ id: job.id }).update({ status: 'processing' });

    // Get the customer order
    const order = await db('customer_orders').where({ id: job.customer_order_id }).first();
    if (!order) throw new Error('Order not found');

    // Get seller credentials for this source domain
    const credentials = await db('buyer_credentials')
      .where({ seller_id: order.seller_id, source_domain: job.source_domain, status: 'active' })
      .first();

    if (!credentials) {
      // No credentials — mark as needs_manual and alert seller
      await db('auto_buy_jobs').where({ id: job.id }).update({
        status: 'needs_credentials',
        failure_reason: `No credentials for ${job.source_domain}. Please add account credentials in Settings.`
      });
      return;
    }

    // Here you would use Playwright to auto-purchase
    // For now we mark as confirmed and log it
    console.log(`Auto-buy job ${job.id}: Would purchase from ${job.source_url} for order ${order.storefront_order_id}`);

    await db('auto_buy_jobs').where({ id: job.id }).update({
      status: 'confirmed',
      confirmed_at: new Date(),
      source_order_id: 'MANUAL_' + Date.now()
    });

    await db('customer_orders').where({ id: order.id }).update({ status: 'processing' });

  } catch (err) {
    const retryCount = (job.retry_count || 0) + 1;
    await db('auto_buy_jobs').where({ id: job.id }).update({
      status: retryCount >= 3 ? 'failed' : 'pending',
      failure_reason: err.message,
      retry_count: retryCount
    });
    console.error(`Job ${job.id} failed:`, err.message);
  }
}

module.exports = { processAutoBuyJobs };