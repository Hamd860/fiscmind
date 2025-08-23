# Fiscmind Financial Reporting App

Fiscmind is a modern web application that allows finance professionals to map a trial balance (TB) and automatically generate the key financial statements—Balance Sheet (BS), Income Statement (IS), Statement of Changes in Equity (SOCIE) and Cash Flow Statement—for both **International Financial Reporting Standards (IFRS)** and **US GAAP (ASC)**.  The application supports multi‑currency reporting, role‑based feature tiers (Standard vs. Pro) and integrates with common SaaS tooling such as **Firebase**, **Netlify**, **Zoho Mail** and **Carrd**.

This repository contains everything you need to run the application locally and deploy it to Netlify or Firebase.  The project is split into two main parts:

* `frontend/` – a React single‑page application built with Vite.  It handles the user interface, authentication, TB upload, statement generation and currency conversion.
* `functions/` – serverless functions used for currency rate retrieval and email notifications.  These functions can run in Netlify Functions or Firebase Cloud Functions.

## Features

### Core Functionality

1. **Trial Balance Upload & Mapping** – Upload a trial balance (CSV/Excel) and map each account to a standardized chart of accounts.  The mapping logic is defined in `frontend/src/lib/accountMapping.js`.  Once mapped, the system aggregates the balances into the appropriate financial statement sections for IFRS or ASC.
2. **Financial Statement Generation** – Generate the Balance Sheet, Income Statement, Statement of Changes in Equity and Cash Flow Statement.  The generation logic lives in `frontend/src/lib/statementGenerator.js`.  IFRS presents assets in increasing order of liquidity (non‑current first) and provides flexibility in the classification of interest and dividends in the cash flow statement, whereas ASC (US GAAP) lists assets in decreasing order of liquidity (current first) and requires interest income/expense and dividends received to be reported in the operating section【474342422872600†L371-L397】.
3. **Multi‑Currency Support** – Users can select a reporting currency.  Exchange rates are retrieved via a serverless function (`functions/getRates.js`) which calls a public FX API.  The frontend converts TB balances to the selected currency on demand.
4. **Authentication & Access Control** – Firebase Authentication (email/password or social providers) is used for user login.  A `role` field stored in Firestore determines whether a user has **Standard** or **Pro** access.  Pro users unlock multi‑currency, export/download and advanced filtering features.
5. **Email Notifications** – A sample function (`functions/sendMail.js`) demonstrates how to send transactional emails (e.g. statement ready notifications) via Zoho Mail using SMTP.  Configure your Zoho credentials in environment variables to use this feature.

### Deployment Targets

* **Netlify** – Deploy the React frontend as a static site and the serverless functions under the `/functions` directory.  Netlify automatically detects serverless functions and provisions endpoints.
* **Firebase** – The same functions can run as Firebase Cloud Functions.  The Firebase project also hosts Firestore for storing TB data, mappings and user roles, and provides Authentication.
* **Carrd & Custom Domain** – Use Carrd to build a marketing landing page for your brand (e.g. `fiscmind.com`) and link the Netlify or Firebase application via a “Login” button.  Carrd’s custom domain configuration allows you to point your domain’s root to Netlify and set up subdomains (e.g. `app.fiscmind.com`) for the app.

## Getting Started

### Prerequisites

* **Node.js 18+** – Install Node and npm.
* **Firebase Project** – Create a new Firebase project, enable Authentication (Email/Password) and Firestore.
* **Netlify Account** – Sign up for Netlify and link your Git repository for continuous deployment.
* **Zoho Mail Account** – Optional: Create a Zoho Mail account for transactional emails and obtain SMTP credentials.

### Project Structure

