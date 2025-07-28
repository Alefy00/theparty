import React from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function ValidacaoJogador() {
  const { nome } = useParams()
  const navigate = useNavigate()
  const [desafios, setDesafios] = useState([])
  const [respostas, setRespostas] = useState({})

  const partidaId = localStorage.getItem('partidaId')


  useEffect(() => {
    const carregarDesafiosAceitos = async () => {
      const { data: jogadores } = await supabase
        .from('jogadores')
        .select('id')
        .eq('nome', nome)
        .eq('partida_id', partidaId)
        .maybeSingle()

      if (!jogadores) return

      const jogadorId = jogadores.id

      const { data, error } = await supabase
        .from('jogador_desafios')
        .select('id, desafio_id, aceito, validado, desafios (descricao)')
        .eq('jogador_id', jogadorId)
        .eq('partida_id', partidaId)
        .eq('aceito', true)

      if (error) {
        console.error('Erro ao buscar desafios aceitos:', error)
        return
      }

      const formatado = data.map(d => ({
        id: d.id,
        desafioId: d.desafio_id,
        descricao: d.desafios?.descricao || 'Desafio desconhecido',
        validado: d.validado
      }))

      setDesafios(formatado)
    }

    carregarDesafiosAceitos()
  }, [nome, partidaId])

  const marcar = async (id, status) => {
    setRespostas(prev => ({ ...prev, [id]: status }))

    const { error } = await supabase
      .from('jogador_desafios')
      .update({ validado: status })
      .eq('id', id)

    if (error) {
      console.error('Erro ao validar desafio:', error)
    }
  }

  useEffect(() => {
    const todosRespondidos = desafios.every(d => respostas[d.id] !== undefined)

    if (todosRespondidos) {
      const validadosSalvos = JSON.parse(localStorage.getItem('validados') || '[]')
      const nomeLower = nome.toLowerCase()
      if (!validadosSalvos.includes(nomeLower)) {
        validadosSalvos.push(nomeLower)
        localStorage.setItem('validados', JSON.stringify(validadosSalvos))
      }
    }
  }, [respostas, desafios, nome])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3D0262] via-[#4A176A] to-[#5C2E7C] p-6 text-white">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Validar: {nome.charAt(0).toUpperCase() + nome.slice(1)}
        </h1>

        <div className="flex flex-col gap-4">
          {desafios.map((desafio) => (
            <div key={desafio.id} className="bg-white/10 p-4 rounded-xl shadow-md">
              <p className="mb-3">{desafio.descricao}</p>
              {respostas[desafio.id] === undefined ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => marcar(desafio.id, true)}
                    className="flex-1 bg-green-400 text-black font-bold py-2 rounded-lg"
                  >
                    Confirmar que fez
                  </button>
                  <button
                    onClick={() => marcar(desafio.id, false)}
                    className="flex-1 bg-red-400 text-black font-bold py-2 rounded-lg"
                  >
                    Não fez
                  </button>
                </div>
              ) : (
                <p className={`font-semibold ${respostas[desafio.id] ? 'text-green-300' : 'text-red-300'}`}>
                  {respostas[desafio.id] ? '✅ Fez o desafio' : '❌ Não fez'}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => navigate('/validar')}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl border border-white/20 transition-all"
          >
            Voltar para a lista de jogadores
          </button>
        </div>
      </div>
    </div>
  )
}
