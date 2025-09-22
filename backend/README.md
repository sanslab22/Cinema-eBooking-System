Backend Setup

# Start PostgreSQL and pgAdmin
npm run docker:up

# Check if containers are running
docker ps

# Generate Prisma client
npm run db:generate

# Push the schema to the database (for development)
npm run db:push

# Or use migrations (recommended for production)
npm run db:migrate

# Seed the database with sample data
npm run db:seed


# Database operations
npx prisma studio                # Open database GUI
npx prisma migrate dev --name init  # Create and apply migration
npx prisma db seed              # Run seed script
npx prisma generate             # Regenerate Prisma client

# Docker operations
docker-compose up -d            # Start services in background
docker-compose down             # Stop and remove containers
docker-compose logs -f postgres # View PostgreSQL logs
docker-compose exec postgres psql -U cinema_user -d cinema_booking  # Connect to DB