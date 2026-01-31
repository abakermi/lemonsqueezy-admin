#!/usr/bin/env node
import { Command } from 'commander';
import axios from 'axios';
import 'dotenv/config';

const program = new Command();
const API_URL = 'https://api.lemonsqueezy.com/v1';

function getClient() {
  const token = process.env.LEMONSQUEEZY_API_KEY;
  if (!token) {
    console.error("❌ Error: LEMONSQUEEZY_API_KEY is missing.");
    process.exit(1);
  }
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json'
    }
  });
}

program
  .name('ls-admin')
  .description('Manage Lemon Squeezy store')
  .version('1.0.0');

program.command('stores')
  .description('List stores')
  .action(async () => {
    try {
      const res = await getClient().get('/stores');
      console.log("🏪 Stores:");
      res.data.data.forEach((s: any) => {
        console.log(`- ${s.attributes.name} (ID: ${s.id})`);
      });
    } catch (error: any) {
      console.error("Error:", error.response?.data || error.message);
    }
  });

program.command('orders')
  .option('-l, --limit <number>', 'Limit results', '10')
  .description('List recent orders')
  .action(async (options) => {
    try {
      const res = await getClient().get(`/orders?page[size]=${options.limit}`);
      console.log("📦 Recent Orders:");
      res.data.data.forEach((o: any) => {
        const attr = o.attributes;
        console.log(`#${attr.identifier} - ${attr.formatted_total} - ${attr.user_email} (${attr.status})`);
      });
    } catch (error: any) {
      console.error("Error:", error.response?.data || error.message);
    }
  });

program.command('subscriptions')
  .description('List active subscriptions')
  .action(async () => {
    try {
      const res = await getClient().get('/subscriptions?filter[status]=active');
      console.log("🔄 Active Subscriptions:");
      res.data.data.forEach((s: any) => {
        const attr = s.attributes;
        console.log(`- ${attr.user_email}: ${attr.product_name} (${attr.status}) - Renews: ${attr.renews_at}`);
      });
    } catch (error: any) {
      console.error("Error:", error.response?.data || error.message);
    }
  });

program.parse();
