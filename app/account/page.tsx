import AccountContent from "./components/AccountContent";
import GridBackground from "@/components/common/GridBackground";

const Account = () => {
  return (
    <div className="bg-[#0a0a0f] h-full w-full overflow-hidden font-mono">
      <div className="h-full overflow-y-auto custom-scrollbar relative">
        {/* 背景装飾 */}
        <GridBackground cellSize="100px 100px" opacity={0.05} />

        <div className="px-8 py-12 md:px-16 space-y-12 relative z-10">
          <div className="space-y-2 border-l-4 border-theme-500 pl-4 md:pl-6 max-w-full">
            <p className="text-theme-500 text-[10px] tracking-[0.5em] uppercase animate-pulse break-words">
              [ ACCESSING_SECURE_NODE ]
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(var(--theme-500),0.8)] break-all mt-2">
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
