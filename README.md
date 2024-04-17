# Makerkit - Supabase SaaS Starter Kit - Turbo Edition

This is a Starter Kit for building SaaS applications using Supabase, Next.js, and Tailwind CSS.

This version uses Turborepo to manage multiple packages in a single repository.

**This project is currently under development. Please wait for the stable release before using it in production. It will undergo big changes and improvements.**

### Roadmap

The roadmap for the project is as follows:

- [x] - **March 31**: Alpha release - authentication, personal accounts, team accounts (memberships)
- [x] - **April 7**: Beta release - billing, Stripe, Lemon Squeezy, and more
- [ ] - **April 14**: Release candidate - admin dashboard, translations, and more
- [ ] - **April 21**: Final Release candidate - in-app notifications, final features and improvements
- [ ] - **April 28**: Stable release - final features and improvements
- [ ] - **May 4**: Post-release - documentation, tutorials, and more

## Features

- **Authentication**: Sign up, sign in, sign out, forgot password, update profile, and more.
- **Billing**: Subscription management, one-off payments, flat subscriptions, per-seat subscriptions, and more.
- **Personal Account**: Manage your account, profile picture, and more.
- **Team Accounts**: Invite members, manage roles, and more. Manage resources within a team.
- **RBAC**: Simple-to-use role-based access control. Customize roles and permissions (coming soon).
- **Admin Dashboard**: Manage users, subscriptions, and more.
- **Pluggable**: Easily add new features and packages to your SaaS application.
- **Super UI**: Beautiful UI using Shadcn UI and Tailwind CSS.

The most notable difference between this version and the original version is the use of Turborepo to manage multiple packages in a single repository.

Thanks to Turborepo, we can manage and isolate different parts of the application in separate packages. This makes it easier to manage and scale the application as it grows.

Additionally, we can extend the codebase without it impacting your web application.

Let's get started!

## Quick Start

### 0. Prerequisites

- Node.js 18.x or later
- Docker
- Pnpm
- Supabase account (optional for local development)
- Payment Gateway account (Stripe/Lemon Squeezy)
- Email Service account (optional for local development)

#### 0.1. Install Pnpm

```bash
# Install pnpm
npm i -g pnpm
```

### 1. Setup dependencies

```bash
# Install dependencies
pnpm i
```

### 2. Start the development server

```bash
# Start the development server
pnpm dev
```

This command will run the web application.

Please refer to `apps/web/README.md` for more information about the web application.

### 3. Start the Supabase server

To start the Supabase server, you can use the following command:

```bash
# Start the Supabase server
pnpm run supabase:web:start
```

This command runs the Supabase server locally for the app `web`.

Should you add more apps, you can run the following command:

```bash
# Start the Supabase server for the app `app-name`
pnpm run supabase:app-name:start
```

And to stop the Supabase server, you can use the following command:

```bash
# Stop the Supabase server
pnpm run supabase:web:stop
```

To generate the Supabase schema, you can use the following command:

```bash
# Generate the Supabase schema
pnpm run supabase:web:typegen
```

## Architecture

This project uses Turborepo to manage multiple packages in a single repository.

### Apps

The core web application can be found in the `apps/web` package.

Here is where we add the skeleton of the application, including the routing, layout, and global styles.

The main application defines the following:
1. **Configuration**: Environment variables, feature flags, paths, and more. The configuration gets passed down to other packages.
2. **Routing**: The main routing of the application. Since this is file-based routing, we define the routes here.
3. **Local components**: Shared components that are used across the application but not necessarily shared with other apps/packages.
4. **Global styles**: Global styles that are used across the application.

### Packages

Below are the reusable packages that can be shared across multiple applications (or packages).

