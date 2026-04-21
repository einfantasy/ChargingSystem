import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    loading,
    onConfirm,
    onCancel
}) => {
    // 如果弹窗未开启，不渲染任何内容
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-2xl shadow-2xl w-[90%] sm:w-96 border border-white/20">
                <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>

                <p className="text-gray-600 mb-6">
                    {message}
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50/80 transition-colors disabled:opacity-50"
                    >
                        取消
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-5 py-2.5 bg-red-500/90 hover:bg-red-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
                                处理中...
                            </>
                        ) : "确认删除"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;