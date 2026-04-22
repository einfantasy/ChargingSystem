interface ModalActionsProps {
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
    confirmText?: string;
    cancelText?: string;
    confirmDisabled?: boolean;
}

export default function ModalActions({
    onConfirm,
    onCancel,
    loading = false,
    confirmText = "确认",
    cancelText = "取消",
    confirmDisabled = false
}: ModalActionsProps) {
    return (
        <div className="flex justify-end gap-3 mt-5">
            <button
                onClick={onCancel}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50/80 transition-colors"
            >
                {cancelText}
            </button>
            <button
                onClick={onConfirm}
                disabled={loading || confirmDisabled}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-lg transition-all"
            >
                {loading ? "提交中..." : confirmText}
            </button>
        </div>
    );
}
