# Cloud Deployment Guide for StartingLine Auth System

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CDN/CloudFront│    │  Load Balancer   │    │   Database      │
│   (Frontend)    │────│  (Application)   │────│   (PostgreSQL)  │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                       ┌──────────────────┐
                       │  Backend API     │
                       │  (Node.js/Express)│
                       │  Multiple instances│
                       └──────────────────┘
```

## AWS Deployment

### 1. Database Layer (RDS PostgreSQL)

```yaml
# terraform/aws/database.tf
resource "aws_db_instance" "startingline_db" {
  identifier = "startingline-production"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"  # Start small, scale up
  
  allocated_storage     = 20
  max_allocated_storage = 100  # Auto-scaling
  storage_encrypted     = true
  
  db_name  = "startingline"
  username = "app_user"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "startingline-final-snapshot"
  
  tags = {
    Name = "StartingLine Production Database"
  }
}
```

### 2. Application Layer (ECS/Fargate)

```dockerfile
# Dockerfile for your backend
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# terraform/aws/ecs.tf
resource "aws_ecs_service" "startingline_backend" {
  name            = "startingline-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 2  # Multiple instances for availability
  
  launch_type = "FARGATE"
  
  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.backend.id]
    assign_public_ip = false
  }
  
  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "startingline-backend"
    container_port   = 3000
  }
}
```

### 3. Environment Configuration

```bash
# .env.production
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://app_user:${PASSWORD}@startingline-production.xxx.rds.amazonaws.com:5432/startingline

# JWT
JWT_SECRET=${JWT_SECRET_FROM_AWS_SECRETS}
JWT_EXPIRES_IN=7d

# AWS Services
AWS_REGION=us-west-2
S3_BUCKET=startingline-assets

# Monitoring
LOG_LEVEL=info
```

## GCP Deployment

### 1. Database Layer (Cloud SQL)

```yaml
# terraform/gcp/database.tf
resource "google_sql_database_instance" "startingline_db" {
  name             = "startingline-production"
  database_version = "POSTGRES_15"
  region          = "us-central1"
  
  settings {
    tier = "db-f1-micro"  # Start small
    
    backup_configuration {
      enabled                        = true
      start_time                    = "03:00"
      point_in_time_recovery_enabled = true
      backup_retention_settings {
        retained_backups = 7
      }
    }
    
    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.main.id
      require_ssl     = true
    }
    
    database_flags {
      name  = "log_connections"
      value = "on"
    }
  }
  
  deletion_protection = true
}
```

### 2. Application Layer (Cloud Run)

```yaml
# terraform/gcp/cloud-run.tf
resource "google_cloud_run_service" "startingline_backend" {
  name     = "startingline-backend"
  location = "us-central1"
  
  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/startingline-backend:latest"
        
        env {
          name  = "DATABASE_URL"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.db_url.secret_id
              key  = "latest"
            }
          }
        }
        
        resources {
          limits = {
            memory = "512Mi"
            cpu    = "1000m"
          }
        }
        
        ports {
          container_port = 3000
        }
      }
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "1"
        "autoscaling.knative.dev/maxScale" = "10"
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
}
```

## Database Migration Strategy

### 1. Data Export from Local

```bash
#!/bin/bash
# scripts/export-local-data.sh

# Export schema
pg_dump --schema-only --no-owner --no-privileges \
  postgresql://localhost:5432/startingline_local > schema.sql

# Export data
pg_dump --data-only --no-owner --no-privileges \
  --exclude-table=sessions \
  postgresql://localhost:5432/startingline_local > data.sql

# Create sanitized version for production
sed 's/localhost/production-host/g' schema.sql > schema-production.sql
```

### 2. Cloud Database Setup

```sql
-- scripts/setup-production-db.sql

-- Create application user
CREATE USER app_user WITH PASSWORD 'secure-generated-password';

-- Create database
CREATE DATABASE startingline OWNER app_user;

-- Connect to new database
\c startingline

-- Apply schema
\i schema-production.sql

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO app_user;

-- Apply data (after sanitization)
\i data-sanitized.sql
```

## Security Best Practices

### 1. Database Security

```typescript
// src/lib/database.ts - Production database connection
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,           // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  
  // Security settings
  statement_timeout: 30000,  // Prevent long-running queries
  query_timeout: 30000,
})

