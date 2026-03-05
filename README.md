# Backend API - Technical Test Sprout

A complete backend API built with clean architecture principles using TypeScript, Express, Drizzle ORM, and PostgreSQL.

## 🏗️ Architecture

The project follows clean architecture with clear separation of concerns:

```
src/
├── domain/           # Business entities and errors
├── application/      # Repository interfaces and services
├── infrastructure/    # Database models, implementations, utilities
└── presentation/     # Controllers, middleware, routes, schemas
```

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express
- **Database:** PostgreSQL with Drizzle ORM
- **Validation:** Zod
- **Authentication:** JWT
- **Code Quality:** Biome, Husky, Commitlint

## 📋 Prerequisites

- Node.js (v18+)
- pnpm (recommended) or npm
- PostgreSQL database

## 🚀 Getting Started

### 1. Clone and Install Dependencies

```bash
# Install dependencies
pnpm install
```

### 2. Environment Setup

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and configure your database connection:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
```

### 3. Database Setup

```bash
# Generate Drizzle client
pnpm db:generate

# Push schema to database
pnpm db:push

# (Optional) Seed initial data
pnpm db:seed
```

### 4. Run Development Server

```bash
# Start the development server with hot reload
pnpm dev
```

The server will start at `http://localhost:3000`

### 5. Build for Production

```bash
# Build the project
pnpm build

# Start production server
pnpm start
```

## 📝 Available Scripts

| Script             | Description                              |
| ------------------ | ---------------------------------------- |
| `pnpm dev`         | Start development server with hot reload |
| `pnpm build`       | Build the project                        |
| `pnpm start`       | Start production server                  |
| `pnpm db:generate` | Generate Drizzle client                  |
| `pnpm db:push`     | Push schema to database                  |
| `pnpm lint`        | Run Biome linting                        |
| `pnpm lint:fix`    | Fix linting issues                       |

## 📚 API Endpoints

### User Management

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login

### Accounts

- `GET /api/accounts` - List all accounts
- `GET /api/accounts/:id` - Get account by ID
- `POST /api/accounts` - Create account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### Cash Transactions

- `GET /api/cash` - List cash transactions
- `POST /api/cash` - Create cash transaction

### Journal

- `GET /api/journal` - List journal entries
- `POST /api/journal` - Create journal entry

### Accounts Receivable

- `GET /api/ar` - List AR records
- `POST /api/ar` - Create AR record

### Sales

- `GET /api/sales` - List sales invoices
- `POST /api/sales` - Create sales invoice

### Parties

- `GET /api/parties` - List parties (customers)

## 🔐 Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:

```http
Authorization: Bearer <your-token>
```

## 🧪 Testing

```bash
# Run tests
pnpm test
```

## ☁️ Deploy to Vercel

### Prerequisites

- Vercel account
- MySQL database (you can use MySQL on Vercel, Railway, or any MySQL provider)

### 1. Prepare Environment Variables

Go to Vercel Dashboard > Your Project > Settings > Environment Variables and add these variables:

```env
DATABASE_URL=mysql://user:password@host:3306/dbname
PORT=3000
NODE_ENV=production
JWT_SECRET=your-secure-random-secret
JWT_EXPIRES_IN=1d
```

For DATABASE_URL, you can use:

- **Vercel MySQL** (recommended): Get connection string from Vercel Storage
- **Railway MySQL**: Get from Railway dashboard
- **PlanetScale**: Get from PlanetScale dashboard (use SSL option)

### 2. Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
pnpm add -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### 3. Build Command

Vercel will automatically run `pnpm vercel-build` which executes `pnpm build` to compile TypeScript to JavaScript.

### 4. Important Notes

- This project uses MySQL (not PostgreSQL)
- Make sure your database allows external connections
- For production, consider using a connection pool or serverless-compatible database

## 📄 License

MIT
