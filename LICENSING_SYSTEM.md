# Licensing & Entitlement System Documentation

Welcome to the technical reference manual for the **Indie Dev Boss Protocol** software licensing and entitlement management system. This documentation is written for human developers, system administrators, and AI agents. It explains the design, architecture, internal mechanics, and integration details of the system.

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Data Model (Database Schema)](#2-data-model-database-schema)
3. [Component Breakdown](#3-component-breakdown)
4. [Data Flows](#4-data-flows)
5. [External Dependencies](#5-external-dependencies)
6. [Key Functions Reference](#6-key-functions-reference)
7. [Implementation Critique & Recommendations](#7-implementation-critique--recommendations)

---

## 1. Overview & Architecture

The application implements a robust, secure, and multi-tier licensing and entitlement management system. It supports three distinct licensing tiers:

- **Free Trial**: A time-limited tier (3 days for the core application protocol, with license keys supporting 14-day trials).
- **Subscription**: A recurring access model (e.g., annual subscription/365-day license keys).
- **Lifetime**: A permanent access model that unlocks all protocol features indefinitely.

### Core Architecture Goals

1. **Multi-Channel Delivery**: Licenses can be issued automatically via Stripe payment webhooks, manually via the admin control panel, or programmatically via a secured external HTTP API (webhook triggers).
2. **Device Binding (Node-Locking)**: To prevent key sharing, licenses are bound to a unique `hardwareId` upon activation. Continuous validation ensures that only the authorized device can use the product.
3. **Decoupled API Delivery**: Alongside the react-based dashboard, the system exposes public, authenticated HTTP endpoints allowing external desktop apps, CLI tools, or mobile clients to activate and validate licenses.
4. **Resilient Entitlement Gating**: Access control is enforced both client-side (via React `TrialGate` wrapping) and server-side (via Convex query and mutation business rules).

### High-Level Architecture Diagram

```
                              [Stripe Checkout]
                                     │
                                     ▼ (Webhook)
                              [Convex HTTP Router] ◄─── [External Webhooks]
                                (/webhook/stripe)       (/webhook/license/create)
                                     │
                                     ▼ (internalAction)
                        [licenses.generateAndSend] ───► (Sends Key via VLY Email)
                                     │
                                     ▼ (internalMutation)
                               [Convex DB]
                                     ▲
             ┌───────────────────────┴───────────────────────┐
             │                                               │
      (React Client)                                 (External Apps)
             │                                               │
             ▼                                               ▼
    [Settings/Billing] ───────────────┐              [POST /api/activate]
   [Convex queries & mutations]       │              [POST /api/validate]
             │                        ▼                      │
             └──────────────► [licenses.ts] ◄────────────────┘
                              - activate()
                              - validate()
```

---

## 2. Data Model (Database Schema)

Entitlements and licenses are managed across two main tables in the Convex database (`src/convex/schema.ts`).

### 1. `licenses` Table

Stores license metadata, keys, state, validity, and node-locking associations.

| Field         | Type                                      | Description                                                    |
| ------------- | ----------------------------------------- | -------------------------------------------------------------- |
| `key`         | `string`                                  | Unique cryptographic identifier (e.g., `XXXX-XXXX-XXXX-XXXX`). |
| `type`        | `"trial" \| "subscription" \| "lifetime"` | The access tier represented by this license.                   |
| `status`      | `"active" \| "revoked" \| "expired"`      | The administrative status of the key.                          |
| `userEmail`   | `string`                                  | The owner's email address.                                     |
| `hardwareId`  | `string` (Optional)                       | The unique node identifier bound to this license.              |
| `expiresAt`   | `number` (Optional)                       | Unix epoch millisecond timestamp indicating expiration.        |
| `activatedAt` | `number` (Optional)                       | Unix epoch millisecond timestamp of the initial activation.    |

#### Database Indexes:

- **`by_key`** (on `key`): Enables instant `O(1)` lookups of license keys.
- **`by_user_email`** (on `userEmail`): Optimizes looking up licenses associated with a specific user.

### 2. `users` Table

Relevant fields on the user document that support the licensing system:

| Field    | Type                 | Description                                                                               |
| -------- | -------------------- | ----------------------------------------------------------------------------------------- |
| `email`  | `string` (Optional)  | User email address.                                                                       |
| `isPaid` | `boolean` (Optional) | Denotes lifetime/paid status for the user record. Used for legacy/stripe synchronization. |

---

## 3. Component Breakdown

### A. Convex Backend (`src/convex/licenses.ts`)

This is the core business logic layer that interacts directly with the Convex database.

- **Key Generation**: Utilizes a cryptographically secure random reader via the `@oslojs/crypto/random` library. It avoids ambiguous characters (like `O`, `0`, `I`, `1`) to make keys highly human-readable.
- **License Activation**: Maps the authenticated user to a license key, sets the activation timestamp, and binds the device-specific `hardwareId`.
- **State Synchronization**: When a `lifetime` license is activated or created for a user, the backend automatically modifies the associated user's record setting `isPaid` to `true`, ensuring database consistency.
- **Administrative Control**: Functions such as `revoke`, `listAll`, `adminCreateLicense`, and `adminRevokeLicense` are protected by checking the user's role against the `isAdmin` helper.

### B. Public HTTP API Layer (`src/convex/http.ts`)

Exposes REST endpoints to facilitate automated and external client interactions.

- **Stripe Webhook (`/webhook/stripe`)**: Listens to Stripe events. On `checkout.session.completed`, it extracts the customer's email, automatically runs `licenses.generateAndSend` for a lifetime license, upgrades the user's database `isPaid` flag, and triggers a Clerk user metadata sync.
- **External License Webhook (`/webhook/license/create`)**: Secured via a shared secret (`VLY_WEBHOOK_SECRET` passed in the `Authorization` bearer header). It allows external stores or fulfillment engines to issue licenses programmatically.
- **Client REST Endpoints**: Publicly exposes `/api/license/activate` and `/api/license/validate`, resolving and invoking their respective Convex server mutations.

### C. Notebook & Entitlement Gating (`src/convex/notebook.ts` & `TrialGate.tsx`)

Enforces trial and payment rules across the application.

- **Entitlement Resolution (`currentProfile` query)**:
  This is the primary endpoint for retrieving client state. It queries the user profile and evaluates access:
  1. Checks if the user's record has `isPaid: true`.
  2. Queries the `licenses` table for any `active`, non-expired trial, subscription, or lifetime licenses matching the user's email.
  3. Returns `isPaid = true` if _either_ condition is met, alongside the active `licenseType` and `licenseKey`.
- **Server-Side Gate (`upsertLog` mutation)**:
  Ensures that users on the Free Trial cannot save daily logs beyond Day 3 of their protocol schedule. If a user tries to bypass the UI client-side, the server throws an error: `"Trial expired. Please unlock the protocol to continue logging."`
- **Client-Side Gate (`TrialGate.tsx`)**:
  Wraps the main application routes. If the current protocol day is $>3$ and `profile.isPaid` is false, it intercepts user interaction, displays an elegant, locked "The free trial ends here" screen, and displays a link to purchase the full protocol.

### D. User Interface Pages

- **Settings Page (`src/pages/dashboard/Settings.tsx`)**:
  Allows users to see their active license key, copy it, and input a newly purchased license key. To support web browser activation, it generates a stable client-side unique identifier `idb_hw_id` stored in `localStorage` which serves as the client browser's `hardwareId`.
- **Billing Page (`src/pages/dashboard/Billing.tsx`)**:
  Displays active plans and features an integrated Clerk Billing `PricingTable` and standard Stripe checkout links for upgrading.
- **Admin License Panel (`src/pages/LicensingTest.tsx`)**:
  Provides a secure UI restricted to administrative users. It aggregates total keys, displays active licenses, permits searching by key/email, lets admins issue manual overrides/custom license tiers, and allows revoking keys with one click.

---

## 4. Data Flows

### Purchase & Issuance Flow (Stripe / Webhook)

```
[User Purchases License] ──► [Stripe Webhook Event] ──► [http.ts (/webhook/stripe)]
                                                               │
                                                               ▼
[Email Sent to User] ◄── [vly.ai send_otp API] ◄── [licenses.generateAndSend]
                                                               │
                                                               ▼
                                                  [licenses.createInternal]
                                                               │
                                                               ▼
                                                   [Convex DB (Active License)]
```

### Client-Side Activation & Binding (Node-Locking)

```
[User Enters License Key] ──► [SettingsPage Form Submit]
                                     │
                                     ├─► Generates local device ID if missing
                                     │   (`localStorage.getItem('idb_hw_id')`)
                                     ▼
                        [licenses.activate(key, hardwareId)]
                                     │
                                     ▼
                      Checks key validity & ensures:
                      - Exists and status is "active"
                      - Not expired
                      - No prior device bound (or matches hardwareId)
                                     │
                                     ▼
                     Binds license to user email & device
                     Updates user profile 'isPaid' status
                                     │
                                     ▼
                   Success Toast / Interface Unlocks
```

### Continuous Validation & Entitlement Checking

```
             [Every Application Load / API Request]
                               │
                               ▼
              [Query/HTTP POST to validate/profile]
                               │
            ┌──────────────────┴──────────────────┐
            ▼ (Continuous Validation)             ▼ (Profile Resolution)
    [validate(key, hwId)]                   [currentProfile query]
            │                                     │
    - Lookup License                              - Read User Table status
    - Assert `status === "active"`                - Query matches in `licenses`
    - Verify `hardwareId === hwId`                 - Determine if active key is
    - Assert `Date.now() < expiresAt`               trial, subscription, or lifetime
            │                                     │
            ▼                                     ▼
  { valid: true/false }                  { isPaid: true/false, licenseType }
```

---

## 5. External Dependencies

The licensing system leverages several critical integrations and utility libraries to operate securely and cleanly:

1. **`@vly-ai/integrations`**: Custom SDK that provides pre-integrated AI, email, and payment helpers. Used in `payments.ts` to spin up Checkout Sessions.
2. **VLY Email Delivery Service (`https://email.vly.ai/send_otp`)**: Used in `licenses.generateAndSend` to deliver generated keys to customers.
3. **`@oslojs/crypto/random` & Web Crypto**: Used to generate secure, un-guessable alphanumeric keys with the exclusion of visually confusing characters.
4. **Stripe**: Handles real-time transaction processing. Triggers the transaction fulfillment flow on the backend.
5. **Clerk Auth & Billing**: Powers the identity layer and recurring subscription management UI.

---

## 6. Key Functions Reference

### `generateKey()`

- **Scope**: Private/Internal to `licenses.ts`
- **Signature**: `function generateKey(): string`
- **Behavior**: Uses cryptographically secure random byte allocation to generate a unique string composed of 16 uppercase characters divided into 4 segments separated by hyphens (e.g., `ABCD-EFGH-JKLM-NPQR`). The alphabet used avoids ambiguous visual characters (`I, O, 1, 0`).

---

### `licenses.generateAndSend` (internalAction)

- **Signature**:
  ```typescript
  args: {
    userEmail: v.string(),
    type: v.union(v.literal("trial"), v.literal("subscription"), v.literal("lifetime"))
  }
  ```
- **Returns**: `{ success: boolean, key: string }`
- **Behavior**:
  1. Computes absolute duration bounds:
     - `trial` = $+14$ days.
     - `subscription` = $+365$ days.
     - `lifetime` = permanent (no expiration).
  2. Generates a fresh key and inserts the record into the database via `createInternal`.
  3. Formulates a POST request to `email.vly.ai` delivering the key directly to the user.

---

### `licenses.activate` (mutation)

- **Signature**:
  ```typescript
  args: {
    key: v.string(),
    hardwareId: v.string()
  }
  ```
- **Returns**: `{ success: boolean, type: "trial" | "subscription" | "lifetime" }`
- **Behavior**:
  - Validates authentication state.
  - Queries license index `by_key`. Throws error if missing.
  - Throws error if status is not `"active"`.
  - Checks if expired. If yes, updates database status to `"expired"` and throws an error.
  - Validates node-locking: Throws error if `license.hardwareId` exists and is different from the provided `hardwareId`.
  - Patches database: associates `hardwareId`, sets `activatedAt`, updates user email on the key if missing.
  - Synchronizes user tier: If license is a `lifetime` plan, it upgrades the user record's `isPaid` flag to `true`.

---

### `licenses.validate` (query)

- **Signature**:
  ```typescript
  args: {
    key: v.string(),
    hardwareId: v.string()
  }
  ```
- **Returns**: `{ valid: boolean, type?: string, expiresAt?: number, reason?: string }`
- **Behavior**:
  Read-only operation designed for fast, routine execution. Verifies key presence, asserts status is `"active"`, checks against absolute expiration limits, and enforces `hardwareId` device consistency.

---

## 7. Implementation Critique & Recommendations

Although the licensing system is operational and integrates cleanly with external layers, there are multiple avenues for improvement regarding **security**, **scalability**, **maintainability**, and **node-locking flexibility**.

### 1. Dual-Source of Truth & Synchronization Risks

- **The Issue**: Entitlement is determined by looking at two distinct places: the `isPaid` flag on the `users` table, and active keys in the `licenses` table.
  - If an admin revokes a lifetime license via `adminRevokeLicense`, it looks up the user by email and sets `isPaid: false`. However, if the user was originally configured with `isPaid: true` via an admin `unlockProtocol` call, they will lose access even though they should have had access.
  - If a user changes their email address in Clerk, the `by_user_email` query in `currentProfile` will fail to associate their license, breaking access.
- **Recommendation**: Consolidate access state. Avoid updating raw flags like `isPaid` on the `users` table directly. Instead, make the `licenses` table the single source of truth for paid access.
- **Suggested Code Change**:
  Refactor `currentProfile` to resolve access purely through active license records linked to the user's ID or active email, rather than relying on legacy boolean flags.

```typescript
// Proposed refactored isPaid check in currentProfile query:
const activeLicense = await ctx.db
  .query("licenses")
  .withIndex("by_user_email", (q) => q.eq("userEmail", email))
  .filter((q) => q.eq("status", "active"))
  .first();

const isPaid = activeLicense
  ? !activeLicense.expiresAt || activeLicense.expiresAt > Date.now()
  : false;
```

---

### 2. Node-Locking Strength (Hardware Fingerprinting)

- **The Issue**: The frontend generates a random client-side hardware ID (`WEB-XXXXXXXX`) and stores it in `localStorage`.
  - If the user clears their browser cache or local storage, their hardware ID is lost forever. When they input the key again, it will trigger a mismatch error: `"License is already bound to another device"`.
  - It is trivial for users to bypass this restriction on web apps by manually copying the `idb_hw_id` value from one browser's local storage to another.
- **Recommendation**:
  - Introduce an admin/user function in the settings panel to "Reset Hardware Binding". This clears the `hardwareId` field on the license in the database, allowing activation on a new device.
  - Implement canvas fingerprinting, system info checks, or browser-signature matching on the client side to make the `hardwareId` more stable than a simple `localStorage` variable.

```typescript
// Proposed Reset Hardware Binding mutation:
export const resetHardwareBinding = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const license = await ctx.db
      .query("licenses")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (!license || license.userEmail !== user.email) {
      throw new Error("Unauthorized");
    }

    // Reset the hardwareId so it can be bound again
    await ctx.db.patch(license._id, {
      hardwareId: undefined,
      activatedAt: undefined,
    });

    return { success: true };
  },
});
```

---

### 3. Public API Protection (No Rate-Limiting)

- **The Issue**: The endpoints `/api/license/activate` and `/api/license/validate` are publicly accessible post routes with no protection against brute-force attacks. A malicious user could write a simple script to guess 16-character license keys (brute forcing alphabetical patterns), running unlimited queries on your database.
- **Recommendation**: Implement IP-based rate limiting or integration gateways for public POST routes in `http.ts`, or log repeated bad key validation attempts to track and block abusive IP addresses.

---

### 4. Admin API Authorization Model

- **The Issue**: The mutation `adminCreateLicense` and `adminRevokeLicense` verify administrative rights via `isAdmin(ctx)`. While robust, they rely on resolving the authenticated user via Clerk. If an external service wants to perform administrative tasks, they are locked out because they cannot simulate an active user session.
- **Recommendation**: Standardize administrative webhooks by introducing API Key authorization headers (such as `X-Admin-API-Key`) checking against a server-side secret, identical to how `/webhook/license/create` handles `VLY_WEBHOOK_SECRET`.

---

### 5. Indexing Optimizations

- **The Issue**: The query checking for active licenses in `notebook.ts` uses `.filter((q) => q.eq("status", "active"))` in combination with the `by_user_email` index. While fast for small tables, scanning and filtering in-memory can degrade query times on millions of users.
- **Recommendation**: Optimize query indexing by adding a compound index to the `licenses` table that encompasses both user emails and status fields.

```typescript
// Add compound index in schema.ts
licenses: defineTable({
  key: v.string(),
  type: v.union(
    v.literal("trial"),
    v.literal("subscription"),
    v.literal("lifetime"),
  ),
  status: v.union(
    v.literal("active"),
    v.literal("revoked"),
    v.literal("expired"),
  ),
  userEmail: v.string(),
  hardwareId: v.optional(v.string()),
  expiresAt: v.optional(v.number()),
  activatedAt: v.optional(v.number()),
})
  .index("by_key", ["key"])
  .index("by_user_email_status", ["userEmail", "status"]); // Compound Index
```
