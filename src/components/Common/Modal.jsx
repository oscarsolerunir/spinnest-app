const Modal = ({ showModal, handleDeleteAlbum, setShowModal }) => {
  if (!showModal) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
        <p className="mb-4">
          ¿Estás seguro de que quieres eliminar este álbum?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleDeleteAlbum}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sí
          </button>
          <button
            onClick={() => setShowModal(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            No
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal
