# Mantener esta imagen alineada con la versión de playwright en package.json.
FROM mcr.microsoft.com/playwright:v1.49.1-noble
WORKDIR /app
ENV NODE_ENV=production
# La imagen oficial ya incluye los navegadores compatibles.
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src
EXPOSE 3000
CMD ["npm", "start"]
