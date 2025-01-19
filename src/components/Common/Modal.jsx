const Modal = ({ showModal, handleDeleteAlbum, setShowModal }) => {
  if (!showModal) return null

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete this album?</p>
        <button onClick={handleDeleteAlbum}>Yes</button>
        <button onClick={() => setShowModal(false)}>No</button>
      </div>
    </div>
  )
}

export default Modal