```text
fiscmind/
├── README.md             # this file
├── frontend/             # React client application
│   ├── index.html        # entry HTML file used by Vite
│   ├── package.json      # frontend dependencies
│   ├── vite.config.js    # Vite configuration
│   └── src/
│       ├── main.jsx      # React entrypoint
│       ├── App.jsx       # top level routes and layout
│       ├── firebase.js   # Firebase initialization
│       ├── components/
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── TrialBalanceUpload.jsx
│       │   ├── StatementSelector.jsx
│       │   ├── StatementViewer.jsx
│       │   └── CurrencySelector.jsx
│       └── lib/
│           ├── accountMapping.js   # chart of accounts & mapping logic
│           ├── statementGenerator.js # IFRS/ASC statement building
│           └── currency.js        # currency conversion helpers
├── functions/            # serverless functions for Netlify/Firebase
│   ├── getRates.js       # fetch FX rates from a public API
│   ├── sendMail.js       # send email via Zoho SMTP
│   └── package.json      # functions dependencies
└── .gitignore            # ignore node_modules and environment files
```

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourorg/fiscmind.git
cd fiscmind
```

2. **Configure environment variables**

Create a `.env` file in `frontend/` and another in `functions/`.

`frontend/.env`

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_BASE_CURRENCY=USD            # default reporting currency
VITE_BACKEND_URL=/api             # Netlify will proxy /api to functions
```

`functions/.env`

```env
FX_API_URL=https://api.exchangerate-api.com/v4/latest
ZOHOMAIL_USER=your@domain.com      # Zoho SMTP username
ZOHOMAIL_PASS=your_smtp_password   # Zoho SMTP password
```

3. **Install dependencies**

```bash
# install frontend dependencies
cd frontend
npm install

# install function dependencies
cd ../functions
npm install

cd ..
```

### Development

Run the frontend and serverless functions locally using Netlify’s CLI (recommended).  Install the Netlify CLI globally if you haven’t:

```bash
npm install -g netlify-cli
netlify dev
```

This command starts the React dev server and proxies API calls under `/api` to your functions.  Alternatively you can run the frontend and functions separately:

```bash
# in one terminal
cd frontend
npm run dev

# in another terminal
cd ../functions
netlify functions:serve
```

### Deployment

1. **Netlify** – Connect your repository in the Netlify dashboard.  Set the build command to `npm run build --prefix ./frontend` and the publish directory to `frontend/dist`.  Netlify automatically detects the functions in the `functions/` directory.  Add your `.env` variables as environment variables in Netlify.
2. **Firebase** – If you prefer Firebase Hosting and Cloud Functions, run:

```bash
firebase init hosting functions
# choose existing project
# set hosting public directory to frontend/dist
# configure as a single‑page app (rewrite all to index.html)
```

Then deploy:

```bash
npm run build --prefix ./frontend
firebase deploy
```

### Role‑Based Features

User documents in Firestore should include a `role` field with either `standard` or `pro`.  For example:

```json
{
  "uid": "abc123",
  "email": "user@example.com",
  "role": "pro"
}
```

The frontend checks the user’s role and unlocks pro‑only features such as multi‑currency selection and exporting statements to CSV/PDF.  You can manage roles manually in the Firebase console or build an admin interface.

## Financial Statement Differences (IFRS vs. ASC)

When generating statements the application observes key presentation differences between IFRS and ASC:

* **Balance Sheet Ordering** – Under US GAAP (ASC) assets and liabilities are listed in order of liquidity; current assets appear before non‑current assets.  IFRS reverses this order, presenting non‑current assets first【474342422872600†L371-L397】.  The generator sorts accounts accordingly.
* **Cash Flow Classification** – US GAAP requires interest received, interest paid and dividends received to be reported in the operating section of the cash flow statement and dividends paid in financing【474342422872600†L371-L397】.  IFRS allows these items to be classified as operating, investing or financing.  The generator uses operating for all by default but exposes a configuration option for users to override classification.
* **Number of Comparative Periods** – ASC generally presents three comparative periods for the income statement whereas IFRS typically presents two【474342422872600†L371-L404】.  The demo generator displays a single period by default but can be extended.

For a more exhaustive list of differences—including treatment of R&D costs, contingent liabilities and inventory cost methods—consult the Wall Street Prep comparison【474342422872600†L371-L499】.  This application focuses on presentation differences most relevant to generating statements.

## Contributing

Pull requests are welcome!  Feel free to open issues or feature requests.  This project is provided as a starting point and does not constitute accounting advice.  Always consult a qualified professional for financial reporting guidance.
