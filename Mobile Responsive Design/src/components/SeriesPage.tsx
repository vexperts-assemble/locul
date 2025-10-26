import svgPaths from "../imports/svg-xujsxgssb8";
import imgImg38061 from "figma:asset/e8bda3e3af22116533e5e4173709b018be2d4b18.png";
import { ArrowLeft } from "lucide-react";

function EpisodeInfo() {
  return (
    <div
      className="content-stretch flex flex-col gap-[8px] items-start leading-none relative shrink-0 text-neutral-100 w-full max-w-[227px]"
      data-name="Episode Info"
    >
      <p className="font-['League_Spartan:Regular',_sans-serif] font-normal relative shrink-0 text-[24px] w-full">
        Chronicles of Kwa-Zulu
      </p>
      <p className="font-['League_Spartan:Light',_sans-serif] font-light relative shrink-0 text-[16px] w-full">
        Episode 1
      </p>
    </div>
  );
}

function Rewind10SecondsSvgrepoCom() {
  return (
    <div
      className="relative shrink-0 size-[32px]"
      data-name="rewind-10-seconds-svgrepo-com 1"
    >
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 32 32"
      >
        <g id="rewind-10-seconds-svgrepo-com 1">
          <path
            d={svgPaths.p3b071480}
            id="Vector"
            stroke="var(--stroke-0, #E5E7EB)"
            strokeLinecap="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p37c08300}
            id="Vector_2"
            stroke="var(--stroke-0, #E5E7EB)"
            strokeLinecap="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p2be8ba00}
            id="Vector_3"
            stroke="var(--stroke-0, #E5E7EB)"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p2a580600}
            id="Vector_4"
            stroke="var(--stroke-0, #E5E7EB)"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function Pause() {
  return (
    <div className="relative shrink-0 size-[25px]" data-name="pause">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 25 25"
      >
        <g id="pause">
          <path
            d={svgPaths.p341ccd80}
            fill="var(--fill-0, white)"
            id="Vector"
          />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div
      className="bg-[#eb588c] box-border content-stretch flex gap-[8px] items-center justify-center overflow-clip p-[12px] relative rounded-[57px] shrink-0 w-[49px]"
      data-name="Button"
    >
      <Pause />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute h-[9px] left-[34.38%] right-[31.25%] top-1/2 translate-y-[-50%]">
      <div className="absolute inset-[-11.11%_-9.09%]">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 13 11"
        >
          <g id="Group 10">
            <path
              d={svgPaths.p602cfd0}
              id="Vector"
              stroke="var(--stroke-0, #E5E7EB)"
              strokeLinecap="round"
              strokeWidth="2"
            />
            <path
              d={svgPaths.p21b57220}
              id="Vector_2"
              stroke="var(--stroke-0, #E5E7EB)"
              strokeWidth="2"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="relative size-full">
      <div className="absolute inset-[-3.7%_-3.57%]">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 30 29"
        >
          <g id="Group 9">
            <path
              d={svgPaths.pb60cd00}
              id="Vector"
              stroke="var(--stroke-0, #E5E7EB)"
              strokeLinecap="round"
              strokeWidth="2"
            />
            <path
              d={svgPaths.p13f7e780}
              id="Vector_2"
              stroke="var(--stroke-0, #E5E7EB)"
              strokeLinecap="round"
              strokeWidth="2"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Rewind10SecondsSvgrepoCom1() {
  return (
    <div
      className="relative shrink-0 size-[32px]"
      data-name="rewind-10-seconds-svgrepo-com 2"
    >
      <Group1 />
      <div className="absolute flex inset-[7.81%_6.25%_7.82%_6.25%] items-center justify-center">
        <div className="flex-none h-[27px] rotate-[180deg] scale-y-[-100%] w-[28px]">
          <Group />
        </div>
      </div>
    </div>
  );
}

function Controls() {
  return (
    <div
      className="content-stretch flex gap-[24px] items-center justify-center relative shrink-0 w-full"
      data-name="Controls"
    >
      <Rewind10SecondsSvgrepoCom />
      <Button />
      <Rewind10SecondsSvgrepoCom1 />
    </div>
  );
}

function ControlsContainer() {
  return (
    <div
      className="content-stretch flex flex-col gap-[8px] items-center justify-center relative shrink-0 w-full"
      data-name="Controls Container"
    >
      <Controls />
    </div>
  );
}

function Plus() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="Plus">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 40 40"
      >
        <g id="Plus">
          <path
            d={svgPaths.p9c19b00}
            id="Icon"
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        </g>
      </svg>
    </div>
  );
}

function WatchlistButton() {
  return (
    <div
      className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0"
      data-name="Watchlist Button"
    >
      <Plus />
    </div>
  );
}

function LayerGroup() {
  return (
    <div className="relative size-[25px]" data-name="layer-group">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 25 25"
      >
        <g clipPath="url(#clip0_1_325)" id="layer-group">
          <path
            d={svgPaths.p35e96480}
            fill="var(--fill-0, white)"
            id="Vector"
          />
        </g>
        <defs>
          <clipPath id="clip0_1_325">
            <rect fill="white" height="25" width="25" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function EpisodesButton({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col items-center gap-[4px] relative shrink-0 cursor-pointer"
      data-name="Episodes Button"
    >
      <LayerGroup />
      <p className="font-['League_Spartan:Light',_sans-serif] font-light leading-none relative text-[16px] text-center text-neutral-100">
        Episodes
      </p>
    </div>
  );
}

export default function SeriesPage({
  onNavigateBack,
  onNavigateToEpisodes,
}: {
  onNavigateBack: () => void;
  onNavigateToEpisodes: () => void;
}) {
  return (
    <div
      className="bg-black relative w-full min-h-screen flex flex-col"
      data-name="Series Page"
    >
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          alt=""
          className="w-full h-full object-cover pointer-events-none scale-150 origin-center"
          src={imgImg38061}
        />
      </div>

      {/* Top Gradient - Dark to Transparent */}
      <div className="absolute top-0 left-0 right-0 h-[200px] bg-gradient-to-b from-black/50 via-black/30 to-transparent pointer-events-none" />

      {/* Bottom Gradient - Transparent to Black */}
      <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-gradient-to-t from-black via-black/70 to-transparent pointer-events-none" />

      {/* Back Button */}
      <div className="absolute top-[43px] left-[15px] z-10">
        <button
          onClick={onNavigateBack}
          className="bg-white rounded-full p-[8px] flex items-center justify-center"
        >
          <ArrowLeft
            className="w-[24px] h-[24px] text-[#1A1A1A]"
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Action Buttons (Add & Episodes) - Right Side */}
      <div className="absolute bottom-[268px] right-[21px] z-10 flex flex-col gap-[24px] items-center">
        <WatchlistButton />
        <EpisodesButton onClick={onNavigateToEpisodes} />
      </div>

      {/* Episode Info and Controls - Bottom */}
      <div className="absolute bottom-[77px] left-0 right-0 z-10 px-[32px]">
        <div className="flex flex-col gap-[16px] items-start w-full">
          <EpisodeInfo />
          <ControlsContainer />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[8px] bg-[#3e3d3a] z-20">
        <div className="h-full w-[47%] bg-[#ff498d] rounded-r-[10px]" />
      </div>
    </div>
  );
}
