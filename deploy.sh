#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default message if none provided
MESSAGE="Automated deployment"

# Parse arguments for -m
while [ $# -gt 0 ]; do
  case "$1" in
    -m)
      shift
      MESSAGE="$1"
      ;;
    *)
      ;;
  esac
  shift
done

echo -e "${YELLOW}🚀 Starting deployment process...${NC}"
echo -e "${YELLOW}📝 Commit message: ${MESSAGE}${NC}"

# Check if required environment variables are set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${RED}❌ Error: CLOUDFLARE_API_TOKEN environment variable is required${NC}"
    exit 1
fi

if [ -z "$PROJECT_NAME" ]; then
    echo -e "${RED}❌ Error: PROJECT_NAME environment variable is required${NC}"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Build the project
echo -e "${YELLOW}🔨 Building Next.js project...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Deploy to Cloudflare Pages using wrangler
echo -e "${YELLOW}🌐 Deploying to Cloudflare Pages...${NC}"

# Get commit SHA from GitHub Actions environment or generate one
COMMIT_SHA=${GITHUB_SHA:-$(date +%s)}

npx wrangler pages deploy out \
  --project-name="$PROJECT_NAME" \
  --branch=main \
  --commit-message="$MESSAGE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}🎉 Your site has been updated${NC}"
    echo -e "${GREEN}📝 Message: ${MESSAGE}${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi