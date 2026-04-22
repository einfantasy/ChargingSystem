interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    placeholder?: string;
    className?: string;
    defaultValue?: number;
}

export default function NumberInput({
    value,
    onChange,
    placeholder = "0",
    className = "",
    defaultValue = 0
}: NumberInputProps) {
    return (
        <input
            type="number"
            className={`bg-white/50 border border-solid p-3 rounded-lg outline-none text-gray-800 ${className} modal-input`}
            value={value === defaultValue ? '' : value}
            placeholder={placeholder}
            onBlur={(e) => {
                const v = e.target.value.trim();
                if (v === '' || isNaN(Number(v))) onChange(defaultValue);
            }}
            onChange={(e) => {
                const v = e.target.value;
                onChange(v === '' ? defaultValue : Number(v));
            }}
        />
    );
}
