# Setup Instructions

## Environment Variables

This project requires environment variables to be configured before running.

### 1. Create `.env.local` file

Create a file named `.env.local` in the root directory of the project:

```bash
# From project root
cp .env.local.template .env.local
```

Or manually create the file with the following content:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://admin:PpScktvdTnfPw5oU@case-pulse.qro8x.mongodb.net/casepulse?retryWrites=true&w=majority
```

### 2. Verify `.env.local` is in `.gitignore`

✅ Already configured! The `.gitignore` file includes `.env*` pattern, which means `.env.local` will NOT be committed to git.

### 3. Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ Yes |

### 4. MongoDB Connection String Format

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

**Current Configuration:**
- **Username**: `admin`
- **Password**: `PpScktvdTnfPw5oU`
- **Cluster**: `case-pulse.qro8x.mongodb.net`
- **Database**: `casepulse`

## Running the Project

After setting up `.env.local`:

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The application will be available at `http://localhost:3000` (or next available port).

## Troubleshooting

### Error: "Please define the MONGODB_URI environment variable in .env.local"

**Solution**: 
1. Ensure `.env.local` file exists in the project root
2. Verify the file contains `MONGODB_URI=...`
3. Restart the Next.js dev server

### MongoDB Connection Issues

**Possible causes:**
1. Invalid MongoDB URI
2. Network/firewall blocking connection
3. MongoDB Atlas IP whitelist (add your IP in Atlas dashboard)
4. Invalid credentials

**Check connection:**
- Test the URI in MongoDB Compass
- Review MongoDB Atlas logs
- Check console for detailed error messages

## Security Notes

⚠️ **NEVER commit `.env.local` to git!**

- Contains sensitive credentials
- Already protected by `.gitignore`
- Use different credentials for production
- Rotate credentials regularly

## Next.js Environment Variables

Next.js automatically loads environment variables from:

1. `.env.local` (highest priority, not committed)
2. `.env.development` (for development)
3. `.env.production` (for production)
4. `.env` (lowest priority)

**Why `.env.local`?**
- Overrides all other env files
- Perfect for local development
- Never committed to git
- Each developer can have different values

## Production Deployment

For production (Vercel, AWS, etc.):

1. **DO NOT** deploy `.env.local`
2. Set `MONGODB_URI` in the hosting platform's environment variables
3. Use a separate production MongoDB database
4. Consider using a secrets manager (AWS Secrets Manager, HashiCorp Vault)

### Vercel Deployment

1. Go to Project Settings → Environment Variables
2. Add `MONGODB_URI` with your production value
3. Choose environment: Production, Preview, or Development
4. Deploy

### Docker Deployment

```dockerfile
# In docker-compose.yml or Dockerfile
environment:
  - MONGODB_URI=${MONGODB_URI}
```

Then pass via command line:
```bash
docker run -e MONGODB_URI="mongodb+srv://..." your-image
```

## Additional Environment Variables (Future)

As you add more features, you may need:

```env
# MongoDB
MONGODB_URI=...

# Encryption (for credential storage)
ENCRYPTION_KEY=your-32-character-encryption-key

# Authentication (if implementing)
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# AWS (if implementing S3, etc.)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# Email (if implementing notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

## Verification Checklist

- [ ] `.env.local` file created in project root
- [ ] `MONGODB_URI` variable set with valid connection string
- [ ] `.gitignore` includes `.env*` pattern
- [ ] Development server starts without environment variable errors
- [ ] MongoDB connection successful (check console logs)
- [ ] Accounts API endpoints working

---

**Need Help?** Check the MongoDB Atlas dashboard or review the application logs for detailed error messages.

