import svgPaths from "./svg-mhio30kzah";
import imgScreenshot20250913At0723561 from "figma:asset/ae4790770ff20e3d51318aa3e4e24dabaa379eb0.png";
import imgImg38063 from "figma:asset/a8f5b0823315e214a77a21062ee3cc97ecb80118.png";
import imgImg38064 from "figma:asset/ef52dfe92c6bfe99dcd2568b0d65aa8729c23e3f.png";
import imgImg38065 from "figma:asset/e8bda3e3af22116533e5e4173709b018be2d4b18.png";

function FiBsSearch() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="fi-bs-search">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 24 24"
      >
        <g clipPath="url(#clip0_1_122)" id="fi-bs-search">
          <path
            d={svgPaths.p1b437d80}
            fill="var(--fill-0, white)"
            fillOpacity="0.82"
            id="Vector"
          />
        </g>
        <defs>
          <clipPath id="clip0_1_122">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-[215px]">
      <div
        className="h-[50px] relative shrink-0 w-[115px]"
        data-name="Screenshot 2025-09-13 at 07.23.56 1"
      >
        <img
          alt=""
          className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
          src={imgScreenshot20250913At0723561}
        />
      </div>
      <FiBsSearch />
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[10px] h-[150px] items-end left-0 px-[39px] py-[31px] top-0 w-[393px]">
      <Frame3 />
    </div>
  );
}

function Container() {
  return (
    <div
      className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <p className="font-['League_Spartan:SemiBold',_sans-serif] font-semibold leading-none relative shrink-0 text-[24px] text-neutral-100 text-nowrap whitespace-pre">
        Featured
      </p>
    </div>
  );
}

function Frame() {
  return (
    <div className="basis-0 bg-[#b3b3b3] grow h-[183px] min-h-px min-w-px overflow-clip relative rounded-[9px] shadow-[0px_2px_20.5px_2px_rgba(0,0,0,0.37)] shrink-0">
      <div
        className="absolute h-[187px] left-[calc(50%+5.75px)] top-[calc(50%+2px)] translate-x-[-50%] translate-y-[-50%] w-[161px]"
        data-name="IMG_3806 3"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            alt=""
            className="absolute h-[129.35%] left-0 max-w-none top-[-8.15%] w-full"
            src={imgImg38063}
          />
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="basis-0 bg-[#b3b3b3] grow h-[183px] min-h-px min-w-px overflow-clip relative rounded-[9px] shadow-[0px_2px_20.5px_2px_rgba(0,0,0,0.37)] shrink-0">
      <div
        className="absolute h-[193px] left-[calc(50%+5.75px)] top-1/2 translate-x-[-50%] translate-y-[-50%] w-[166px]"
        data-name="IMG_3806 3"
      >
        <img
          alt=""
          className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
          src={imgImg38064}
        />
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="basis-0 bg-[#b3b3b3] grow h-[183px] min-h-px min-w-px overflow-clip relative rounded-[9px] shadow-[0px_2px_20.5px_2px_rgba(0,0,0,0.37)] shrink-0">
      <div
        className="absolute h-[198px] left-[calc(50%+11.25px)] top-[calc(50%+0.5px)] translate-x-[-50%] translate-y-[-50%] w-[170px]"
        data-name="IMG_3806 3"
      >
        <img
          alt=""
          className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
          src={imgImg38065}
        />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div
      className="content-stretch flex gap-[10px] items-start relative shrink-0 w-full overflow-x-auto"
      data-name="Container"
    >
      <Frame />
      <Frame1 />
      {[...Array(2).keys()].map((_, i) => (
        <Frame2 key={i} />
      ))}
    </div>
  );
}

function Container2() {
  return (
    <div
      className="content-stretch flex flex-col gap-[40px] items-start relative shrink-0 w-[452px]"
      data-name="Container"
    >
      <Container1 />
    </div>
  );
}

