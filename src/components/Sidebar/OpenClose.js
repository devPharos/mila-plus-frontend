export default function OpenClose({ oppened, setOppened }) {
  return (
    <div className="flex flex-row justify-center items-center">
      <button
        type="button"
        onClick={() => setOppened(!oppened)}
        className="relative w-10 h-10 text-gray-300 rounded hover:bg-gray-300 transition mr-2 lg:block"
        id="menu-toggle"
        aria-label="Abrir Menu"
        aria-haspopup="dialog"
        aria-expanded="false"
        aria-controls="radix-:R9b6uubda:"
        data-state="closed"
      >
        <span
          className={`${
            !oppened
              ? "bg-gray-500 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[16px] h-[2px] rounded transition"
              : "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[16px] h-[2px] rounded transition bg-transparent"
          }`}
        ></span>
        <span
          className={`bg-gray-500 ${
            !oppened
              ? "absolute left-1/2 top-[calc(50%-6px)] -translate-x-1/2 -translate-y-1/2 w-[16px] h-[2px] rounded transition-all"
              : "absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-[16px] h-[2px] rounded transition-all top-1/2 rotate-45"
          }`}
        ></span>
        <span
          className={`bg-gray-500 ${
            !oppened
              ? "absolute left-1/2 top-[calc(50%+6px)] -translate-x-1/2 -translate-y-1/2 w-[16px] h-[2px] rounded transition-all"
              : "absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-[16px] h-[2px] rounded transition-all top-1/2 -rotate-45"
          }`}
        ></span>
      </button>
      {oppened && <span className="text-gray-500 text-xs">Minimize</span>}
    </div>
  );
}
