import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { IoMdClose } from "react-icons/io";

interface ModalProps {
  isOpen: boolean;
  onChange: (open: boolean) => void;
  title: string;
  description: string;
  disabled?: boolean;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onChange,
  title,
  description,
  disabled,
  children,
}) => {
  return (
    <Dialog.Root open={isOpen} defaultOpen={isOpen} onOpenChange={onChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="
            fixed inset-0 z-40 
            bg-black/90
            data-[state=open]:animate-in 
            data-[state=closed]:animate-out 
            data-[state=closed]:fade-out-0 
            data-[state=open]:fade-in-0
            duration-300
          "
        />
        <Dialog.Content
          className="
            fixed left-[50%] top-[50%] z-50 
            w-full max-w-[90vw] md:max-w-[800px] lg:max-w-[1000px]
            translate-x-[-50%] translate-y-[-50%] 
            bg-[#0a0a0f]/95
            backdrop-blur-xl
            p-8 md:p-12
            shadow-[0_0_50px_rgba(var(--theme-500),0.15),0_0_100px_rgba(0,0,0,0.8)]
            duration-500 
            data-[state=open]:animate-in 
            data-[state=closed]:animate-out 
            data-[state=closed]:fade-out-0 
            data-[state=open]:fade-in-0 
            data-[state=closed]:zoom-out-95 
            data-[state=open]:zoom-in-95 
            data-[state=closed]:slide-out-to-left-1/2 
            data-[state=closed]:slide-out-to-top-[48%] 
            data-[state=open]:slide-in-from-left-1/2 
            data-[state=open]:slide-in-from-top-[48%] 
            rounded-2xl
            border border-theme-500/30
            overflow-y-auto
            custom-scrollbar
            max-h-[90vh]
            cyber-glitch
          "
        >
          {/* HUD装飾コーナー */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-theme-500/40 pointer-events-none rounded-tl-2xl shadow-[-5px_-5px_15px_rgba(var(--theme-500),0.1)]" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-theme-500/40 pointer-events-none rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-theme-500/40 pointer-events-none rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-theme-500/40 pointer-events-none rounded-br-2xl" />

          {/* スキャンライン的な横線 */}
          <div className="absolute top-[60px] left-8 right-8 h-px bg-gradient-to-r from-transparent via-theme-500/20 to-transparent pointer-events-none" />

          <div className="flex flex-col space-y-4 mb-8 relative">
            <Dialog.Title
              className="
              text-3xl md:text-5xl 
              font-bold 
              tracking-[0.2em] 
              text-white
              text-center
              uppercase
              drop-shadow-[0_0_10px_rgba(var(--theme-500),0.8)]
              font-mono
            "
            >
              <span className="text-theme-500">[</span> {title} <span className="text-theme-500">]</span>
            </Dialog.Title>
            <Dialog.Description
              className="
              text-sm md:text-base
              text-theme-400/80
              text-center
              max-w-2xl
              mx-auto
              font-mono
              tracking-widest
              uppercase
            "
            >
              {description}
            </Dialog.Description>
          </div>
          <div className="relative z-10">{children}</div>
          <Dialog.Close asChild disabled={disabled}>
            <button
              className="
                absolute right-6 top-6
                rounded-none
                p-2
                opacity-70
                bg-transparent
                border border-theme-500/40
                transition-all
                duration-200
                hover:opacity-100
                hover:bg-theme-500/20
                hover:shadow-[0_0_15px_rgba(var(--theme-500),0.4)]
                focus:outline-none
                disabled:pointer-events-none
                group
              "
              aria-label="Close"
            >
              <IoMdClose className="h-6 w-6 text-theme-400 group-hover:text-white group-hover:scale-110 transition-transform" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;