// Connection health check
pool.on('error', (err) => {
  console.error('Database pool error:', err)
  process.exit(-1)
})

export default pool
```

### 2. Secrets Management

**AWS Secrets Manager:**
```typescript
// src/lib/secrets.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

const client = new SecretsManagerClient({ region: process.env.AWS_REGION })

export async function getSecret(secretId: string) {
  const command = new GetSecretValueCommand({ SecretId: secretId })
  const response = await client.send(command)
  return JSON.parse(response.SecretString!)
}

// Usage
const dbCredentials = await getSecret('startingline/database')
```

**GCP Secret Manager:**
```typescript
// src/lib/secrets.ts
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'

const client = new SecretManagerServiceClient()

export async function getSecret(name: string) {
  const [version] = await client.accessSecretVersion({
    name: `projects/${process.env.GCP_PROJECT}/secrets/${name}/versions/latest`
  })
  return version.payload?.data?.toString()
}
```

### 3. Enhanced Auth Configuration

```typescript
// src/config/auth.ts - Production auth config
export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: '7d',
    algorithm: 'HS256' as const,
    issuer: 'startingline-api',
    audience: 'startingline-web'
  },
  
  password: {
    saltRounds: 12,
    minLength: 8,
    requireSpecialChars: true
  },
  
  session: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // Limit each IP to 5 login attempts per windowMs
  }
}
```

## Deployment Workflow

### 1. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build
      
      - name: Deploy to AWS/GCP
        run: |
          # Build and push Docker image
          docker build -t startingline-backend .
          docker tag startingline-backend:latest $ECR_REGISTRY/startingline-backend:latest
          docker push $ECR_REGISTRY/startingline-backend:latest
          
          # Update ECS service
          aws ecs update-service --cluster production --service startingline-backend --force-new-deployment
```

### 2. Database Migrations

```typescript
// src/scripts/migrate.ts
import pool from '../lib/database'
import fs from 'fs'
import path from 'path'

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../migrations')
  const files = fs.readdirSync(migrationsDir).sort()
  
  for (const file of files) {
    const migration = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    
    try {
      await pool.query(migration)
      console.log(`✅ Applied migration: ${file}`)
    } catch (error) {
      console.error(`❌ Migration failed: ${file}`, error)
      process.exit(1)
    }
  }
}

if (require.main === module) {
  runMigrations().then(() => process.exit(0))
}
```

## Monitoring and Logging

### 1. Application Monitoring

```typescript
// src/middleware/monitoring.ts
import { Request, Response, NextFunction } from 'express'

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const log = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString()
    }
    
    console.log(JSON.stringify(log))
  })
  
  next()
}
```

### 2. Health Checks

```typescript
// src/routes/health.ts
import express from 'express'
import pool from '../lib/database'

const router = express.Router()

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1')
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected'
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Database connection failed'
    })
  }
})

export default router
```

## Cost Optimization

### AWS Cost Estimates (monthly):
- **RDS db.t3.micro**: ~$15-20
- **ECS Fargate (2 tasks)**: ~$30-40
- **ALB**: ~$20
- **CloudWatch**: ~$5-10
- **Total**: ~$70-90/month

### GCP Cost Estimates (monthly):
- **Cloud SQL db-f1-micro**: ~$10-15
- **Cloud Run (2 instances)**: ~$20-30
- **Load Balancer**: ~$20
- **Monitoring**: ~$5-10
- **Total**: ~$55-75/month

## Summary

Deploying your local PostgreSQL auth system to the cloud involves:

1. **Managed Database**: Use RDS (AWS) or Cloud SQL (GCP) for production reliability
2. **Containerized Application**: Deploy your Node.js backend using ECS/Fargate or Cloud Run
3. **Secure Configuration**: Use cloud secret management and proper security groups
4. **Migration Strategy**: Export local data and import to cloud database
5. **CI/CD Pipeline**: Automate deployments with proper testing
6. **Monitoring**: Implement health checks and logging

The key advantage is that your simplified auth system (without Supabase) will deploy cleanly to any cloud provider, giving you flexibility and avoiding vendor lock-in while maintaining the same authentication logic across environments.
