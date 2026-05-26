# real-ai-office
Real Estate AI Office
# Real Estate AI Office - Platinum Edition

Complete AI-powered real estate automation suite with 9 workers and 60+ prompts.

## Quick Deploy to Vercel (3 minutes)

### Step 1: Create GitHub Account (if you don't have one)
- Go to https://github.com/signup
- Sign up with your email

### Step 2: Upload Code to GitHub
1. **In terminal/command prompt**, navigate to your desktop:
   ```
   cd Desktop
   ```

2. **Clone this repository** (replace `YOUR_USERNAME` with your GitHub username):
   ```
   git clone https://github.com/YOUR_USERNAME/real-ai-estate-office.git
   cd real-ai-estate-office
   ```

3. **Copy all files from this folder into the cloned folder** (drag and drop them)

4. **Push to GitHub**:
   ```
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

### Step 3: Deploy to Vercel (Automatic)
1. Go to https://vercel.com/signup
2. Click "Continue with GitHub"
3. Authorize Vercel to access your repositories
4. Click "Add New" → "Project"
5. Select `real-ai-estate-office` repo
6. Click "Deploy"
7. **Done** — Vercel gives you a live URL in ~60 seconds

## What You Get

**9 AI Workers:**
- 🏠 Listing Agent AI
- 📲 Lead Follow-Up AI
- 📡 Ad Scheduler AI
- 💼 Business Card AI
- 📋 Transaction AI
- ⚖️ Compliance AI
- 📣 Marketing AI
- 🔑 Leasing AI
- 🤝 Concierge AI

**Tier System:**
- **Free**: 2-3 sample prompts per worker
- **Pro ($47)**: Full suite of 60+ prompts
- **Office ($97)**: Team edition

**Pricing Links** (update in `app/page.jsx`):
- Change Gumroad URLs to your own product links

## Local Development

```bash
npm install
npm run dev
```

Then visit http://localhost:3000

## Files Included

```
real-ai-estate-office/
├── package.json          # Dependencies
├── next.config.js        # Next.js config
├── .gitignore            # Git ignore rules
├── README.md             # This file
└── app/
    ├── page.jsx          # Main app
    └── layout.jsx        # Root layout
```

## Selling on Gumroad

1. Create a product on Gumroad
2. Set your live Vercel URL as the product link
3. Update `TIERS` object in `app/page.jsx` with your Gumroad URLs
4. Deploy changes

Example:
```javascript
pro:{
  label:"Pro Agent",
  price:"$47",
  gumroad:"https://gumroad.com/l/YOUR_PRODUCT_ID"
}
```

## Security Notes

- Access codes are SHA-256 hashed (not plaintext)
- PII warning displayed to all users
- All API calls go through Anthropic only
- No data stored on server

## Support

For issues, check:
- Vercel logs: https://vercel.com → Project → Deployments
- Terminal error messages during `git push`
- GitHub repo for file conflicts

---

**Ready to go live?** Push to GitHub and Vercel handles the rest. Your live URL deploys automatically on every commit.
