import React from 'react';
import { teorias } from '../utils/teorias';
import './Sugestoes.css';

function Sugestoes({ onSelecionarTeoria, mostrar }) {
  if (!mostrar) return null;

  return (
    <div className="sugestoes-container">
      <div className="sugestoes-header">
        <h3>Teorias para Explorar</h3>
        <p>Escolha uma teoria bizarra para debater</p>
      </div>
      <div className="sugestoes-grid">
        {teorias.map(teoria => (
          <button
            key={teoria.id}
            className="sugestao-card"
            onClick={() => onSelecionarTeoria(teoria.pergunta)}
          >
            <div className="sugestao-titulo">{teoria.titulo}</div>
            <div className="sugestao-descricao">{teoria.descricao}</div>
            <div className="sugestao-pergunta">{teoria.pergunta}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Sugestoes;

