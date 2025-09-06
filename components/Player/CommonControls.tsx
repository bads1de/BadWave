import React from "react";
import { FaRandom } from "react-icons/fa";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { BsRepeat1 } from "react-icons/bs";

interface CommonControlsProps {
  isPlaying: boolean;
  isShuffling: boolean;
  isRepeating: boolean;
  Icon: React.ComponentType<any>;
  handlePlay: () => void;
  onPlayNext: () => void;
  onPlayPrevious: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  isMobile?: boolean;
}

const CommonControls: React.FC<CommonControlsProps> = ({
  isPlaying,
  isShuffling,
  isRepeating,
  Icon,
  handlePlay,
  onPlayNext,
  onPlayPrevious,
  toggleShuffle,
  toggleRepeat,
  isMobile = false,
}) => {
  const shuffleSize = isMobile ? 22 : 20;
  const stepSize = isMobile ? 28 : 30;
  const repeatSize = isMobile ? 28 : 25;
  const playSize = isMobile ? 28 : 30;

  const shuffleClass = isMobile
    ? `cursor-pointer transition ${
        isShuffling ? "text-[#4c1d95]" : "text-gray-400"
      }`
    : `cursor-pointer transition-all duration-300 hover:filter hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] ${
        isShuffling ? "text-[#4c1d95] drop-shadow-[0_0_8px_rgba(76,29,149,0.6)] hover:drop-shadow-[0_0_12px_rgba(76,29,149,0.8)]" : "text-neutral-400 hover:text-white"
      }`;

  const stepBackClass = isMobile
    ? "text-gray-400 cursor-pointer hover:text-white transition"
    : "text-neutral-400 cursor-pointer hover:text-white hover:filter hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-300";

  const playButtonClass = isMobile
    ? "flex items-center justify-center h-16 w-16 rounded-full bg-[#4c1d95] cursor-pointer shadow-lg hover:bg-[#5d2ca6] transition-colors"
    : "flex items-center justify-center h-7 w-7 rounded-full bg-gradient-to-br from-[#08101f] to-[#0d0d0d] p-1 cursor-pointer group";

  const playIconClass = isMobile
    ? "text-white"
    : "text-[#f0f0f0] group-hover:filter group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]";

  const stepForwardClass = stepBackClass;

  const repeatClass = isMobile
    ? `cursor-pointer transition ${
        isRepeating ? "text-[#4c1d95]" : "text-gray-400"
      }`
    : `cursor-pointer transition-all duration-300 hover:filter hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] ${
        isRepeating ? "text-[#4c1d95] drop-shadow-[0_0_8px_rgba(76,29,149,0.6)] hover:drop-shadow-[0_0_12px_rgba(76,29,149,0.8)]" : "text-neutral-400 hover:text-white"
      }`;

  return (
    <div className={`flex items-center ${isMobile ? 'justify-between' : 'gap-x-8'}`}>
      <FaRandom
        onClick={toggleShuffle}
        size={shuffleSize}
        className={shuffleClass}
      />
      <AiFillStepBackward
        onClick={onPlayPrevious}
        size={stepSize}
        className={stepBackClass}
      />
      <div
        onClick={handlePlay}
        className={playButtonClass}
      >
        <Icon
          size={playSize}
          className={playIconClass}
        />
      </div>
      <AiFillStepForward
        onClick={onPlayNext}
        size={stepSize}
        className={stepForwardClass}
      />
      <BsRepeat1
        onClick={toggleRepeat}
        size={repeatSize}
        className={repeatClass}
      />
    </div>
  );
};

CommonControls.displayName = "CommonControls";

export default CommonControls;