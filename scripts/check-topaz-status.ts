#!/usr/bin/env node

// Load environment variables first
import './load-env';

// Only import after environment is verified
import { checkTopazStatus } from "../src/utils/topaz-status-checker";

async function main() {
  try {
    const summary = await checkTopazStatus();
    
    // Additional development helpers
    if (process.env.DEBUG) {
      console.log("\n=== Debug Information ===");
      console.log(JSON.stringify(summary, null, 2));
    }

    // Exit with error if any items failed
    const failedItems = summary.filter(item => 
      item.status === "failed" || item.status === "error"
    );
    
    if (failedItems.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Fatal error running status check:", error);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled rejection:', error);
  process.exit(1);
});

main();
