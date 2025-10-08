# 🛠️ BlinkDisk Development Guide

Welcome to the BlinkDisk development guide. This document will help you set up the project locally.

### ✅ Prerequisites

Ensure the following tools are installed on your system:

- **Node.js** `v22.14.0`
- **pnpm** `v8.15.7`
- **Go** `v1.22.2`
- **PostgreSQL** `v17.4` (available via docker-compose)
- **GNU Make** `v4.3`

### 🚀 Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/blinkdisk/blinkdisk.git
   cd blinkdisk
   ```

2. **Initialize submodules**

   ```bash
   git submodule update --init
   ```

3. **Install dependencies**

   ```bash
   pnpm install
   ```

4. **Build the core backend**

   ```bash
   cd apps/core
   make install
   cd ../..
   ```

5. **Set up environment variables**

   ```bash
   cp .env.template .env
   ```

   Modify `.env` with your local configuration if needed.

6. **Run the application**

   ```bash
   pnpm dev
   ```
