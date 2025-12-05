import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ConversaService from './services/ConversaService';
import MensagemIA from './components/MensagemIA';

function App() {
  const [conversaId, setConversaId] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [input, setInput] = useState('');
  const [carregando, setCarregando] = useState(false);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  const rolarParaFim = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    rolarParaFim();
  }, [mensagens]);

  const iniciarConversa = async () => {
    try {
      setCarregando(true);
      const conversa = await ConversaService.criarConversa();
      setConversaId(conversa.id);
      setMensagens([]);
    } catch (erro) {
      console.error('Erro ao criar conversa:', erro);
      alert('Erro ao iniciar conversa');
    } finally {
      setCarregando(false);
    }
  };

  const conectarWebsocket = (id) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const wsUrl = apiUrl.replace(/^http/, 'ws').replace(/^https/, 'wss');
    const url = `${wsUrl}/ws/conversa/${id}`;
    
    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => {
      console.log('WebSocket conectado');
    };

    wsRef.current.onmessage = (evento) => {
      try {
        const dados = JSON.parse(evento.data);

        if (dados.tipo === 'resposta_ia') {
          setMensagens(prev => {
            const novasMensagens = [...prev];
            const ultimaMensagem = novasMensagens[novasMensagens.length - 1];
            if (ultimaMensagem?.remetente === 'ia') {
              novasMensagens[novasMensagens.length - 1] = {
                ...ultimaMensagem,
                conteudo: ultimaMensagem.conteudo + dados.conteudo
              };
            }
            return novasMensagens;
          });
        } else if (dados.tipo === 'fim_resposta') {
          setCarregando(false);
        } else if (dados.tipo === 'erro') {
          alert('Erro: ' + dados.mensagem);
          setCarregando(false);
        }
      } catch (erro) {
        console.error('Erro ao processar mensagem:', erro);
        setCarregando(false);
      }
    };

    wsRef.current.onerror = (erro) => {
      console.error('Erro WebSocket:', erro);
      alert('Erro na conexão WebSocket');
      setCarregando(false);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket desconectado');
    };
  };

  const enviarMensagem = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const mensagemUsuario = input.trim();

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      conectarWebsocket(conversaId);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setMensagens(prev => [...prev, 
      {
        id: Date.now().toString(),
        conteudo: mensagemUsuario,
        remetente: 'usuario',
        timestamp: new Date().toISOString()
      },
      {
        id: (Date.now() + 1).toString(),
        conteudo: '',
        remetente: 'ia',
        timestamp: new Date().toISOString()
      }
    ]);

    setCarregando(true);
    setInput('');

    wsRef.current.send(JSON.stringify({ conteudo: mensagemUsuario }));
  };

  if (!conversaId) {
    return (
      <div className="container-inicial">
        <div className="caixa-inicial">
          <h1>ChatterBox</h1>
          <p>Inicie uma conversa com IA</p>
          <button onClick={iniciarConversa} disabled={carregando} className="botao-primario">
            {carregando ? 'Iniciando...' : 'Iniciar Conversa'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-conversa">
      <div className="cabecalho">
        <h1>ChatterBox</h1>
        <button onClick={iniciarConversa} className="botao-novo">Nova Conversa</button>
      </div>

      <div className="area-mensagens">
        {mensagens.length === 0 ? (
          <div className="mensagem-inicial">
            <p>Comece a conversa...</p>
          </div>
        ) : (
          mensagens.map(msg => (
            <div
              key={msg.id}
              className={`mensagem ${msg.remetente === 'usuario' ? 'usuario' : 'ia'}`}
            >
              <div className="conteudo-mensagem">
                {msg.remetente === 'usuario' ? (
                  msg.conteudo
                ) : (
                  <MensagemIA conteudo={msg.conteudo} carregando={carregando && !msg.conteudo} />
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={enviarMensagem} className="area-entrada">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={carregando}
          className="entrada-texto"
        />
        <button type="submit" disabled={carregando} className="botao-enviar">
          {carregando ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}

export default App;
