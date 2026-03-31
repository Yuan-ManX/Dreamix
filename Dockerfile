# ==========================================
# Action - Unified Dockerfile (Multi-stage Build)
# ==========================================

# ------------------------------
# Stage 1: Build Frontend
# ------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source code
COPY frontend/ .

# Build Next.js application
RUN npm run build

# ------------------------------
# Stage 2: Backend Base
# ------------------------------
FROM python:3.9-slim AS backend-base

WORKDIR /app

# Install system dependencies (FFmpeg for video processing)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# ------------------------------
# Stage 3: Final Backend Image
# ------------------------------
FROM backend-base AS backend

WORKDIR /app

# Copy backend source code
COPY backend/ .

# Copy built frontend static files (optional - for serving from backend)
# COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend
# COPY --from=frontend-builder /app/frontend/public ./frontend/public
# COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static

# Create necessary directories
RUN mkdir -p /app/storage/media /app/storage/output

# Expose backend port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run backend
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# ------------------------------
# Stage 4: Final Frontend Image
# ------------------------------
FROM node:20-alpine AS frontend

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy built files from frontend-builder
COPY --from=frontend-builder /app/frontend/public ./public
COPY --from=frontend-builder /app/frontend/.next/standalone ./
COPY --from=frontend-builder /app/frontend/.next/static ./.next/static

# Expose frontend port
EXPOSE 3000

# Start Next.js server
CMD ["node", ".next/standalone/server.js"]

# ------------------------------
# Default target (backend)
# ------------------------------
FROM backend
