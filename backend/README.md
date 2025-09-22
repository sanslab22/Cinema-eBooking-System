# Backend Setup

1. Start PostgreSQL and pgAdmin
```npm run docker:up```

2. Check if containers are running**
```docker ps```

3. Generate Prisma client
```npm run db:generate```

4. Push the schema to the database (for development)
```npm run db:push```

   Or use migrations (recommended for production)
```npm run db:migrate```

6. Seed the database with sample data
```npm run db:seed```

# Helpful Commands

## Database operations
```npx prisma studio```                     # Open database GUI
```npx prisma migrate dev --name init```    # Create and apply migration
```npx prisma db seed```                    # Run seed script
```npx prisma generate```                   # Regenerate Prisma client

## Docker operations
```docker-compose up -d```               # Start services in background
```docker-compose down```                # Stop and remove containers
```docker-compose logs -f postgres```    # View PostgreSQL logs
```docker-compose exec postgres psql -U cinema-e-booking -d cinema-e-booking```  # Connect to DB
