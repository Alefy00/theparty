import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ModalConfirmacao from './components/ModalConfirmacao'
import { supabase } from '../lib/supabase'

const frasesDesdenho = [
  'Ah, desistindo já? franguinho vai lá desiste!',
  'Covarde... Tem certeza que vai recusar isso?',
  'Vai perder 20 pontos por medo?',
  'Hmm... atitude de campeão não é, né?',
  'Sem pressão... só todo mundo vai saber 😏'
]

const coresPorNivel = {
  fácil: 'bg-green-500',
  médio: 'bg-yellow-400',
  difícil: 'bg-red-500',
}

export default function Desafios() {
  const nome = localStorage.getItem('nome')
  const jogadorId = localStorage.getItem('jogadorId')
  const partidaId = localStorage.getItem('partidaId')
  const [desafios, setDesafios] = useState([])
  const [respostas, setRespostas] = useState({})
  const [proximoReset, setProximoReset] = useState(null)
  const [tempoRestante, setTempoRestante] = useState('')
  const navigate = useNavigate()

  const [mostrarModal, setMostrarModal] = useState(false)
  const [fraseAtual, setFraseAtual] = useState('')
  const [desafioSelecionado, setDesafioSelecionado] = useState(null)

  const carregarOuResetarDesafios = async () => {
    const timestampSalvo = localStorage.getItem('desafiosRecebidosEm')
    const agora = Date.now()

    if (!timestampSalvo || agora - parseInt(timestampSalvo) >= 3600000) {
      // Buscar 5 desafios aleatórios do Supabase
      const { data: desafiosSupabase, error } = await supabase
        .from('desafios')
        .select('*')

      if (error) {
        console.error('Erro ao buscar desafios:', error)
        return
      }

      // Embaralhar e pegar 5
      const embaralhados = desafiosSupabase.sort(() => Math.random() - 0.5).slice(0, 5)

      localStorage.setItem('desafiosRecebidosEm', agora.toString())
      localStorage.setItem('respostasDesafios', '{}')
      localStorage.setItem('desafiosAtuais', JSON.stringify(embaralhados))
      setDesafios(embaralhados)
      setRespostas({})
      setProximoReset(agora + 3600000)
    } else {
      const desafiosSalvos = JSON.parse(localStorage.getItem('desafiosAtuais') || '[]')
      const respostasSalvas = JSON.parse(localStorage.getItem('respostasDesafios') || '{}')
      setDesafios(desafiosSalvos)
      setRespostas(respostasSalvas)
      setProximoReset(parseInt(timestampSalvo) + 3600000)
    }
  }

  const handleAcao = async (desafioId, aceito) => {
    setRespostas(prev => {
      const novo = { ...prev, [desafioId]: aceito }
      localStorage.setItem('respostasDesafios', JSON.stringify(novo))
      return novo
    })

    // Salvar no Supabase
    await supabase.from('jogador_desafios').insert([
      {
        jogador_id: jogadorId,
        partida_id: partidaId,
        desafio_id: desafioId,
        aceito
      }
    ]).then(({ error }) => {
      if (error) console.error('Erro ao salvar resposta:', error)
    })

  }

  const solicitarConfirmacaoRecusa = (desafio) => {
    const frase = frasesDesdenho[Math.floor(Math.random() * frasesDesdenho.length)]
    setFraseAtual(frase)
    setDesafioSelecionado(desafio)
    setMostrarModal(true)
  }

  const confirmarRecusa = () => {
    if (desafioSelecionado) {
      handleAcao(desafioSelecionado.id, false)
      setMostrarModal(false)
      setDesafioSelecionado(null)
    }
  }

  const cancelarRecusa = () => {
    setMostrarModal(false)
    setDesafioSelecionado(null)
  }

  const encerrarParticipacao = async () => {
    await supabase
      .from('jogadores')
      .update({ encerrou: true })
      .eq('id', jogadorId)

    navigate('/aguardando')
  }

  useEffect(() => {
    carregarOuResetarDesafios()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (proximoReset) {
        const restante = proximoReset - Date.now()
        if (restante <= 0) {
          carregarOuResetarDesafios()
        } else {
          const minutos = Math.floor(restante / 60000)
          const segundos = Math.floor((restante % 60000) / 1000)
          setTempoRestante(`${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`)
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [proximoReset])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3D0262] via-[#4A176A] to-[#5C2E7C] p-4 text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">Olá, {nome} 👋</h2>

      <div className="text-center mb-4">
        <button
          onClick={() => navigate('/ranking')}
          className="bg-yellow-400 text-purple-900 font-semibold px-4 py-2 rounded-lg hover:bg-yellow-300 transition-all shadow"
        >
          Ver Ranking 🏆
        </button>
      </div>

      <p className="text-center mb-2">Aqui estão seus desafios da vez!</p>
      <p className="text-center mb-6 text-sm text-yellow-300">
        Próximo reset em: {tempoRestante || '00:00'}
      </p>

      <div className="flex flex-col gap-4 max-w-xl mx-auto">
        {desafios.map((desafio) => {
          const cor = coresPorNivel[desafio.nivel] || 'bg-gray-400'
          const aceito = respostas[desafio.id]

          return (
            <div key={desafio.id} className="bg-white/10 backdrop-blur-sm p-4 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded ${cor} text-black`}>
                  {desafio.nivel.toUpperCase()}
                </span>
                <span className="text-sm font-bold text-yellow-300">{desafio.pontos} pts</span>
              </div>
              <p className="mb-4">{desafio.descricao}</p>

              {aceito !== undefined ? (
                <div className={`text-sm font-bold ${aceito ? 'text-green-300' : 'text-red-300'}`}>
                  {aceito ? 'Desafio aceito!' : 'Desafio recusado.'}
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcao(desafio.id, true)}
                    className="flex-1 bg-green-400 text-black font-bold py-2 rounded-lg hover:opacity-90"
                  >
                    Aceitar
                  </button>
                  <button
                    onClick={() => solicitarConfirmacaoRecusa(desafio)}
                    className="flex-1 bg-red-500 text-white font-bold py-2 rounded-lg hover:opacity-90"
                  >
                    Recusar
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={encerrarParticipacao}
          className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl border border-white/20 transition-all"
        >
          Encerrar minha participação 🚪
        </button>
      </div>

      <ModalConfirmacao
        visivel={mostrarModal}
        frase={fraseAtual}
        onConfirmar={confirmarRecusa}
        onCancelar={cancelarRecusa}
      />
    </div>
  )
}