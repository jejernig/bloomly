#!/bin/bash

# Bloomly.io - TrueNAS Deployment Script
# This script automates the deployment of Bloomly.io to TrueNAS using Docker CLI

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="bloomly-io"
IMAGE_NAME="bloomly-io"
CONTAINER_NAME="bloomly-io-app"
REDIS_CONTAINER="bloomly-io-redis"
NGINX_CONTAINER="bloomly-io-nginx"
NETWORK_NAME="bloomly-network"

# TrueNAS dataset paths (adjust these to match your TrueNAS setup)
TRUENAS_POOL="tank"  # Change to your pool name
DATASET_PATH="/mnt/${TRUENAS_POOL}/${APP_NAME}"
UPLOAD_PATH="${DATASET_PATH}/uploads"
BACKUP_PATH="${DATASET_PATH}/backups"
LOG_PATH="${DATASET_PATH}/logs"
REDIS_DATA_PATH="${DATASET_PATH}/redis"
NGINX_LOG_PATH="${DATASET_PATH}/nginx/logs"
SSL_CERT_PATH="${DATASET_PATH}/nginx/ssl"

print_header() {
    echo -e "${BLUE}===============================================${NC}"
    echo -e "${BLUE}    Bloomly.io - TrueNAS Deployment${NC}"
    echo -e "${BLUE}===============================================${NC}"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    print_info "Checking requirements..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_warning "Docker Compose not found, using docker compose"
    fi
    
    print_success "Requirements check passed"
}

create_datasets() {
    print_info "Creating TrueNAS datasets and directories..."
    
    # Create main dataset directories
    sudo mkdir -p "$UPLOAD_PATH"
    sudo mkdir -p "$BACKUP_PATH"
    sudo mkdir -p "$LOG_PATH"
    sudo mkdir -p "$REDIS_DATA_PATH"
    sudo mkdir -p "$NGINX_LOG_PATH"
    sudo mkdir -p "$SSL_CERT_PATH"
    
    # Set appropriate permissions
    sudo chown -R 1001:1001 "$UPLOAD_PATH"
    sudo chown -R 1001:1001 "$BACKUP_PATH"
    sudo chown -R 1001:1001 "$LOG_PATH"
    sudo chown -R 999:999 "$REDIS_DATA_PATH"  # Redis user
    sudo chown -R 101:101 "$NGINX_LOG_PATH"   # Nginx user
    
    print_success "Datasets created successfully"
}

