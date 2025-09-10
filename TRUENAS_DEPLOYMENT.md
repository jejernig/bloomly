# Bloomly.io - TrueNAS Deployment Guide

This guide provides step-by-step instructions for deploying Bloomly.io on TrueNAS using Docker containers.

## 📋 Prerequisites

### TrueNAS Requirements
- TrueNAS SCALE 22.12 or later (recommended) or TrueNAS CORE 13.0+
- Docker installed and configured
- At least 4GB RAM allocated for containers
- 20GB+ storage space for application and data
- Network access for external API calls (OpenAI, Instagram, Supabase)

### Required Services
- Supabase project (database, auth, storage)
- OpenAI API account
- Cloudinary account (for image optimization)
- Instagram Developer account (optional)

## 🏗️ TrueNAS Setup

### 1. Create Datasets

Create the following datasets on your TrueNAS system:

```bash
# Replace 'tank' with your pool name
sudo zfs create tank/bloomly-io
sudo zfs create tank/bloomly-io/uploads
sudo zfs create tank/bloomly-io/backups
sudo zfs create tank/bloomly-io/logs
sudo zfs create tank/bloomly-io/redis
sudo zfs create tank/bloomly-io/nginx
```

### 2. Set Permissions

```bash
# Application data (Node.js user: 1001)
sudo chown -R 1001:1001 /mnt/tank/bloomly-io/uploads
sudo chown -R 1001:1001 /mnt/tank/bloomly-io/backups
sudo chown -R 1001:1001 /mnt/tank/bloomly-io/logs

# Redis data (Redis user: 999)
sudo chown -R 999:999 /mnt/tank/bloomly-io/redis

# Nginx logs (Nginx user: 101)
sudo chown -R 101:101 /mnt/tank/bloomly-io/nginx
```

### 3. Enable Docker Service

Through TrueNAS web interface:
1. Go to **System → Services**
2. Find **Docker** and enable it
3. Configure Docker to start on boot

## 📦 Deployment Methods

### Method 1: Automated Script (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd bloomly-io
   ```

2. **Configure environment:**
   ```bash
   cp .env.production .env.local
   # Edit .env.local with your actual values
   nano .env.local
   ```

3. **Update deployment script:**
   Edit `deploy-truenas.sh` and update the `TRUENAS_POOL` variable:
   ```bash
   TRUENAS_POOL="tank"  # Change to your pool name
   ```

4. **Deploy:**
   ```bash
   ./deploy-truenas.sh deploy
   ```

### Method 2: Docker Compose

1. **Prepare environment:**
   ```bash
   cp .env.production .env.local
   # Configure your settings
   ```

2. **Update docker-compose.yml:**
   Edit volume paths to match your TrueNAS datasets:
   ```yaml
   volumes:
     - /mnt/tank/bloomly-io/uploads:/app/uploads
     - /mnt/tank/bloomly-io/backups:/app/backups
     # ... etc
   ```

3. **Deploy:**
   ```bash
   docker-compose up -d
   ```

### Method 3: Manual Docker CLI

1. **Create network:**
   ```bash
   docker network create --driver bridge --subnet 172.20.0.0/16 taylor-network
   ```

2. **Build image:**
   ```bash
   docker build -t bloomly-io:latest .
   ```

3. **Start Redis:**
   ```bash
   docker run -d \
     --name bloomly-io-redis \
     --network taylor-network \
     --restart unless-stopped \
     -p 6379:6379 \
     -v /mnt/tank/bloomly-io/redis:/data \
     redis:7-alpine redis-server --appendonly yes
   ```

4. **Start application:**
   ```bash
   docker run -d \
     --name bloomly-io-app \
     --network taylor-network \
     --restart unless-stopped \
     -p 3000:3000 \
     --env-file .env.local \
     -v /mnt/tank/bloomly-io/uploads:/app/uploads \
     -v /mnt/tank/bloomly-io/backups:/app/backups \
     -v /mnt/tank/bloomly-io/logs:/app/logs \
     bloomly-io:latest
   ```

5. **Start Nginx (optional):**
   ```bash
   docker run -d \
     --name bloomly-io-nginx \
     --network taylor-network \
     --restart unless-stopped \
     -p 80:80 \
     -p 443:443 \
     -v $(pwd)/nginx/nginx.conf:/etc/nginx/nginx.conf:ro \
     -v /mnt/tank/bloomly-io/nginx/ssl:/etc/nginx/ssl:ro \
     -v /mnt/tank/bloomly-io/nginx/logs:/var/log/nginx \
     nginx:alpine
   ```

## ⚙️ Configuration

### Environment Variables

Create `.env.local` from `.env.production` template and configure:

#### Essential Configuration
```bash
# Application
APP_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# OpenAI
OPENAI_API_KEY=your-openai-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### SSL Configuration

#### Option 1: Self-Signed Certificates (Development)
The deployment script automatically generates self-signed certificates.

