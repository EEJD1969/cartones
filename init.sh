cd /opt/cartones

# 1) Inicializar git y conectar con GitHub
git init
git remote add origin https://github.com/TU_USUARIO/cartones.git

# 2) Crear estructura base
mkdir -p backend/src
mkdir -p frontend/src
mkdir -p frontend/public
mkdir -p nginx

# 3) Crear .gitignore
cat > .gitignore <<'EOF'
node_modules
dist
.env
*.log
.DS_Store
EOF

# 4) Crear docker-compose.yml
cat > docker-compose.yml <<'EOF'
services:
  cartones-backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: cartones-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3000
    ports:
      - "3010:3000"
    networks:
      - cartones-net

  cartones-frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: cartones-frontend
    restart: unless-stopped
    depends_on:
      - cartones-backend
    ports:
      - "8088:80"
    networks:
      - cartones-net

networks:
  cartones-net:
    driver: bridge
EOF

# 5) Crear README mínimo
cat > README.md <<'EOF'
# Cartones

Aplicación web para generar cartones de bingo musical en PDF.

- Frontend: React/Vite
- Backend: Node/Express + Playwright
- Deploy: Docker Compose
EOF

# 6) Primer commit
git add .
git commit -m "Inicializa estructura base del proyecto cartones"

# 7) Subir al repo
git branch -M main
git push -u origin main