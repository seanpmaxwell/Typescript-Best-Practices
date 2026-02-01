## Script Examples

### Module-Object Script

```ts
// utils/MailUtils.ts

// After we initialize the mailer, no further changes are needed
const mailer = someThirdPartyMailerLib("your settings");

function sendMail(options: MailerOptions): Promise<void> {
   await mailer.send(options);
}

function sendSupportStaffEmail(options: MailerOptions): Promise<void> {
   await mailer.send({ ...options, to: process.env.SUPPORT_STAFF_EMAIL });
}

export default {
  sendMail,
  sendSupportStaffEmail,
} as const;
```

---

### Inventory Script

```tsx
// common/components/buttons.tsx

export function SubmitButton() {
  return <button>Submit</button>;
}

export function CancelButton() {
  return <button color="red">Submit</button>;
}

export function CloseButton() {
  return <button color="grey">Close</button>;
}
```

---

### Linear Script

```ts
// server.ts

import express from 'express';

const app = express(); 

app.use(middleware1);
app.use(middleware2);

doSomething();
doSomethingElse();

export default app;
```

---

### Declaration Script

```typescript
// EnvVars.ts

export default {
    port: process.env.PORT,
    host: process.env.Host,
    databaseUsername: process.env.DB_USERNAME,
    ...etc,
} as const;
```
