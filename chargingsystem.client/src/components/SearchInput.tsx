import { Search } from 'lucide-react';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function SearchInput({ value, onChange, placeholder = "搜索..." }: SearchInputProps) {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="
                    bg-slate-800/50 text-white pl-10
                    border border-white/20 rounded 
                    p-2 w-full sm:w-48 md:w-64 
                    placeholder:text-slate-400 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    hover:border-white/40 transition-colors
                "
            />
        </div>
    );
}
