# فودنیکس (foodnix)

فودنیکس، سامانه رزرو و مدیریت غذای کارکنان است.

## BaaS web configuration

Set these variables in `.env.local` and in the deployment environment:

- `NEXT_PUBLIC_BAAS_API_KEY`: browser API key for the BaaS SDK; required at build time.
- `BAAS_SERVER_KEY`: server-only key, reserved for server integrations; never sent to the browser.
- `FOODNIX_ANALYTICS_IDENTITY_KEY`: stable server-only HMAC secret for pseudonymous employee IDs. Configure the same secret and algorithm in the server issuing IDs for web and native apps.

The root layout initializes one CoreSDK instance and shares it with AnalyticsSDK,
AuthSDK, and PushSDK. Foodnix sign-in continues to use its own backend.
The SDK is installed from `vendor/baas-web-sdk-1.0.0.tgz`, packaged from the official
BaaS SDK already installed in this project, and loaded through browser-only
dynamic imports from `baas-web-sdk/core`, `baas-web-sdk/analytics`,
`baas-web-sdk/auth`, and `baas-web-sdk/push`. Commit the vendor archive together with
`package.json` and `package-lock.json`. `npm ci` installs this SDK from the archive
without contacting Nexus. Other dependencies still use their configured registry.
To upgrade the SDK, obtain and verify the intended release, replace the versioned
vendor archive and update the dependency and lockfile together.
Opening food details records
`product_view` with the food ID (`P-{food_id}`), its displayed price in toman,
`category: "food"`, and `in_stock: true`. Views wait for SDK loading; analytics
failures do not block the reservation interface. Restart the dev server or rebuild
after changing the public API key.

Important events and events explicitly selected by the user must flush the SDK
queue in the background after logging. Add their names to `immediateEvents` in
`lib/analytics.ts` and update the list and acceptance criteria in
[the Analytics documentation](docs/analytics.md). Upload failures must remain
isolated from the application flow.

Browser notifications are enabled from the dashboard Notifications page on HTTPS
or localhost. The existing `/sw.js` imports the BaaS worker and must be active
before Push starts. The current BaaS SDK receives messages over a WebSocket while
a dashboard tab is open and reports notification clicks and dismissals through
the worker. Closing all dashboard tabs stops the WebSocket. To verify delivery,
grant permission in the browser and send a test notification to that installation
from the BaaS test environment.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
