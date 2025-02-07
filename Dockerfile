# Stage 1: Build
FROM node:19-alpine as build

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependência primeiro para utilizar caching
COPY . .

COPY package.json .

# Instala as dependências
RUN npm install && npm run swagger

RUN apt-get install -y ffmpeg

# Stage 2: Run
FROM node:19-alpine as runtime

# Cria um usuário não-root
RUN adduser -D tech
USER tech

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas os artefatos necessários do estágio de build
COPY --from=build /app /app

RUN mkdir -p /app/temp && chmod -R 777 /app/temp

# Expõe a porta em que sua aplicação rodará
EXPOSE 3000

# Comando para iniciar o servidor Node.js
ENTRYPOINT ["npm"]
CMD ["start"]
