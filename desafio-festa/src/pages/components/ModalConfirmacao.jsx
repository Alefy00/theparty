export default function ModalConfirmacao({ visivel, frase, onConfirmar, onCancelar }) {
  if (!visivel) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white text-purple-900 p-6 rounded-xl shadow-lg max-w-md w-full mx-4 text-center">
        <p className="text-lg font-semibold mb-6">{frase}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirmar}
            className="bg-red-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Sim, recusar
          </button>
          <button
            onClick={onCancelar}
            className="bg-gray-200 text-purple-800 font-bold px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Voltar atrás
          </button>
        </div>
      </div>
    </div>
  )
}
