# Deployment Guide

## Production Deployment

### 1. Server Requirements
- Node.js 16+ 
- MySQL 8.0+
- Nginx (recommended)
- SSL Certificate
- Domain name

### 2. Environment Setup

```bash
# Clone repository
git clone <repository-url>
cd custom-product-ecommerce

# Install dependencies
npm run setup

# Configure environment
cp .env.example .env
# Edit .env with production values:
NODE_ENV=production
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=custom_ecommerce
PORT=5000
JWT_SECRET=your-super-secure-jwt-secret
```

### 3. Database Setup

```sql
-- Create production database
CREATE DATABASE custom_ecommerce;
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON custom_ecommerce.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;

-- Import schema
mysql -u ecommerce_user -p custom_ecommerce < database/schema.sql
```

### 4. Build Application

```bash
# Build React frontend
npm run build

# Test production build locally
NODE_ENV=production npm start
```

### 5. Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Serve static files
    location /uploads/ {
        alias /path/to/app/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Serve React app
    location / {
        root /path/to/app/client/build;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public";
    }
}
```

### 6. Process Management (PM2)

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'custom-ecommerce',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 7. Security Checklist

- [ ] Use HTTPS with valid SSL certificate
- [ ] Set strong database passwords
- [ ] Configure firewall (only allow 22, 80, 443)
- [ ] Regular security updates
- [ ] Backup database regularly
- [ ] Monitor application logs
- [ ] Set up rate limiting
- [ ] Validate all user inputs
- [ ] Use environment variables for secrets

### 8. Monitoring & Maintenance

```bash
# Monitor PM2 processes
pm2 monit

# View logs
pm2 logs custom-ecommerce

# Restart application
pm2 restart custom-ecommerce

# Database backup
mysqldump -u ecommerce_user -p custom_ecommerce > backup_$(date +%Y%m%d).sql

# Update application
git pull origin main
npm install
npm run build
pm2 restart custom-ecommerce
```

### 9. Performance Optimization

- Enable gzip compression in Nginx
- Use CDN for static assets
- Implement Redis for session storage
- Database query optimization
- Image compression for uploads
- Enable browser caching

### 10. Troubleshooting

**Common Issues:**

1. **Database Connection Failed**
   - Check MySQL service status
   - Verify credentials in .env
   - Check firewall settings

2. **File Upload Not Working**
   - Check uploads directory permissions
   - Verify Nginx client_max_body_size
   - Check disk space

3. **API Endpoints Not Responding**
   - Check PM2 process status
   - Review application logs
   - Verify Nginx proxy configuration

**Useful Commands:**
```bash
# Check application status
pm2 status

# Check database connection
mysql -u ecommerce_user -p -e "SELECT 1"

# Check disk space
df -h

# Check memory usage
free -h

# Check Nginx configuration
nginx -t
```