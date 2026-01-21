# Email Deliverability Setup: Loops.so + GoDaddy

## Part 1: Get Records from Loops.so
1. Go to: **app.loops.so** → Log in
2. Click: **Settings** → **Domains**
3. Copy the **3 DKIM CNAME records** (Name + Value)

---

## Part 2: Add Records in GoDaddy
1. Go to: **godaddy.com** → Log in
2. Click: **My Products** → **fateflix.app** → **DNS**
3. For EACH of the 3 DKIM records:
   - Click **Add**
   - Type: `CNAME`
   - Name: *(paste from Loops.so, e.g. `s1._domainkey`)*
   - Value: *(paste from Loops.so)*
   - TTL: `Default`
   - Click **Save**

---

## Part 3: Verify in Loops.so
1. Go back to: **app.loops.so** → **Settings** → **Domains**
2. Click: **Verify Records**
3. Wait 15-60 minutes if not immediate

---

## Status Checklist
- [ ] SPF Record *(already done)*
- [ ] DKIM Record 1
- [ ] DKIM Record 2
- [ ] DKIM Record 3
- [ ] Verified in Loops.so