- **`@kit/ui`**: Shared UI components and styles (using Shadcn UI and some custom components)
- **`@kit/shared`**: Shared code and utilities
- **`@kit/supabase`**: Supabase package that defines the schema and logic for managing Supabase
- **`@kit/i18n`**: Internationalization package that defines utilities for managing translations
- **`@kit/billing`**: Billing package that defines the schema and logic for managing subscriptions
- **`@kit/billing-gateway`**: Billing gateway package that defines the schema and logic for managing payment gateways
- **`@kit/email-templates`**: Here we define the email templates using the `react.email` package.
- **`@kit/mailers`**: Mailer package that abstracts the email service provider (e.g., Resend, Cloudflare, SendGrid, Mailgun, etc.)
- **`@kit/monitoring`**: A unified monitoring package that defines the schema and logic for monitoring the application with third party services (e.g., Sentry, Baselime, etc.)
- **`@kit/database-webhooks`**: Database webhooks package that defines the actions following database changes (e.g., sending an email, updating a record, etc.)
- **`@kit/cms`**: CMS package that defines the schema and logic for managing content
- **`@kit/next`**: Next.js specific utilities

And features that can be added to the application:
- **`@kit/auth`**: Authentication package (using Supabase)
- **`@kit/accounts`**: Package that defines components and logic for managing personal accounts
- **`@kit/team-accounts`**: Package that defines components and logic for managing team
- **`@kit/admin`**: Admin package that defines the schema and logic for managing users, subscriptions, and more.

