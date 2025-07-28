import React from 'react';
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ValidacaoListaJogadores() {
  const navigate = useNavigate()
 const [jogadores, setJogadores] = useState([])
  const [validados, setValidados] = useState([])
  const [podeFinalizar, setPodeFinalizar] = useState(false)

  const nome = localStorage.getItem('nome') || ''
  const partidaId = localStorage.getItem('partidaId')

  useEffect(() => {
    const fetchJogadores = async () => {
      if (!partidaId) return

      const { data, error } = await supabase
        .from('jogadores')
        .select('nome')
        .eq('partida_id', partidaId)

      if (error) {
        console.error('Erro ao buscar jogadores:', error)
        return
      }

      const nomes = (data || [])
        .map(j => j.nome)
        .filter(n => n.toLowerCase() !== nome.toLowerCase())

      setJogadores(nomes)
    }

    const validadosSalvos = JSON.parse(localStorage.getItem('validados') || '[]')
    setValidados(validadosSalvos)

    fetchJogadores()
  }, [partidaId, nome])

  useEffect(() => {
    const todosValidados = jogadores.every(j => validados.includes(j.toLowerCase()))
    setPodeFinalizar(todosValidados)
  }, [validados, jogadores])

  const foiValidado = (jogadorNome) =>
    validados.includes(jogadorNome.toLowerCase())

  const irParaValidacao = (jogadorNome) => {
    navigate(`/validar/${jogadorNome.toLowerCase()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3D0262] via-[#4A176A] to-[#5C2E7C] p-6 text-white">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Validação Final ✅</h1>
        <p className="text-center mb-4">Clique em um jogador para validar os desafios que ele realizou.</p>

        <div className="flex flex-col gap-4 mb-10">
          {jogadores.map((nome, idx) => {
            const validado = foiValidado(nome)

            return (
              <button
                key={idx}
                onClick={() => irParaValidacao(nome)}
                disabled={validado}
                className={`flex justify-between items-center px-6 py-3 rounded-xl shadow ${
                  validado
                    ? 'bg-white/10 text-gray-400 cursor-not-allowed'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                } transition-all`}
              >
                <span className="text-lg capitalize">{nome}</span>
                {validado && <span className="text-green-400 text-sm">✔ Validado</span>}
              </button>
            )
          })}
        </div>

        {podeFinalizar && (
          <div className="text-center">
            <button
              onClick={() => navigate('/ranking-final')}
              className="bg-yellow-400 text-purple-900 font-bold py-2 px-6 rounded-lg hover:bg-yellow-300 transition-all"
            >
              Ver Ranking Final ✅
            </button>
          </div>
        )}
      </div>
    </div>
  )
}