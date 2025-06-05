FROM node:16

WORKDIR /app

# Copia package.json primero para cachear dependencias
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia TODO el código del backend
COPY . .

# Puerto que usa Express (3000)
EXPOSE 3000

# Variables de entorno (sin comentarios en la misma línea)
ENV DB_HOST=mysql-service
ENV DB_USER=juan
ENV DB_PASSWORD=1234
ENV DB_NAME=atalesdb
ENV GMAIL_USER=atalmendoza03@gmail.com
ENV GMAIL_APP_PASSWORD=apiGmail
ENV SECRET_KEY=secreto_super_seguro

# Comando para iniciar el servidor
CMD ["node", "server.js"]
