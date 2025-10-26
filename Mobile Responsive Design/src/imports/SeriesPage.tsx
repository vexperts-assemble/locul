import svgPaths from "./svg-xujsxgssb8";
import imgImg38061 from "figma:asset/e8bda3e3af22116533e5e4173709b018be2d4b18.png";

function EpisodeInfo() {
  return (
    <div
      className="content-stretch flex flex-col gap-[8px] items-start leading-none relative shrink-0 text-neutral-100 w-[227px]"
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

function Container() {
  return (
    <div
      className="absolute bottom-[69px] content-stretch flex flex-col gap-[16px] items-start left-[32px] w-[329px]"
      data-name="Container"
    >
      <EpisodeInfo />
      <ControlsContainer />
    </div>
  );
}

function Container1() {
  return (
    <div
      className="absolute bottom-[69px] contents left-[32px]"
      data-name="Container"
    >
      <Container />
    </div>
  );
}

function Progress() {
  return (
    <div className="absolute contents left-0 top-[844px]" data-name="Progress">
      <div className="absolute bg-[#3e3d3a] bottom-0 h-[8px] left-0 w-[393px]" />
      <div className="absolute bg-[#ff498d] h-[8px] left-0 rounded-br-[10px] rounded-tr-[10px] top-[844px] w-[186px]" />
    </div>
  );
}

function ArrowRight() {
  return (
    <div className="relative size-[24px]" data-name="Arrow right">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 24 24"
      >
        <g id="Arrow right">
          <path
            d={svgPaths.p39396800}
            id="Icon"
            stroke="var(--stroke-0, #1A1A1A)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function BackToMyStuff() {
  return (
    <div
      className="absolute bg-white box-border content-stretch flex gap-[5px] items-end left-[15px] p-[8px] rounded-[35px] top-[43px]"
      data-name="Back to My Stuff"
    >
      <div className="flex items-center justify-center relative shrink-0">
        <div className="flex-none rotate-[180deg]">
          <ArrowRight />
        </div>
      </div>
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
    <div
      className="[grid-area:1_/_1] ml-[16.891px] mt-0 relative size-[25px]"
      data-name="layer-group"
    >
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

function EpisodesButton() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0"
      data-name="Episodes Button"
    >
      <p className="[grid-area:1_/_1] font-['League_Spartan:Light',_sans-serif] font-light leading-none ml-[29px] mt-[33px] relative text-[16px] text-center text-neutral-100 translate-x-[-50%] w-[58px]">
        Episodes
      </p>
      <LayerGroup />
    </div>
  );
}

function Container2() {
  return (
    <div
      className="absolute bottom-[268px] content-stretch flex flex-col gap-[24px] items-center left-[312px] w-[58px]"
      data-name="Container"
    >
      <WatchlistButton />
      <EpisodesButton />
    </div>
  );
}

export default function SeriesPage() {
  return (
    <div className="bg-white relative size-full" data-name="Series Page">
      <div
        className="absolute h-[912px] left-[-185px] top-[-50px] w-[784px]"
        data-name="IMG_3806 1"
      >
        <img
          alt=""
          className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
          src={imgImg38061}
        />
      </div>
      <div className="absolute bottom-[702px] flex h-[150px] items-center justify-center left-0 w-[393px]">
        <div className="flex-none rotate-[180deg]">
          <div className="h-[150px] w-[393px]" />
        </div>
      </div>
      <div className="absolute bottom-0 h-[656px] left-0 w-[393px]" />
      <Container1 />
      <Progress />
      <BackToMyStuff />
      <Container2 />
    </div>
  );
}
