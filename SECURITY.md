# 🔐 Security Best Practices - Supabase Service Role

## What is Service Role Key?

The `SUPABASE_SERVICE_ROLE_KEY` is a **super admin key** that:
- Bypasses all Row Level Security (RLS) policies
- Has full access to all database operations
- Should NEVER be exposed to the client

---

## ✅ Safe Usage (What We Do)

### 1. Server-Side Only
```typescript
// ✅ GOOD - API Route (runs on server)
import { getServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const serviceClient = getServiceClient();
  // Use serviceClient here
}
```

### 2. Always Authenticate First
```typescript
// ✅ GOOD - Verify user before using service client
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Now safe to use serviceClient with user.id
const { data } = await serviceClient
  .from('payments')
  .insert({ user_id: user.id, ... });  // user.id comes from auth, not client input!
```

### 3. Environment Variables
```bash
# ✅ GOOD - Stored in .env.local and Vercel
SUPABASE_SERVICE_ROLE_KEY=your-secret-key
```

### 4. Validate All Input
```typescript
// ✅ GOOD - Validate before using
if (!amount || amount <= 0) {
  return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
}
```

---

## ❌ Unsafe Usage (What NOT to Do)

### 1. Client-Side Exposure
```typescript
// ❌ BAD - Never in client components!
'use client';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  url, 
  process.env.SUPABASE_SERVICE_ROLE_KEY  // ❌ EXPOSED TO CLIENT!
);
```

### 2. Trusting Client Input for User ID
```typescript
// ❌ BAD - Client could fake user_id
const { user_id } = await req.json();  // ❌ Dangerous!
await serviceClient.from('payments').insert({ user_id });

// ✅ GOOD - Get user_id from auth
const { data: { user } } = await supabase.auth.getUser();
await serviceClient.from('payments').insert({ user_id: user.id });
```

### 3. Committing to Git
```bash
# ❌ BAD - In code file
export const SERVICE_KEY = "eyJhbGc...";  # ❌ Don't do this!

# ✅ GOOD - In .env.local (git ignored)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 4. Logging Secrets
```typescript
// ❌ BAD
console.log('Service key:', process.env.SUPABASE_SERVICE_ROLE_KEY);

// ✅ GOOD
console.log('Service client configured:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
```

---

## 🛡️ Our Implementation Review

### `/api/payments/payplus/create/route.ts`

```typescript
export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const serviceClient = getServiceClient();  // ✅ Server-side only
  
  // ✅ STEP 1: Authenticate
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ✅ STEP 2: Validate input
  const { amount } = await req.json();
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  // ✅ STEP 3: Use serviceClient with authenticated user.id
  const { data: payment } = await serviceClient
    .from('payments')
    .insert({
      user_id: user.id,  // ✅ From auth, not client!
      amount: amount     // ✅ Validated above
    });
}
```

**Security Score: ✅ SAFE**
- Runs on server ✅
- Authenticates user ✅
- Validates input ✅
- Uses user.id from auth (not client input) ✅
- Service key in environment variables ✅

---

## 📋 Security Checklist

Before deploying any API route that uses Service Role:

- [ ] Does it run on the server? (not 'use client')
- [ ] Does it authenticate the user first?
- [ ] Does it validate all inputs?
- [ ] Does it use `user.id` from auth (not request body)?
- [ ] Is the Service Role Key in .env (not in code)?
- [ ] Is .env.local in .gitignore?
- [ ] Are the environment variables set in Vercel?
- [ ] Are there no console.logs of the key?

---

## 🚨 What If Service Key is Exposed?

If you accidentally expose the Service Role Key:

1. **Rotate the key immediately** in Supabase Dashboard:
   - Settings → API → Service Role → Generate New Key
   
2. **Update all deployments**:
   - Update `.env.local`
   - Update Vercel environment variables
   - Redeploy

3. **Review access logs** in Supabase Dashboard

---

## 💡 When to Use Service Role vs Regular Client

### Use Regular Client (anon key)
- Reading public data
- User operations on their own data (with RLS)
- Client-side operations

### Use Service Role
- Admin operations
- Bypassing RLS for legitimate reasons
- Creating records that RLS would block
- Bulk operations
- **Only in API routes (server-side)**

---

## 🔗 Additional Resources

- [Supabase: Service Role vs Anon Key](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js: Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [OWASP: API Security](https://owasp.org/www-project-api-security/)