setup_ssl() {
    print_info "Setting up SSL certificates..."
    
    if [ ! -f "${SSL_CERT_PATH}/cert.pem" ] || [ ! -f "${SSL_CERT_PATH}/key.pem" ]; then
        print_warning "SSL certificates not found, generating self-signed certificates..."
        
        # Generate self-signed certificate
        sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "${SSL_CERT_PATH}/key.pem" \
            -out "${SSL_CERT_PATH}/cert.pem" \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=bloomly-io.local"
        
        sudo chown 101:101 "${SSL_CERT_PATH}"/*.pem
        print_success "Self-signed SSL certificates generated"
    else
        print_success "SSL certificates found"
    fi
}

create_network() {
    print_info "Creating Docker network..."
    
    if ! docker network ls | grep -q "$NETWORK_NAME"; then
        docker network create \
            --driver bridge \
            --subnet 172.20.0.0/16 \
            "$NETWORK_NAME"
        print_success "Docker network created"
    else
        print_info "Docker network already exists"
    fi
}

build_image() {
    print_info "Building Docker image..."
    
    docker build -t "$IMAGE_NAME:latest" .
    
    print_success "Docker image built successfully"
}

stop_containers() {
    print_info "Stopping existing containers..."
    
    docker stop "$CONTAINER_NAME" 2>/dev/null || true
    docker stop "$REDIS_CONTAINER" 2>/dev/null || true
    docker stop "$NGINX_CONTAINER" 2>/dev/null || true
    
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
    docker rm "$REDIS_CONTAINER" 2>/dev/null || true
    docker rm "$NGINX_CONTAINER" 2>/dev/null || true
    
    print_success "Existing containers stopped and removed"
}

start_redis() {
    print_info "Starting Redis container..."
    
    docker run -d \
        --name "$REDIS_CONTAINER" \
        --network "$NETWORK_NAME" \
        --restart unless-stopped \
        -p 6379:6379 \
        -v "${REDIS_DATA_PATH}:/data" \
        redis:7-alpine \
        redis-server --appendonly yes --requirepass "${REDIS_PASSWORD:-defaultpassword}"
    
    print_success "Redis container started"
}

start_app() {
    print_info "Starting application container..."
    
    # Load environment variables
    if [ -f ".env.local" ]; then
        export $(cat .env.local | grep -v '^#' | xargs)
    else
        print_warning ".env.local not found, using defaults"
    fi
    
    docker run -d \
        --name "$CONTAINER_NAME" \
        --network "$NETWORK_NAME" \
        --restart unless-stopped \
        -p 3000:3000 \
        --env-file .env.local \
        -v "${UPLOAD_PATH}:/app/uploads" \
        -v "${BACKUP_PATH}:/app/backups" \
        -v "${LOG_PATH}:/app/logs" \
        "$IMAGE_NAME:latest"
    
    print_success "Application container started"
}

start_nginx() {
    print_info "Starting Nginx container..."
    
    docker run -d \
        --name "$NGINX_CONTAINER" \
        --network "$NETWORK_NAME" \
        --restart unless-stopped \
        -p 80:80 \
        -p 443:443 \
        -v "$(pwd)/nginx/nginx.conf:/etc/nginx/nginx.conf:ro" \
        -v "${SSL_CERT_PATH}:/etc/nginx/ssl:ro" \
        -v "${NGINX_LOG_PATH}:/var/log/nginx" \
        nginx:alpine
    
    print_success "Nginx container started"
}

wait_for_health() {
    print_info "Waiting for application to be ready..."
    
    for i in {1..30}; do
        if curl -f http://localhost:3000/api/health &>/dev/null; then
            print_success "Application is healthy"
            return 0
        fi
        echo -n "."
        sleep 2
    done
    
    print_error "Application failed to start properly"
    return 1
}

show_status() {
    print_info "Deployment status:"
    echo
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo
    
    print_info "Application URLs:"
    echo -e "  HTTP:  ${GREEN}http://localhost${NC}"
    echo -e "  HTTPS: ${GREEN}https://localhost${NC}"
    echo -e "  API:   ${GREEN}http://localhost/api${NC}"
    echo
    
    print_info "Logs:"
    echo "  docker logs -f $CONTAINER_NAME"
    echo "  docker logs -f $REDIS_CONTAINER"
    echo "  docker logs -f $NGINX_CONTAINER"
}

cleanup() {
    print_info "Cleaning up..."
    stop_containers
    
    if docker network ls | grep -q "$NETWORK_NAME"; then
        docker network rm "$NETWORK_NAME"
    fi
    
    print_success "Cleanup completed"
}

# Main deployment function
deploy() {
    print_header
    
    check_requirements
    create_datasets
    setup_ssl
    create_network
    build_image
    stop_containers
    start_redis
    start_app
    start_nginx
    wait_for_health
    show_status
    
    print_success "Deployment completed successfully!"
}

# Command line options
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "stop")
        stop_containers
        ;;
    "start")
        start_redis
        start_app
        start_nginx
        ;;
    "restart")
        stop_containers
        start_redis
        start_app
        start_nginx
        ;;
    "logs")
        docker logs -f "$CONTAINER_NAME"
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        cleanup
        ;;
    "build")
        build_image
        ;;
    *)
        echo "Usage: $0 {deploy|stop|start|restart|logs|status|cleanup|build}"
        echo
        echo "Commands:"
        echo "  deploy  - Full deployment (default)"
        echo "  stop    - Stop all containers"
        echo "  start   - Start all containers"
        echo "  restart - Restart all containers"
        echo "  logs    - View application logs"
        echo "  status  - Show deployment status"
        echo "  cleanup - Remove all containers and network"
        echo "  build   - Build Docker image only"
        exit 1
        ;;
esac