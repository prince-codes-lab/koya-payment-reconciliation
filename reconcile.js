// Payment reconciliation.
//
// Reads payments.jsonl and works out how much money we actually collected.
// Run:  node reconcile.js

const fs = require("fs");

// Amounts can be numbers (3533.05) or strings with commas ("6,751.43").
function parseAmount(value) {
  return Number(String(value).replace(/,/g, ""));
}

// Keep only the latest attempt for each txn_id.
const latest = new Map();

const lines = fs.readFileSync("payments.jsonl", "utf8").split("\n");
for (const line of lines) {
  if (line.trim() === "") continue;

  let event;
  try {
    event = JSON.parse(line);
  } catch {
    continue; // ignore lines that can't be read
  }

  if (!event || !event.txn_id) continue; // ignore events without a txn_id

  // The file isn't in time order, so compare timestamps, not line position.
  // ts is always ISO 8601 UTC ("2026-09-21T15:30:26Z"), so string comparison works.
  const current = latest.get(event.txn_id);
  if (!current || event.ts > current.ts) {
    latest.set(event.txn_id, event);
  }
}

let total = 0;
let count = 0;
for (const event of latest.values()) {
  if (event.status === "success") {
    total += parseAmount(event.amount);
    count += 1;
  }
}

const expected = parseInt(fs.readFileSync("expected.txt", "utf8").trim(), 10);

if (count !== expected) {
  console.log(`Check failed: counted ${count} successful payments, expected ${expected}.`);
  console.log("Something in the data isn't being handled the way the README describes.");
} else {
  console.log(`Check passed: ${count} successful payments.`);
  console.log(`Your code: KOYA-${Math.round(total)}`);
}
