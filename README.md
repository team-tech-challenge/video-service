# Video Service

## 📌 Descrição do Projeto
O **video-service** é um microserviço responsável pelo gerenciamento de vídeos e extração de frames. Ele recebe vídeos, processa a extração de frames, salva os arquivos no **AWS S3**,  e interage com o microserviço de usuário.

## 🚀 Funcionalidades
- Upload de um ou mais vídeos
- Extração de frames de um vídeo
- Armazenamento dos vídeos e frames no **AWS S3**
- Comunicação com o microserviço **user-service** para enviar comunicação ao usuário
- Download de frames processados em um arquivo **ZIP**

---
## 🏗️ Estrutura do Projeto
```
video-service
│── docker
│   └── Dockerfile_node
│── node_modules
│── src
│   ├── application
│   │   ├── adapters  # Adapters que interagem com gateways
│   │   ├── controllers  # Controladores das rotas
│   │   ├── usecases  # Casos de uso do sistema
│   │   ├── utils  # Funções auxiliares
│   ├── domain
│   │   ├── entities  # Entidades principais do domínio
│   │   │   ├── frame.ts
│   │   │   ├── video.ts
│   ├── infrastructure
│   │   ├── config  # Configurações gerais
│   │   ├── external  # Comunicação com serviços externos (AWS S3, MediaConvert, user-service)
│   │   ├── mappers  # Mapeamento entre entidades e models
│   │   ├── routes  # Definição das rotas da API
│   ├── interfaces  # Gateways para interação entre camadas
│   ├── types  # Definições de tipos para o TypeScript
│── .env  # Configuração de variáveis de ambiente
│── docker-compose.yml  # Configuração do Docker
│── package.json  # Dependências do projeto
│── README.md  # Documentação do projeto
```

---
## ⚙️ Tecnologias Utilizadas
- **Node.js** (TypeScript)
- **Express.js** (Framework para API)
- **Sequelize** (ORM para PostgreSQL)
- **AWS S3** (Armazenamento de vídeos e frames)
- **AWS MediaConvert** (Processamento e extração de frames)
- **Multer** (Upload de arquivos)
- **Archiver** (Criação de arquivos ZIP para download de frames)
- **Docker** (Contêinerização do serviço)

---
## 🛠️ Configuração e Execução

### 📌 **Pré-requisitos**
Antes de rodar o projeto, garanta que você tenha instalado:
- **Docker** e **Docker Compose**
- **Node.js** (versão LTS recomendada)
- **AWS CLI** configurado (para serviços AWS)

### 🚀 **Passo 1: Configuração do .env**
Crie um arquivo **.env** na raiz do projeto e adicione:
```
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-west-2
AWS_S3_BUCKET=fiap-video-frame
AWS_MEDIACONVERT_ROLE=arn:aws:iam::XXXXXXXXXX:role/MediaConvertExecutionRole
AWS_MEDIACONVERT_ENDPOINT=https://xxxx.mediaconvert.us-west-2.amazonaws.com
DATABASE_URL=postgres://user:password@postgres-db:5432/fiap-video-frame
APP_URL=http://localhost:3000
```

### 🚀 **Passo 2: Subir o serviço com Docker**
```sh
docker-compose up --build
```
Isso iniciará o serviço junto com o banco de dados PostgreSQL.

### 🚀 **Passo 3: Rodar localmente (sem Docker)**
Caso queira rodar manualmente sem Docker:
```sh
npm install
npm run dev
```

---
## 📌 **Principais Endpoints**

### 📤 **Upload de Vídeo**
```http
POST /videos/upload
```
**Body (multipart/form-data):**
```json
{
  "files": [video1.mp4, video2.mp4]
}
```

### 🎥 **Extrair Frames de um Vídeo**
```http
POST /frames/extract
```
**Body:**
```json
{
  "videoIds": [1, 2]
}
```

### 📥 **Download dos Frames como ZIP**
```http
GET /frames/download/:videoId
```

### 📋 **Buscar Todos os Vídeos**
```http
GET /videos
```

### 🔍 **Buscar Frames por VideoId**
```http
GET /frames/video/:videoId
```

---
## 📩 Contato
Caso tenha dúvidas ou sugestões, entre em contato pelo repositório!

---
### 🚀 **Desenvolvido para o Tech Challenge FIAP**

