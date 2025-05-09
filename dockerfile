FROM node:18-alpine

# Instalar dependencias necesarias para Chromium
RUN apk add --no-cache \
    udev \
    chromium \
    nss \
    freetype \
    fontconfig \
    ttf-freefont

# Establecer variables de entorno para Puppeteer
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV CHROME_PATH=/usr/bin/chromium-browser

# Crear un directorio de trabajo
WORKDIR /usr/src/app

# Crear un grupo y un usuario no root llamado afip
RUN addgroup -S afipgroup && adduser -S afip -G afipgroup

# Copiar los archivos de configuración como root
COPY package.json package-lock.json ./

# Instalar las dependencias de Node.js como root
RUN npm install

# Cambiar la propiedad del directorio de trabajo
RUN chown -R afip:afipgroup /usr/src/app

# Cambiar al usuario afip
USER afip

# Copiar el resto de la aplicación y cambiar la propiedad
COPY --chown=afip:afipgroup . .

# Exponer el puerto
EXPOSE 3001

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