#### Option 2: Let's Encrypt (Production)
```bash
# Install certbot on TrueNAS
sudo pkg install py39-certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy to SSL directory
sudo cp /usr/local/etc/letsencrypt/live/your-domain.com/fullchain.pem \
   /mnt/tank/bloomly-io/nginx/ssl/cert.pem
sudo cp /usr/local/etc/letsencrypt/live/your-domain.com/privkey.pem \
   /mnt/tank/bloomly-io/nginx/ssl/key.pem
```

#### Option 3: Custom Certificates
Place your certificates in `/mnt/tank/bloomly-io/nginx/ssl/`:
- `cert.pem` - Certificate file
- `key.pem` - Private key file

## 🔧 Management Commands

### Using Deployment Script

```bash
# Deploy/redeploy application
./deploy-truenas.sh deploy

# Start containers
./deploy-truenas.sh start

# Stop containers
./deploy-truenas.sh stop

# Restart containers
./deploy-truenas.sh restart

# View logs
./deploy-truenas.sh logs

# Check status
./deploy-truenas.sh status

# Clean up (removes everything)
./deploy-truenas.sh cleanup
```

### Direct Docker Commands

```bash
# View container status
docker ps

# View logs
docker logs -f bloomly-io-app
docker logs -f bloomly-io-redis
docker logs -f bloomly-io-nginx

# Restart containers
docker restart bloomly-io-app
docker restart bloomly-io-redis

# Update application
docker pull bloomly-io:latest
docker stop bloomly-io-app
docker rm bloomly-io-app
# Then run the start command again
```

## 📊 Monitoring & Maintenance

### Health Checks

- Application health: `http://localhost:3000/api/health`
- Redis: `docker exec bloomly-io-redis redis-cli ping`
- Container status: `docker ps`

### Log Locations

- Application logs: `/mnt/tank/bloomly-io/logs/`
- Nginx logs: `/mnt/tank/bloomly-io/nginx/logs/`
- Docker logs: `docker logs <container-name>`

### Backup Strategy

#### Application Data
```bash
# Backup uploads
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz /mnt/tank/bloomly-io/uploads/

# Backup application data
docker exec bloomly-io-app npm run backup
```

#### Database Backup
```bash
# Supabase projects have automated backups
# You can also create manual backups through the Supabase dashboard
```

### Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
./deploy-truenas.sh deploy
```

## 🔒 Security Considerations

### Network Security
- Configure TrueNAS firewall rules
- Use strong passwords for Redis
- Enable SSL/TLS for external access
- Consider VPN access for administration

### Container Security
- Containers run as non-root users
- Minimal base images (Alpine Linux)
- Regular updates of base images
- Environment variables for secrets

### Data Security
- Enable encryption at rest in TrueNAS
- Regular backups with encryption
- Secure API key management
- Monitor access logs

## 🚨 Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check logs
docker logs bloomly-io-app

# Common causes:
# - Missing environment variables
# - Permission issues on mounted volumes
# - Port conflicts
```

#### Database Connection Issues
```bash
# Verify Supabase credentials
# Check network connectivity
curl -I https://your-project.supabase.co

# Verify environment variables
docker exec bloomly-io-app env | grep SUPABASE
```

#### Performance Issues
```bash
# Check resource usage
docker stats

# Check TrueNAS system resources
top
zpool iostat

# Adjust container resource limits in docker-compose.yml
```

#### SSL Certificate Issues
```bash
# Check certificate files
ls -la /mnt/tank/bloomly-io/nginx/ssl/

# Verify certificate validity
openssl x509 -in /mnt/tank/bloomly-io/nginx/ssl/cert.pem -text -noout
```

### Log Analysis

```bash
# Application errors
docker logs bloomly-io-app | grep ERROR

# Nginx access logs
tail -f /mnt/tank/bloomly-io/nginx/logs/access.log

# Redis logs
docker logs bloomly-io-redis
```

## 📈 Scaling & Performance

### Resource Allocation
- **CPU**: 2+ cores recommended
- **RAM**: 4GB+ for application, 1GB for Redis
- **Storage**: SSD recommended for database/cache data
- **Network**: Gigabit ethernet for optimal performance

### Performance Tuning
- Enable Redis caching
- Configure Nginx caching
- Use SSD storage for datasets
- Monitor and adjust container resources

## 🔄 Backup & Recovery

### Automated Backups
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /mnt/tank/bloomly-io/backups/app-backup-$DATE.tar.gz \
  /mnt/tank/bloomly-io/uploads/

# Add to TrueNAS cron jobs
```

### Disaster Recovery
1. Ensure all data is backed up
2. Document configuration settings
3. Test restoration procedures
4. Keep external backups for critical data

---

## 📞 Support

For deployment issues or questions:
- Check TrueNAS community forums
- Review Docker documentation
- Consult application logs for specific errors

**Note**: This deployment guide assumes basic familiarity with TrueNAS, Docker, and command-line operations.