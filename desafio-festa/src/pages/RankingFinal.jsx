import React from 'react';
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function RankingFinal() {
  const [ranking, setRanking] = useState([])

  useEffect(() => {
    const partidaId = localStorage.getItem('partidaId')

    const carregarRanking = async () => {
      const { data: jogadores, error } = await supabase
        .from('jogadores')
        .select(`
          id,
          nome,
          jogador_desafios (
            aceito,
            validado,
            desafios ( pontos )
          )
        `)
        .eq('partida_id', partidaId)

      if (error) {
        console.error('Erro ao carregar ranking:', error)
        return
      }

      const rankingCalculado = jogadores.map((jogador) => {
        const pontos = jogador.jogador_desafios.reduce((total, jd) => {
          if (jd.aceito && jd.validado && jd.desafios?.pontos) {
            return total + jd.desafios.pontos
          }
          return total
        }, 0)

        return { nome: jogador.nome, pontos }
      })

      const ordenado = rankingCalculado.sort((a, b) => b.pontos - a.pontos)
      setRanking(ordenado)
    }

    carregarRanking()
  }, [])

  const medalha = (i) => {
    if (i === 0) return '🥇'
    if (i === 1) return '🥈'
    if (i === 2) return '🥉'
    return `${i + 1}º`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3D0262] via-[#4A176A] to-[#5C2E7C] p-6 text-white">
      <div className="max-w-xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-6">Ranking Final ✅</h1>
        <p className="mb-4">Pontuações com base nos desafios validados pelos jogadores.</p>

        <div className="flex flex-col gap-4 mt-6">
          {ranking.map((jogador, i) => (
            <div
              key={i}
              className={`flex justify-between items-center px-4 py-3 rounded-xl shadow ${
                i === 0 ? 'border-yellow-400 border-2' : 'bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{medalha(i)}</span>
                <span className="font-semibold">{jogador.nome}</span>
              </div>
              <span className="text-yellow-300 font-bold">{jogador.pontos} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
