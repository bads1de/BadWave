import AccountContent from "./components/AccountContent";

const Account = () => {
  return (
    <div className="bg-[#0a0a0f] h-full w-full overflow-hidden font-mono">
      <div className="h-full overflow-y-auto custom-scrollbar relative">
        {/* 背景装飾 */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" 
             style={{ 
               backgroundImage: `linear-gradient(rgba(var(--theme-500), 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--theme-500), 0.2) 1px, transparent 1px)`,
               backgroundSize: '100px 100px'
             }} 
        />
        
        <div className="px-8 py-12 md:px-16 space-y-12 relative z-10">
          <div className="space-y-2 border-l-4 border-theme-500 pl-6">
            <p className="text-theme-500 text-[10px] tracking-[0.5em] uppercase animate-pulse">
              [ ACCESSING_SECURE_NODE ]
            </p>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(var(--theme-500),0.8)]">
              OPERATOR_SETTINGS
            </h1>
          </div>
          <AccountContent />
        </div>
      </div>
    </div>
  );
};

export default Account;
