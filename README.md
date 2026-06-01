# ShopFin 🛍️

A full-featured e-commerce web app with Intercom Fin AI messenger and identity verification.

**Stack:** React 18 · Vite · Tailwind CSS · Supabase (auth + DB) · Intercom Fin

---

## Features

- **Product catalog** — 20+ products across 6 categories, search, filter, sort
- **Product detail pages** — ratings, related products, add to cart
- **Shopping cart** — persistent (localStorage), quantity management
- **User authentication** — sign up / sign in via Supabase (email + password)
- **3-step checkout** — shipping → payment → review → order confirmation
- **Order history** — all past orders with status badges
- **Intercom Fin AI** — embedded messenger with **identity verification** (prevents impersonation)

---

## Prerequisites

1. [Node.js 18+](https://nodejs.org)
2. A [Supabase](https://supabase.com) account (free tier works)
3. Your Intercom workspace App ID + Identity Verification secret

---

## Local Development

```bash
# 1. Copy env file and fill in your keys
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
# → http://localhost:5173
```

---

## Environment Variables

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → anon public key |
| `VITE_INTERCOM_APP_ID` | Intercom → Settings → Installation → Web → App ID |
| `VITE_INTERCOM_SECRET` | Intercom → Settings → Security → Identity Verification → Secret key (dev only — use edge function in prod) |

---

## Supabase Setup

Supabase Auth works out of the box — you only need to enable Email/Password auth:

1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Email** provider
3. (Optional) In **URL Configuration**, add your deployed URL to "Site URL"

No custom tables are needed for the basic flow — orders are stored in localStorage. To persist orders to Supabase, see the `orders` table schema below.

### Optional: orders table

```sql
create table public.orders (
  id text primary key,
  user_id uuid references auth.users(id),
  items jsonb not null,
  subtotal numeric,
  tax numeric,
  shipping numeric,
  total numeric,
  ship_address jsonb,
  status text default 'Processing',
  created_at timestamptz default now()
);

alter table public.orders enable row level security;
create policy "Users see own orders" on public.orders
  for all using (auth.uid() = user_id);
```

---

## Intercom Identity Verification

Identity verification prevents customers from impersonating other users by signing their identity with a secret key.

### How it works in this app

1. When a user logs in, the app calls the Supabase edge function `/intercom-hmac`
2. The edge function generates `HMAC-SHA256(email, INTERCOM_SECRET)` server-side
3. The hash is passed to `window.Intercom('boot', { user_hash: hash })` 
4. Intercom validates the hash and marks the session as verified ✓

### Deploy the edge function

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Link to your project
supabase link --project-ref <your-project-ref>

# Set the secret (never commit this!)
supabase secrets set INTERCOM_SECRET=<your_identity_verification_secret>

# Deploy the function
supabase functions deploy intercom-hmac --no-verify-jwt
```

### Enable Identity Verification in Intercom

1. Go to **Settings → Security → Identity Verification**
2. Enable it and copy the secret key (already set above)
3. Set enforcement level to **Required** once in production

---

## Deploying to Vercel (Recommended — Free)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Build and deploy
vercel

# 3. Set environment variables in Vercel dashboard
#    Project → Settings → Environment Variables
#    Add: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_INTERCOM_APP_ID
#    (Do NOT add VITE_INTERCOM_SECRET to Vercel — use the edge function instead)
```

Or connect your GitHub repo at [vercel.com/new](https://vercel.com/new) for automatic deploys on every push.

---

## Deploying to Lovable

1. Push this project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial ShopFin app"
   git remote add origin https://github.com/YOUR_USERNAME/shopfin.git
   git push -u origin main
   ```
2. Go to [lovable.dev](https://lovable.dev) and create a new project
3. Select **Import from GitHub** and choose your repo
4. In Project Settings, add your environment variables (same as above)
5. Lovable will build and host the app automatically

---

## Project Structure

```
src/
  App.jsx               # Root app, Intercom injection, routing
  main.jsx              # React entry point
  index.css             # Tailwind + global styles
  context/
    AuthContext.jsx     # Supabase auth + Intercom boot/shutdown
    CartContext.jsx     # Cart state (localStorage-persisted)
  components/
    Navbar.jsx          # Search, cart badge, user menu
    ProductCard.jsx     # Reusable product tile
  pages/
    Home.jsx            # Hero, featured products, categories
    Products.jsx        # Catalog with category filter + sort
    ProductDetail.jsx   # Single product, add to cart, Ask Fin
    Cart.jsx            # Cart management
    Checkout.jsx        # 3-step checkout (ship → pay → review)
    OrderConfirmation.jsx
    Orders.jsx          # Order history
    Auth.jsx            # Sign in / Sign up
  data/
    products.js         # 20+ mock products
  lib/
    supabase.js         # Supabase client
    intercom.js         # Intercom boot/shutdown/HMAC helpers
supabase/
  functions/
    intercom-hmac/      # Edge function for server-side HMAC
      index.ts
```

---

## Customising Products

Edit `src/data/products.js` to add/change products. Each product has:

```js
{
  id: 'unique-id',
  name: 'Product Name',
  category: 'electronics', // electronics | clothing | home | books | sports | beauty
  price: 99.99,
  originalPrice: 129.99, // null if no discount
  rating: 4.7,
  reviewCount: 1234,
  image: 'https://...', // any image URL
  description: 'Product description...',
  inStock: true,
  badge: 'Best Seller', // 'Best Seller' | 'New' | 'Sale' | 'Top Rated' | null
}
```

---

## Adding Stripe Payments

To replace the mock checkout with real Stripe payments:

1. `npm install @stripe/stripe-js @stripe/react-stripe-js`
2. Create a Supabase edge function `create-payment-intent` that calls Stripe's API
3. Replace the payment form in `src/pages/Checkout.jsx` step 1 with Stripe Elements

See [Stripe + Supabase guide](https://supabase.com/docs/guides/functions/examples/stripe-webhooks) for details.
