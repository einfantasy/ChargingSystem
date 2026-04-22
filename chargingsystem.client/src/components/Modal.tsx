interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    showCloseButton?: boolean;
}

export default function Modal({ isOpen, onClose, title, children, showCloseButton = false }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl shadow-2xl w-[90%] sm:w-96 border border-white/20">
                {(title || showCloseButton) && (
                    <div className="flex justify-between items-center mb-5">
                        {title && <h3 className="text-xl font-bold text-gray-900">{title}</h3>}
                        {showCloseButton && (
                            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">✕</button>
                        )}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
