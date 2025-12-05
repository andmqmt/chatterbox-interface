# ChatterBox Interface

Interface web para ChatterBox construída com React e Vite.

## Requisitos

- Node.js 18 ou superior
- npm ou yarn

## Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd chatterbox-interface
```

2. Instale as dependências:
```bash
npm install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8000
```

**Variáveis de ambiente:**
- `VITE_API_URL`: URL da API backend (padrão: `http://localhost:8000`)

## Execução

### Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Build para Produção

```bash
npm run build
```

Os arquivos de produção estarão em `dist/`

### Preview da Build

```bash
npm run preview
```

## Estrutura do Projeto

```
chatterbox-interface/
├── src/
│   ├── components/       # Componentes React
│   │   └── MensagemIA.jsx
│   ├── services/         # Serviços HTTP
│   │   └── ConversaService.js
│   ├── utils/            # Utilitários
│   │   └── markdownParser.js
│   ├── App.jsx           # Componente principal
│   ├── App.css           # Estilos
│   └── main.jsx          # Ponto de entrada
├── package.json
├── vite.config.js
└── .env
```

## Funcionalidades

- Criar nova conversa
- Enviar mensagens via WebSocket
- Receber respostas da IA em tempo real (streaming)
- Renderização de Markdown nas respostas
- Interface responsiva e moderna
- Animação de loading

## Tecnologias

- React 18
- Vite
- Axios
- WebSocket API