function Container3() {
  return (
    <div
      className="absolute content-stretch flex flex-col gap-[24px] items-start left-[20px] top-[534px]"
      data-name="Container"
    >
      <Container />
      <Container2 />
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

function PlayCircle() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="Play circle">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 40 40"
      >
        <g id="Play circle">
          <circle
            cx="20"
            cy="20"
            fill="var(--fill-0, #EB588C)"
            id="Ellipse 1"
            r="15"
          />
          <path d={svgPaths.p324a01f0} fill="var(--fill-0, white)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container4() {
  return (
    <div
      className="absolute bottom-[350px] content-stretch flex flex-col gap-[24px] items-center left-[313px] w-[58px]"
      data-name="Container"
    >
      <WatchlistButton />
      <PlayCircle />
    </div>
  );
}

function TitleAndDescription() {
  return (
    <div
      className="absolute content-stretch flex flex-col gap-[8px] items-start leading-none left-[20px] text-neutral-100 top-[436px] w-[268px]"
      data-name="Title and Description"
    >
      <p className="font-['League_Spartan:Regular',_sans-serif] font-normal relative shrink-0 text-[24px] w-full">
        Chronicles of Kwa-Zulu
      </p>
      <p className="font-['League_Spartan:ExtraLight',_sans-serif] font-extralight relative shrink-0 text-[17px] w-full whitespace-pre-wrap">{`A young man attempts to learn the  culture and tradition of a clan...`}</p>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[20px] top-[398px]">
      <Container4 />
      <TitleAndDescription />
    </div>
  );
}

function Home() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="Home">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 28 28"
      >
        <g id="Home">
          <path
            d={svgPaths.p8e70900}
            id="Icon"
            stroke="var(--stroke-0, #EB588C)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function NavigationItem() {
  return (
    <div
      className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-[48px]"
      data-name="Navigation Item"
    >
      <Home />
      <p className="font-['League_Spartan:Regular',_sans-serif] font-normal h-[13px] leading-none relative shrink-0 text-[#eb588c] text-[13px] text-center w-full">
        Home
      </p>
    </div>
  );
}

function PlayCircle1() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="Play circle">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 28 28"
      >
        <g id="Play circle">
          <g id="Icon">
            <path
              d={svgPaths.p1fa66600}
              stroke="var(--stroke-0, white)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <path
              d={svgPaths.p26d3f680}
              stroke="var(--stroke-0, white)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

function NavigationItem1() {
  return (
    <div
      className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-[48px]"
      data-name="Navigation Item"
    >
      <PlayCircle1 />
      <p className="font-['League_Spartan:Regular',_sans-serif] font-normal h-[13px] leading-none relative shrink-0 text-[13px] text-center text-white w-full">
        Explore
      </p>
    </div>
  );
}

function Video() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="Video">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 28 28"
      >
        <g id="Video">
          <g id="Icon">
            <path
              d={svgPaths.p361e1400}
              stroke="var(--stroke-0, white)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <path
              d={svgPaths.p21cc980}
              stroke="var(--stroke-0, white)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}

function NavigationItem2() {
  return (
    <div
      className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-[48px]"
      data-name="Navigation Item"
    >
      <Video />
      <p className="font-['League_Spartan:Regular',_sans-serif] font-normal h-[13px] leading-none relative shrink-0 text-[13px] text-center text-white w-full">
        Upload
      </p>
    </div>
  );
}

function Bookmark() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="Bookmark">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 28 28"
      >
        <g id="Bookmark">
          <path
            d={svgPaths.p35e56500}
            id="Icon"
            stroke="var(--stroke-0, #F3F4F6)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function NavigationItem3() {
  return (
    <div
      className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-[48px]"
      data-name="Navigation Item"
    >
      <Bookmark />
      <p className="font-['League_Spartan:Regular',_sans-serif] font-normal h-[13px] leading-none relative shrink-0 text-[13px] text-center text-gray-100 w-full">
        My Stuff
      </p>
    </div>
  );
}

function NavigationItems() {
  return (
    <div
      className="content-stretch flex items-center justify-between relative shrink-0 w-full"
      data-name="Navigation Items"
    >
      <NavigationItem />
      <NavigationItem1 />
      <NavigationItem2 />
      <NavigationItem3 />
    </div>
  );
}

function NavigationBar() {
  return (
    <div
      className="absolute backdrop-blur-3xl backdrop-filter box-border content-stretch flex flex-col gap-[10px] h-[90px] items-start justify-center left-0 overflow-clip p-[16px] top-[762px] w-[393px]"
      data-name="Navigation Bar"
    >
      <NavigationItems />
    </div>
  );
}

export default function Homepage() {
  return (
    <div className="bg-white relative size-full" data-name="Homepage">
      <div
        className="absolute h-[912px] left-[-185px] top-[-50px] w-[784px]"
        data-name="IMG_3806 1"
      >
        <img
          alt=""
          className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
          src={imgImg38065}
        />
      </div>
      <div className="absolute bottom-0 h-[656px] left-0 w-[393px]" />
      <Frame4 />
      <Container3 />
      <Group />
      <NavigationBar />
    </div>
  );
}
