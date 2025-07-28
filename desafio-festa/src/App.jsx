import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Entrada from './pages/Entrada'
import Desafios from './pages/Desafios'
import Ranking from './pages/Ranking'
import ValidacaoListaJogadores from './pages/ValidacaoListaJogadores'
import ValidacaoJogador from './pages/ValidacaoJogador'
import Aguardando from './pages/Aguardando'
import RankingFinal from './pages/RankingFinal'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Entrada />} />
        <Route path="/desafios" element={<Desafios />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/validar" element={<ValidacaoListaJogadores />} />
        <Route path="/validar/:nome" element={<ValidacaoJogador />} />
        <Route path="/aguardando" element={<Aguardando />} />
        <Route path="/ranking-final" element={<RankingFinal />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
