export function Button({ children, className = "", variant, ...props }) {
    const base = "px-4 py-2 rounded text-white";
    const bg = variant === "destructive" ? "bg-red-600" : "bg-blue-600";
    return (
      <button className={`${base} ${bg} ${className}`} {...props}>
        {children}
      </button>
    );
  }
  