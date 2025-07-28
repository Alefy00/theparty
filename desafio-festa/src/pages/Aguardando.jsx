import React from 'react';
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Aguardando() {
  const [podeValidar, setPodeValidar] = useState(false)
  const [verificando, setVerificando] = useState(true)
  const navigate = useNavigate()
  const partidaId = localStorage.getItem('partidaId')

  useEffect(() => {
    if (!partidaId) return

    const verificarEncerramento = async () => {
      setVerificando(true)

      const { data: jogadores, error } = await supabase
        .from('jogadores')
        .select('id, nome, encerrou')
        .eq('partida_id', partidaId)

      if (error) {
        console.error('Erro ao verificar jogadores:', error)
        return
      }

      const todosEncerraram = jogadores.every(j => j.encerrou === true)
      setPodeValidar(todosEncerraram)
      setVerificando(false)
    }

    // Verifica imediatamente
    verificarEncerramento()

    // Re-verifica a cada 10s
    const interval = setInterval(verificarEncerramento, 10000)

    return () => clearInterval(interval)
  }, [partidaId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3D0262] via-[#4A176A] to-[#5C2E7C] text-white p-6 flex flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold mb-6">Festa em andamento 🎉</h1>
      <p className="mb-4">Aguardando todos os jogadores encerrarem sua participação...</p>

      {verificando ? (
        <div className="text-yellow-300 font-semibold">Verificando jogadores...</div>
      ) : podeValidar ? (
        <button
          onClick={() => navigate('/validar')}
          className="mt-6 bg-yellow-400 text-purple-900 font-bold py-2 px-6 rounded-lg hover:bg-yellow-300 transition-all"
        >
          Começar Validação ✅
        </button>
      ) : (
        <div className="text-sm text-white/80">Ainda faltam jogadores...</div>
      )}
    </div>
  )
}