import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ConversaService from './services/ConversaService';
import MensagemIA from './components/MensagemIA';
import Sugestoes from './components/Sugestoes';
import { teorias } from './utils/teorias';

function App() {
  const [conversaId, setConversaId] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [input, setInput] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [teoriaAtual, setTeoriaAtual] = useState(null);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  const rolarParaFim = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    rolarParaFim();
  }, [mensagens]);

  const iniciarConversa = async (teoria = null) => {
    try {
      setCarregando(true);
      const conversa = await ConversaService.criarConversa(teoria);
      console.log('Conversa criada:', conversa);
      setConversaId(conversa.id);
      setMensagens([]);
      const teoriaFinal = conversa.teoria || teoria;
      console.log('Teoria definida:', teoriaFinal);
      setTeoriaAtual(teoriaFinal);
      setMostrarSugestoes(false);
    } catch (erro) {
      console.error('Erro ao criar conversa:', erro);
      alert('Erro ao iniciar conversa');
    } finally {
      setCarregando(false);
    }
  };

  const selecionarTeoria = async (pergunta) => {
    const teoriaObj = teorias.find(t => t.pergunta === pergunta);
    if (teoriaObj) {
      const teoriaTexto = `Convencer o usuário que ${teoriaObj.descricao.toLowerCase()}.`;
      console.log('Teoria selecionada:', teoriaTexto);
      await iniciarConversa(teoriaTexto);
      setTimeout(() => {
        setInput(pergunta);
      }, 100);
    } else {
      setInput(pergunta);
      setMostrarSugestoes(false);
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

    const payload = { conteudo: mensagemUsuario };
    if (teoriaAtual && teoriaAtual.trim()) {
      payload.teoria = teoriaAtual.trim();
    }
    console.log('Enviando mensagem com teoria:', payload);
    wsRef.current.send(JSON.stringify(payload));
  };

  if (!conversaId) {
    return (
      <div className="container-inicial">
        {!mostrarSugestoes ? (
          <div className="caixa-inicial">
            <h1>ChatterBox</h1>
            <p>Explore teorias bizarras e debata com IA</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <button 
                onClick={() => setMostrarSugestoes(true)} 
                className="botao-primario"
                style={{ width: '100%' }}
              >
                Ver Teorias
              </button>
              <button 
                onClick={() => iniciarConversa('Convencer o usuário que a terra é plana.')} 
                disabled={carregando} 
                className="botao-primario botao-secundario"
                style={{ width: '100%' }}
              >
                {carregando ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" strokeDasharray="43.98" strokeDashoffset="10" strokeLinecap="round"/>
                    </svg>
                    Iniciando...
                  </span>
                ) : (
                  'Iniciar Conversa Livre'
                )}
              </button>
            </div>
          </div>
        ) : (
          <Sugestoes 
            onSelecionarTeoria={selecionarTeoria}
            mostrar={mostrarSugestoes}
          />
        )}
      </div>
    );
  }

  return (
    <div className="container-conversa">
      <div className="cabecalho">
        <h1>ChatterBox</h1>
        <button onClick={iniciarConversa} className="botao-novo">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Nova Conversa
        </button>
      </div>

      <div className="area-mensagens">
        {mensagens.length === 0 ? (
          <div className="mensagem-inicial">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.5 }}>
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>Comece a conversa...</p>
              {teoriaAtual && (
                <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginTop: '8px' }}>
                  Teoria: {teoriaAtual}
                </p>
              )}
            </div>
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
        <button type="submit" disabled={carregando || !input.trim()} className="botao-enviar">
          {carregando ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" strokeDasharray="43.98" strokeDashoffset="10" strokeLinecap="round"/>
              </svg>
              Enviando...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8L14 2L10 8L14 14L2 8Z" fill="currentColor"/>
              </svg>
              Enviar
            </span>
          )}
        </button>
      </form>
    </div>
  );
}

export default App;
