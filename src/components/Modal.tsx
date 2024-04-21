import React from "react";

interface ModalProps {
    children: React.ReactNode;
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
    const handleModalClose = () => {
        onClose();
    };

    const handleModalClick = (event: React.ChangeEvent<unknown>): void => {
        event.stopPropagation();
    };

    return (
        <div className="modal-background" onClick={handleModalClose}>
            <div className="modal" onClick={handleModalClick}>
                <button className="modal-close-btn" onClick={handleModalClose}>
                    X
                </button>
                <div className="modal-content">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
