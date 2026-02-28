---
name: gen-data
description: Generate synthetic financial transaction data with plantable behavioral patterns for demo purposes
user-invocable: true
allowed-tools: ["Read", "Write", "Bash", "Glob"]
argument-hint: "[pattern-focus] e.g. 'weekend-spender', 'subscription-heavy', 'improving-saver', or 'full' for complete dataset"
---

# Synthetic Financial Data Generator

Generate realistic synthetic banking transaction data for Maya (23, recent grad, $3,200/mo income) with deliberate behavioral patterns that our AI can "discover."

## User Profile: Maya

- **Age**: 23, recent college grad
- **Income**: $3,200/mo ($1,600 biweekly, deposited every other Friday)
- **Rent**: $1,350/mo (42% of income — above the recommended 30%)
- **Goals**:
  - Emergency Fund: target $5,000, current $1,200
  - Trip to Japan: target $3,000, current $450
- **Personality**: Generally responsible but has blind spots she doesn't realize

## Plantable Behavioral Patterns

Each pattern should be clearly present in the data so Claude's analysis can detect and surface it:

### Pattern 1: Sunday Night Orderer
- Uber Eats / DoorDash orders clustering Sunday 8-10pm
- Average $18-25 per order
- 3-4 times per month
- Monthly cost: ~$75-90

### Pattern 2: Payday Splurger
- Spending spikes 2-3x in the 3 days following biweekly paycheck
- Mix of dining out, shopping, entertainment
- The "flush with cash" effect

### Pattern 3: Subscription Creep
- Netflix: $15.99/mo (used regularly)
- Spotify: $10.99/mo (used regularly)
- Hulu: $17.99/mo (last watched 45+ days ago)
- HBO Max: $15.99/mo (last watched 30+ days ago)
- iCloud: $2.99/mo
- Adobe Creative Cloud: $54.99/mo (used once in last 60 days)
- Total: ~$119/mo, ~$43/mo on barely-used services

### Pattern 4: Daily Coffee Ritual
- Starbucks 4-5x per week
- $5.50-7.00 per visit
- Monthly: ~$110-140
- Annual: ~$1,400

### Pattern 5: Weekend vs Weekday Spending Gap
- Fri-Sun: 60-65% of discretionary spending
- Mon-Thu: 35-40%
- Weekend spending is dining, bars, entertainment, rideshares

### Pattern 6: Improving Savings Trend (Positive)
- Month 1: saved $100
- Month 2: saved $130
- Month 3: saved $165
- Month 4: saved $180
- Month 5: saved $210
- Month 6: saved $240
- Clear upward trajectory to celebrate

### Pattern 7: Impulse Amazon Purchases
- Small purchases ($12-35) clustering on Sunday evenings and late weeknights
- 4-6 per month
- Things like phone accessories, kitchen gadgets, random items

## Data Generation Rules

- Generate 6 months of data (approx September 2025 - February 2026)
- Each transaction needs: date, time, description (realistic merchant format), amount, category
- Use realistic merchant name formats: "STARBUCKS #4521 CHICAGO IL", "UBER EATS* PENDING"
- Include recurring bills on consistent dates (rent on 1st, utilities around 15th)
- Add natural variance — not every week is identical
- Include occasional anomalies (a birthday dinner, a car repair, a concert ticket)
- Total monthly spending should realistically match $3,200 income (slight overspend some months, slight savings others)

## Output

Generate the data as a JSON file at `data/transactions.json` with this structure:

```json
{
  "user": {
    "name": "Maya Chen",
    "age": 23,
    "monthlyIncome": 3200,
    "goals": [...],
    "accounts": [...]
  },
  "transactions": [
    {
      "id": "txn_001",
      "date": "2025-09-02",
      "time": "07:42",
      "description": "STARBUCKS #4521 CHICAGO IL",
      "amount": -5.50,
      "category": "coffee",
      "merchant": "Starbucks",
      "isRecurring": false
    }
  ]
}
```

If $ARGUMENTS specifies a pattern focus, generate a smaller dataset (1 month) emphasizing that pattern. If "full", generate the complete 6-month dataset.