And billing packages that can be added to the application:
- **`@kit/stripe`**: Stripe package that defines the schema and logic for managing Stripe. This is used by the `@kit/billing-gateway` package and abstracts the Stripe API.
- **`@kit/lemon-squeezy`**: Lemon Squeezy package that defines the schema and logic for managing Lemon Squeezy. This is used by the `@kit/billing-gateway` package and abstracts the Lemon Squeezy API. (Coming soon)
- **`@kit/paddle`**: Paddle package that defines the schema and logic for managing Paddle. This is used by the `@kit/billing-gateway` package and abstracts the Paddle API. (Coming soon

The CMSs that can be added to the application:
- **`@kit/wordpress`**:  WordPress package that defines the schema and logic for managing WordPress. This is used by the `@kit/cms` package and abstracts the WordPress API.
- **`@kit/contentlayer`**: Contentlayer package that defines the schema and logic for managing Contentlayer. This is used by the `@kit/cms` package and abstracts the Contentlayer API. Set to be replaced.

Also planned (post-release):
- **`@kit/notifications`**: Notifications package that defines the schema and logic for managing notifications
- **`@kit/plugins`**: Move the existing plugins to a separate package here
- **`@kit/analytics`**: A unified analytics package to track user behavior

### Application Configuration

The configuration is defined in the `apps/web/config` folder. Here you can find the following configuration files:
- **`app.config.ts`**: Application configuration (e.g., name, description, etc.)
- **`auth.config.ts`**: Authentication configuration
- **`billing.config.ts`**: Billing configuration
- **`feature-flags.config.ts`**: Feature flags configuration
- **`paths.config.ts`**: Paths configuration (e.g., routes, API paths, etc.)
- **`personal-account-sidebar.config.ts`**: Personal account sidebar configuration (e.g., links, icons, etc.)
- **`team-account-sidebar.config.ts`**: Team account sidebar configuration (e.g., links, icons, etc.)

## Installing a Shadcn UI component

To install a Shadcn UI component, you can use the following command:

```bash
npx shadcn-ui@latest add <component> --path=packages/src/ui/shadcn
```

For example, to install the `Button` component, you can use the following command:

```bash
npx shadcn-ui@latest add button --path=packages/src/ui/shadcn
```

We pass the `--path` flag to specify the path where the component should be installed. You may need to adjust the path based on your project structure.

## Environment Variables

The majority of the environment variables are defined in the `apps/web/.env` file. These are the env variables 
shared between environments (eg. they will be the same for development, staging, and production).

**NB: You will not add any secret keys or sensitive information here.** Only configuration, paths, feature flags, etc.

```
# SHARED ENVIROMENT VARIABLES
# HERE YOU CAN ADD ALL THE **PUBLIC** ENVIRONMENT VARIABLES THAT ARE SHARED ACROSS ALL THE ENVIROMENTS
# PLEASE DO NOT ADD ANY CONFIDENTIAL KEYS OR SENSITIVE INFORMATION HERE
# ONLY CONFIGURATION, PATH, FEATURE FLAGS, ETC.
# TO OVERRIDE THESE VARIABLES IN A SPECIFIC ENVIRONMENT, PLEASE ADD THEM TO THE SPECIFIC ENVIRONMENT FILE (e.g. .env.development, .env.production)

# SITE
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PRODUCT_NAME=Makerkit
NEXT_PUBLIC_SITE_TITLE="Makerkit - The easiest way to build and manage your SaaS"
NEXT_PUBLIC_SITE_DESCRIPTION="Makerkit is the easiest way to build and manage your SaaS. It provides you with the tools you need to build your SaaS, without the hassle of building it from scratch."
NEXT_PUBLIC_DEFAULT_THEME_MODE=light
NEXT_PUBLIC_THEME_COLOR="#ffffff"
NEXT_PUBLIC_THEME_COLOR_DARK="#0a0a0a"

# AUTH
NEXT_PUBLIC_AUTH_PASSWORD=true
NEXT_PUBLIC_AUTH_MAGIC_LINK=false
NEXT_PUBLIC_CAPTCHA_SITE_KEY=

# BILLING
NEXT_PUBLIC_BILLING_PROVIDER=stripe

# CMS
CMS_CLIENT=keystatic

# KEYSTATIC
NEXT_PUBLIC_KEYSTATIC_CONTENT_PATH=./content

# LOCALES PATH
NEXT_PUBLIC_LOCALES_PATH=apps/web/public/locales

# PATHS (to be used in "packages")
SIGN_IN_PATH=/auth/sign-in
SIGN_UP_PATH=/auth/sign-up
TEAM_ACCOUNTS_HOME_PATH=/home
INVITATION_PAGE_PATH=/join

# FEATURE FLAGS
NEXT_PUBLIC_ENABLE_THEME_TOGGLE=true
NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_DELETION=true
NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_BILLING=true
NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_DELETION=true
NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_BILLING=true
NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS=true
NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS_CREATION=true
```

Please update the `apps/web/.env` file with the appropriate values.

This is complemented by the environment variables defined in the `apps/web/.env.development` and `apps/web/.env.production` files.

### Production Environment Variables

When going to production, you will need to define the environment variables in the `apps/web/.env.production` file.

```
# SITE
NEXT_PUBLIC_SITE_URL=
```

If you use Stripe, also add:

```
# STRIPE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

From your CI, please add the following environment variables:

```
# SUPABASE
SUPABASE_SERVICE_ROLE_KEY=
```

If you use Stripe, also add:

```
# STRIPE
STRIPE_WEBHOOK_SECRET=
STRIPE_SECRET_KEY=
```

### Database Webhooks

Finally, you need to set a secret `SUPABASE_DB_WEBHOOK_SECRET` that your server and your Supabase instance will share in order to authenticate the requests.

```
SUPABASE_DB_WEBHOOK_SECRET=**************************************************
```

Make it a strong secret key - and make sure to keep it secret!

Now, you need to deploy the Supabase DB webhooks to your Supabase instance. 

Please copy the webhooks (written with Postgres SQL) from apps/web/supabase/seed.sql and make sure to replicate them to the Supabase instance.

Make sure to add the following header `X-Supabase-Event-Signature` with the value of the `SUPABASE_DB_WEBHOOK_SECRET` to the request.

In this way - you server will be able to authenticate the request and be sure it's coming from your Supabase instance.

As endpoint, remember to use the `/api/db/webhook` endpoint. If your APP url is `https://myapp.vercel.app`, the endpoint will be `https://myapp.vercel.app/api/db/webhook`.

#### Adding Database Webhooks from Supabase Studio

While you can create a migration to add the database webhooks, you can also add them from the Supabase Studio.

1. Go to the Supabase Studio
2. Go to Database->Webhooks
3. Click on "Enable Webhooks"
4. Click on "Create a new hook"

Now, replicate thr webhooks at `apps/web/supabase/seed.sql` using the UI:
1. Please remember to set the `X-Supabase-Event-Signature` header with the value of the `SUPABASE_DB_WEBHOOK_SECRET` to the request.
2. Please remember to set the endpoint to `/api/db/webhook` using your real APP URL. If your APP URL is `https://myapp.vercel.app`, the endpoint will be `https://myapp.vercel.app/api/db/webhook`.
3. Use 5000 as the timeout.

## Deploying to Vercel

Deploying to Vercel is straightforward. You can deploy the application using the Vercel CLI or the Vercel dashboard.

No additional configuration is needed to deploy the application to Vercel. If you want to opt-in to the Edge Runtime, please follow the instructions below (except for the Cloudflare CLI installation).

Since Vercel Edge runtime uses Cloudflare, the steps are similar to deploying to Cloudflare.

## Deploying to Cloudflare

To deploy the application to Cloudflare, you need to do the following:

1. Opt-in to the Edge runtime
2. Using the Cloudflare Mailer
3. Install the Cloudflare CLI
4. Switching CMS
5. Setting Node.js Compatibility Flags

### 1. Opting in to the Edge runtime

To opt-in to the Edge runtime, you need to do the following: open the root layout file of your app `apps/web/app/layout.tsx` and export the const runtime as `edge`:

```tsx
export const runtime = 'edge';
```

This will enable the Edge runtime for your application.

### 2. Using the Cloudflare Mailer

Since the default library `nodemailer` relies on Node.js, we cannot use it in the Edge runtime. Instead, we will use the Cloudflare Mailer.

To use the Cloudflare Mailer, you need to do the following. Set the `MAILER_PROVIDER` environment variable to `cloudflare` in the `apps/web/.env` file:

```
MAILER_PROVIDER=cloudflare
```

Setup SPF and DKIM records in your DNS settings.

Please follow [the Vercel Email documentation](https://github.com/Sh4yy/vercel-email?tab=readme-ov-file#setup-spf) to set up the SPF and DKIM records.

### 3. Installing the Cloudflare CLI

Please follow the instructions on the [Cloudflare documentation](https://github.com/cloudflare/next-on-pages/tree/main/packages/next-on-pages#3-deploy-your-application-to-cloudflare-pages) to install the Cloudflare CLI.

### 4. Switching CMS

By default, Makerkit uses Keystatic as a CMS. Keystatic's local mode (which relies on the file system) is not supported in the Edge runtime. Therefore, you will need to switch to another CMS.

At this time, the other CMS supported is WordPress. Set `CMS_CLIENT` to `wordpress` in the `apps/web/.env` file:

```
CMS_CLIENT=wordpress
```

More alternative CMS implementations will be added in the future.

If you leave Keystatic (or any unsupported CMSs) - it'll deploy, but it won't be able to fetch the content so you'll see a 500 error.

### 5. Setting Node.js Compatibility Flags

Cloudflare requires you to set the Node.js compatibility flags. Please follow the instructions on the [Cloudflare documentation](https://developers.cloudflare.com/workers/runtime-apis/nodejs).

Please don't miss this step, as it's crucial for the application to work in the Edge runtime.

## Super Admin

The Super Admin panel allows you to manage users and accounts.

To access the super admin panel at `/admin`, you will need to assign a user as a super admin.

To do so, pick the user ID of the user you want to assign as a super admin and run the following SQL query:

```sql
UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role": "super-admin"}' WHERE id='<user_id>';
```

Please replace `<user_id>` with the user ID you want to assign as a super admin.