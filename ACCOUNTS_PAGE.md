# Accounts Page - Seller Central Management

The Seller Central accounts management has been moved to a dedicated page for better organization and user experience.

## Changes Made

### ✅ New Page Created: `/accounts`

**File**: `src/app/accounts/page.tsx`

A dedicated page for managing Amazon Seller Central accounts with:

#### Features
- **Account Listing** - Beautiful table showing all registered accounts
- **Add Account** - Modal dialog to add new accounts
- **Refresh** - Manually refresh the account list
- **Statistics Cards**:
  - Total Accounts count
  - Active accounts (with pulse indicator)
  - Last updated timestamp
- **Loading States** - Spinner while fetching accounts
- **Empty State** - Helpful message when no accounts exist

#### Security
- ✅ Passwords hidden (shown as `••••••••`)
- ✅ 2FA keys hidden
- ✅ Data encrypted in MongoDB
- ✅ Secure API endpoints

### ✅ Cases Page Cleaned Up

**File**: `src/app/cases/page.tsx`

Removed the account management section from the top of the cases page. The page now focuses solely on case management, making it cleaner and more focused.

**Before**:
```
Cases Page
├── Seller Central Accounts Section
│   ├── Add Account button
│   └── Accounts Table
└── Cases Section
    ├── Search & Filters
    └── Cases Table
```

**After**:
```
Cases Page
└── Cases Section
    ├── Search & Filters
    └── Cases Table

Accounts Page (NEW)
└── Accounts Section
    ├── Stats Cards
    ├── Add Account button
    └── Accounts Table
```

### ✅ Navigation Updated

**Files**: 
- `src/components/sidebar.tsx`
- `src/components/mobile-sidebar.tsx`

Added "Accounts" link to both desktop and mobile navigation menus.

**Navigation Order**:
1. Dashboard
2. Workspaces
3. Cases
4. **Accounts** ⭐ NEW
5. Analytics

**Icon**: User icon from Lucide

## How to Access

### Desktop
1. Click **"Accounts"** in the sidebar
2. Or navigate to: http://localhost:3001/accounts

### Mobile
1. Open menu (hamburger icon)
2. Click **"Accounts"**
3. Sidebar closes automatically

## Page Layout

```
┌─────────────────────────────────────────────────────┐
│  Seller Central Accounts        [Refresh] [Add]    │
│  Manage your Amazon Seller Central accounts...     │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Total    │  │ Active   │  │ Last     │        │
│  │    5     │  │    5 ●   │  │ Updated  │        │
│  └──────────┘  └──────────┘  └──────────┘        │
├─────────────────────────────────────────────────────┤
│  Account Name | Username | Password | 2FA | Date  │
│  ───────────────────────────────────────────────── │
│  REFRIGIWEAR  │ user@... │ ••••••   │ ••• │ [🗑]  │
│  BABYEXPERT   │ test@... │ ••••••   │ ••• │ [🗑]  │
└─────────────────────────────────────────────────────┘
```

## Benefits of Separate Page

### User Experience
✅ **Better Organization** - Each page has a single, clear purpose  
✅ **Less Clutter** - Cases page is now focused on cases only  
✅ **Easier Navigation** - Direct link in sidebar  
✅ **More Space** - Full page for account management  

### Development
✅ **Separation of Concerns** - Each page handles its own data  
✅ **Easier Maintenance** - Changes to accounts don't affect cases  
✅ **Better Performance** - Only load account data when needed  
✅ **Cleaner Code** - Simpler component structure  

### Future Enhancements
✅ **Room to Grow** - Easy to add more account features  
✅ **Better Filters** - Can add account-specific filters  
✅ **Bulk Operations** - Space for bulk import/export  
✅ **Account Details** - Can add detailed view per account  

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/accounts` | GET | Fetch all accounts |
| `/api/accounts` | POST | Create new account |
| `/api/accounts/[id]` | DELETE | Delete account |
| `/api/accounts/[id]` | GET | Get single account with credentials |

## Components Used

- `<AddAccountModal>` - Modal for adding accounts
- `<AccountsTable>` - Table displaying accounts
- `<Button>` - Action buttons
- Lucide icons: `User`, `Plus`, `RefreshCw`

## State Management

```typescript
const [isModalOpen, setIsModalOpen] = useState(false);
const [accounts, setAccounts] = useState<Account[]>([]);
const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
```

## Data Flow

```
1. Page loads → fetchAccounts()
2. API call → GET /api/accounts
3. MongoDB query → Return accounts (no passwords)
4. Set state → Update UI
5. User adds account → Modal opens
6. Submit form → POST /api/accounts
7. Success → fetchAccounts() → Refresh list
```

## Security Notes

✅ **Passwords never displayed** in the table (always `••••••••`)  
✅ **2FA keys never displayed** in the table (always `••••••••`)  
✅ **MongoDB stores hashed** passwords and 2FA keys  
✅ **API excludes sensitive fields** by default  
✅ **HTTPS recommended** for production  

## Responsive Design

### Desktop (≥1024px)
- Full sidebar visible
- 3-column stats grid
- Full-width table

### Tablet (768px - 1023px)
- Collapsible sidebar
- 3-column stats grid
- Scrollable table

### Mobile (<768px)
- Hamburger menu
- Stacked stats cards
- Horizontal scroll table

## Future Enhancements

Potential features for the Accounts page:

- [ ] **Edit Account** - Update account details
- [ ] **Test Connection** - Verify credentials work
- [ ] **Account Groups** - Organize by brands/regions
- [ ] **Tags/Labels** - Custom categorization
- [ ] **Bulk Import** - CSV upload
- [ ] **Export** - Download account list
- [ ] **Search/Filter** - Find accounts quickly
- [ ] **Sort** - By name, date, etc.
- [ ] **Account Health** - Last successful login
- [ ] **Usage Stats** - API call counts
- [ ] **Audit Log** - Track account changes

## Testing

### Manual Testing Checklist

- [ ] Navigate to `/accounts` page
- [ ] Verify stats cards display correctly
- [ ] Click "Add Account" - modal opens
- [ ] Fill form and submit - account appears
- [ ] Click refresh - data reloads
- [ ] Click delete - confirmation and removal
- [ ] Check sidebar link highlights when active
- [ ] Test mobile responsive design
- [ ] Verify passwords/2FA keys are hidden

### API Testing

```bash
# Get all accounts
curl http://localhost:3001/api/accounts

# Create account
curl -X POST http://localhost:3001/api/accounts \
  -H "Content-Type: application/json" \
  -d '{"accountName":"Test","username":"test@example.com","password":"pass","twoFAKey":"key"}'

# Delete account
curl -X DELETE http://localhost:3001/api/accounts/[id]
```

## Related Files

| File | Purpose |
|------|---------|
| `src/app/accounts/page.tsx` | Main accounts page |
| `src/app/cases/page.tsx` | Cases page (cleaned up) |
| `src/components/sidebar.tsx` | Desktop navigation |
| `src/components/mobile-sidebar.tsx` | Mobile navigation |
| `src/components/add-account-modal.tsx` | Add account modal |
| `src/components/accounts-table.tsx` | Accounts display table |
| `src/app/api/accounts/route.ts` | API endpoints |

## Migration Notes

If you had bookmarks or links to the accounts section on the cases page, update them to `/accounts`.

**Old**: `/cases` (scroll to accounts section)  
**New**: `/accounts` (dedicated page)

---

**Status**: ✅ Complete  
**Page URL**: http://localhost:3001/accounts  
**Navigation**: Sidebar → Accounts

