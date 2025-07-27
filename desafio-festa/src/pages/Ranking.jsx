import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Ranking() {
  const [ranking, setRanking] = useState([])
  const navigate = useNavigate()
  const partidaId = localStorage.getItem('partidaId')

  useEffect(() => {
    const fetchRanking = async () => {
      if (!partidaId) return

      // 1. Buscar todos os jogadores da partida
      const { data: jogadores, error: errJogadores } = await supabase
        .from('jogadores')
        .select('id, nome')
        .eq('partida_id', partidaId)

      if (errJogadores) {
        console.error('Erro ao buscar jogadores:', errJogadores)
        return
      }

      // 2. Buscar todos os desafios aceitos e com pontos
      const { data: desafiosAceitos, error: errDesafios } = await supabase
        .from('jogador_desafios')
        .select('jogador_id, aceito, desafio_id, desafios(pontos)')
        .eq('partida_id', partidaId)
        .eq('aceito', true)

      if (errDesafios) {
        console.error('Erro ao buscar desafios aceitos:', errDesafios)
        return
      }

      // 3. Somar pontos por jogador
      const pontuacoes = jogadores.map((jogador) => {
        const desafiosDoJogador = desafiosAceitos.filter(
          (d) => d.jogador_id === jogador.id
        )
        const pontos = desafiosDoJogador.reduce(
          (acc, d) => acc + (d.desafios?.pontos || 0),
          0
        )
        return {
          nome: jogador.nome,
          pontos,
        }
      })

      // 4. Ordenar do maior para o menor
      pontuacoes.sort((a, b) => b.pontos - a.pontos)

      setRanking(pontuacoes)
    }

    fetchRanking()
  }, [])

  const medalha = (index) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `${index + 1}º`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3D0262] via-[#4A176A] to-[#5C2E7C] p-6 text-white">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Ranking 🏆</h1>

        <div className="flex flex-col gap-4">
          {ranking.map((jogador, index) => (
            <div
              key={index}
              className={`flex items-center justify-between bg-white/10 rounded-xl px-4 py-3 shadow-md ${
                index === 0 ? 'border-yellow-400 border-2' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{medalha(index)}</span>
                <span className="font-semibold">{jogador.nome}</span>
              </div>
              <span className="font-bold text-yellow-300">
                {jogador.pontos} pts
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/desafios')}
            className="bg-yellow-400 text-purple-900 font-bold py-2 px-6 rounded-lg hover:bg-yellow-300 transition-all"
          >
            Voltar para Desafios
          </button>
        </div>
      </div>
    </div>
  )
}
