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
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center modal-overlay">
            <div className="bg-white p-6 rounded shadow w-80">
                <h3 className="text-xl font-bold mb-2 text-gray-800">{title}</h3>

                <p className="text-gray-600 mb-6">
                    {message}
                </p>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        取消
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors disabled:opacity-50 flex items-center"
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