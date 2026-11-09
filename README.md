# Payment reconciliation: fixed

A broken payment reconciliation script, debugged and fixed in JavaScript (`reconcile.js`) as part of the Koya AI Automation Developer application.

## What was wrong and how I fixed it

| Problem in the data | Effect on the original script | Fix |
|---|---|---|
| Truncated/corrupt JSON lines | `JSON.parse` crashed the whole run | Wrapped parsing in `try/catch` and skip unreadable lines |
| Events with no `txn_id` | Counted as real payments | Ignore events without a `txn_id` |
| Retried payments (same `txn_id`, multiple attempts), out of time order | Every successful attempt was counted | Keep only the **latest attempt per `txn_id`**, compared by timestamp, not file position |
| Some amounts are strings with thousands separators (`"6,751.43"`) | `Number()` returned `NaN` and corrupted the total | Strip commas before converting |

**Result:** the script now matches the finance team's hand count (22,733 successful payments out of ~39,700 raw events / 30,000 unique transactions).

Run it with `node reconcile.js` (Node 18+).

---

## Original task
### Payment reconciliation

`payments.jsonl` is an export of payment events from a payments provider, one JSON object per line. The reconciliation script is meant to work out how much money was actually collected, but it doesn't work.

Fix it, in Python (`reconcile.py`) or JavaScript (`reconcile.js`), whichever you prefer. When it's right, it prints a code. Paste that code into the application form.

## How the data works

- Each line is one event: `txn_id`, `status` (`success`, `failed` or `pending`), `amount` in naira, `currency`, and `ts` (when it happened, UTC).
- A payment can be attempted more than once. Every attempt has the same `txn_id`. Only the latest attempt for each `txn_id` counts.
- A payment counts as collected only if its latest attempt is `success`.
- The export comes from a production system and isn't perfectly clean. Ignore lines that can't be read, and events without a `txn_id`. Every other event is valid and must be counted correctly.
- `expected.txt` holds the number of successful payments the finance team counted by hand. The script checks itself against it.

## What to submit

1. Fork this repo, fix the script, and commit your fix to your fork.
2. Run it. Paste the code it prints into the form.
3. Paste the link to your fork into the form.


