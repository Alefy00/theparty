import React from 'react';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import logo from '../assets/logo1.png'

export default function Entrada() {
  const [nome, setNome] = useState('')
  const [codigoSala, setCodigoSala] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  const iniciarJogo = async () => {
    if (!nome.trim() || !codigoSala.trim()) return
    setCarregando(true)

    const codigo = codigoSala.trim().toUpperCase()
    let partidaId = null

    // Verifica se a sala já existe
    const { data: partidaExistente, error: erroBusca } = await supabase
      .from('partidas')
      .select('id')
      .eq('codigo', codigo)
      .single()

    if (erroBusca && erroBusca.code !== 'PGRST116') {
      alert('Erro ao verificar código da sala')
      console.error(erroBusca)
      setCarregando(false)
      return
    }

    // Se não existir, cria uma nova partida com esse código
    if (!partidaExistente) {
      const { data: novaPartida, error: erroCriacao } = await supabase
        .from('partidas')
        .insert([{ nome: 'Partida da Festa', codigo }])
        .select()
        .single()

      if (erroCriacao || !novaPartida) {
        alert('Erro ao criar nova sala')
        console.error(erroCriacao)
        setCarregando(false)
        return
      }

      partidaId = novaPartida.id
    } else {
      partidaId = partidaExistente.id
    }

    // Cria o jogador
    const { data: jogador, error: erroJogador } = await supabase
      .from('jogadores')
      .insert([{ nome: nome.trim(), partida_id: partidaId }])
      .select()
      .single()

    if (erroJogador || !jogador) {
      alert('Erro ao criar jogador')
      console.error(erroJogador)
      setCarregando(false)
      return
    }

    // Armazena localmente
    localStorage.setItem('partidaId', partidaId)
    localStorage.setItem('jogadorId', jogador.id)
    localStorage.setItem('nome', nome.trim())
    localStorage.setItem('codigoSala', codigo)

    navigate('/desafios')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3D0262] via-[#4A176A] to-[#5C2E7C] flex flex-col items-center justify-center px-4">
      <img src={logo} alt="Logo do Jogo" className="w-auto h-auto mb-6" />

      <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Que comecem os jogos 🎉</h1>
        <p className="text-white mb-2">Digite seu nome e o código da sala</p>

        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full px-4 py-2 rounded-lg outline-none border-none text-center text-lg mb-4"
          placeholder="Seu nome"
        />

        <input
          type="text"
          value={codigoSala}
          onChange={(e) => setCodigoSala(e.target.value.toUpperCase())}
          className="w-full px-4 py-2 rounded-lg outline-none border-none text-center text-lg mb-4"
          placeholder="Código da sala (ex: ABC123)"
        />

        <button
          onClick={iniciarJogo}
          disabled={carregando}
          className="bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold py-2 px-6 rounded-lg w-full transition-all disabled:opacity-50"
        >
          {carregando ? 'Entrando...' : 'Entrar na sala'}
        </button>
      </div>
    </div>
  )
}