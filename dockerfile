FROM node:20-alpine

# Dependencias necesarias para Puppeteer + Canvas
RUN apk add --no-cache \
  udev \
  chromium \
  nss \
  freetype \
  fontconfig \
  ttf-freefont \
  python3 \
  make \
  g++ \
  libc6-compat \
  cairo-dev \
  pango-dev \
  jpeg-dev \
  giflib-dev \
  pixman-dev \
  build-base

# Variables para Puppeteer
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV CHROME_PATH=/usr/bin/chromium-browser

WORKDIR /usr/src/app

# Crear usuario no root
RUN addgroup -S afipgroup && adduser -S afip -G afipgroup

COPY package*.json ./
RUN npm install

# Asignar permisos y copiar resto del código
RUN chown -R afip:afipgroup /usr/src/app
USER afip
COPY --chown=afip:afipgroup . .

EXPOSE 3001

CMD ["node", "server.js"]
