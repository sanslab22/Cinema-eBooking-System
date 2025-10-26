# Backend Setup

1. Create a ```.env``` file in ```./backend``` and customize it.

2. Start PostgreSQL and pgAdmin
```npm run docker:up```

3. Check if containers are running
```docker ps```

4. Generate Prisma client
```npm run db:generate```

5. Push the schema to the database (for development)
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

## Run latest changes when running through container
1. ```docker-compose build app```
2. ```docker-compose down```
3. ```docker-compose up -d```

To have real time logs:
```docker logs -f backend-app-1``


## Seed docker
1. ```docker-compose exec app npx prisma migrate dev```
2. ```docker-compose exec app npm run db:seed```