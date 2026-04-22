interface TableContainerProps {
    children: React.ReactNode;
}

export default function TableContainer({ children }: TableContainerProps) {
    return (
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(92vh-13rem)] rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg">
            {children}
        </div>
    );
}
