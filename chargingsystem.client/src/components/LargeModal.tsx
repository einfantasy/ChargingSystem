interface LargeModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export default function LargeModal({ isOpen, onClose, title, children }: LargeModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl shadow-2xl w-[95%] sm:w-3/4 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border border-white/20">
                <div className="flex justify-between items-center mb-4 min-w-0">
                    {title && <h3 className="text-xl font-bold truncate text-gray-900">{title}</h3>}
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 flex-shrink-0 p-1">✕</button>
                </div>
                <div className="overflow-y-auto flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
