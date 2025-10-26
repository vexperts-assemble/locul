import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import svgPaths from "./imports/svg-mhio30kzah";
import imgScreenshot20250913At0723561 from "figma:asset/ae4790770ff20e3d51318aa3e4e24dabaa379eb0.png";
import imgImg38063 from "figma:asset/a8f5b0823315e214a77a21062ee3cc97ecb80118.png";
import imgImg38064 from "figma:asset/ef52dfe92c6bfe99dcd2568b0d65aa8729c23e3f.png";
import imgImg38065 from "figma:asset/e8bda3e3af22116533e5e4173709b018be2d4b18.png";
import { User } from "lucide-react";
import SeriesPage from "./components/SeriesPage";
import EpisodesPage from "./components/EpisodesPage";
import ProfilePage from "./components/ProfilePage";

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
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-full">
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
      <div className="absolute right-0">
        <FiBsSearch />
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[10px] items-center px-[20px] sm:px-[39px] py-[31px] w-full bg-gradient-to-b from-black/60 via-black/30 to-transparent">
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
      <p className="font-['League_Spartan:SemiBold',_sans-serif] font-semibold leading-none relative shrink-0 text-neutral-100 text-nowrap whitespace-pre">
        Featured
      </p>
    </div>
  );
}

function Frame() {
  return (
    <div className="basis-0 bg-[#b3b3b3] grow h-[183px] min-h-px min-w-[120px] overflow-clip relative rounded-[9px] shadow-[0px_2px_20.5px_2px_rgba(0,0,0,0.37)] shrink-0">
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
    <div className="basis-0 bg-[#b3b3b3] grow h-[183px] min-h-px min-w-[120px] overflow-clip relative rounded-[9px] shadow-[0px_2px_20.5px_2px_rgba(0,0,0,0.37)] shrink-0">
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
    <div className="basis-0 bg-[#b3b3b3] grow h-[183px] min-h-px min-w-[120px] overflow-clip relative rounded-[9px] shadow-[0px_2px_20.5px_2px_rgba(0,0,0,0.37)] shrink-0">
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
      className="content-stretch flex flex-col gap-[40px] items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <Container1 />
    </div>
  );
}

function Container3() {
  return (
    <div
      className="content-stretch flex flex-col gap-[24px] items-start w-full px-[20px]"
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
      className="content-stretch flex flex-col gap-[24px] items-center w-[58px]"
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
      className="content-stretch flex flex-col gap-[8px] items-start leading-none text-neutral-100 w-full max-w-[268px]"
      data-name="Title and Description"
    >
      <p className="font-['League_Spartan:Regular',_sans-serif] font-normal relative shrink-0 w-full text-[32px]">
        Chronicles of Kwa-Zulu
      </p>
      <p className="font-['League_Spartan:ExtraLight',_sans-serif] font-extralight relative shrink-0 w-full whitespace-pre-wrap text-[17px]">{`A young man attempts to learn the  culture and tradition of a clan...`}</p>
    </div>
  );
}

function Group() {
  return (
    <div className="flex items-end justify-between w-full px-[20px]">
      <TitleAndDescription />
      <Container4 />
    </div>
  );
}

function Home({ isActive }: { isActive: boolean }) {
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
            stroke={isActive ? "#EB588C" : "white"}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function NavigationItem({
  isActive,
  onClick,
}: {
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-[48px]"
      data-name="Navigation Item"
    >
      <Home isActive={isActive} />
      <p
        className={`font-['League_Spartan:Regular',_sans-serif] font-normal h-[13px] leading-none relative shrink-0 text-center w-full ${isActive ? "text-[#eb588c]" : "text-white"}`}
      >
        Home
      </p>
    </button>
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

function NavigationItem1({
  isActive,
  onClick,
}: {
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-[48px]"
      data-name="Navigation Item"
    >
      <PlayCircle1 />
      <p
        className={`font-['League_Spartan:Regular',_sans-serif] font-normal h-[13px] leading-none relative shrink-0 text-center w-full ${isActive ? "text-[#eb588c]" : "text-white"}`}
      >
        Explore
      </p>
    </button>
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
      <p className="font-['League_Spartan:Regular',_sans-serif] font-normal h-[13px] leading-none relative shrink-0 text-center text-white w-full">
        Upload
      </p>
    </div>
  );
}

function NavigationItem3({
  isActive,
  onClick,
}: {
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="content-stretch flex flex-col gap-[4px] items-center relative shrink-0 w-[48px]"
      data-name="Navigation Item"
    >
      <div className="relative shrink-0 size-[28px]">
        <User
          className="w-full h-full"
          color={isActive ? "#EB588C" : "#F3F4F6"}
          strokeWidth={2}
        />
      </div>
      <p
        className={`font-['League_Spartan:Regular',_sans-serif] font-normal h-[13px] leading-none relative shrink-0 text-center w-full ${isActive ? "text-[#eb588c]" : "text-gray-100"}`}
      >
        Profile
      </p>
    </button>
  );
}

function NavigationItems({
  currentPage,
  onNavigate,
}: {
  currentPage: string;
  onNavigate: (page: string) => void;
}) {
  return (
    <div
      className="content-stretch flex items-center justify-between relative shrink-0 w-full"
      data-name="Navigation Items"
    >
      <NavigationItem
        isActive={currentPage === "home"}
        onClick={() => onNavigate("home")}
      />
      <NavigationItem1
        isActive={currentPage === "explore"}
        onClick={() => onNavigate("explore")}
      />
      <NavigationItem2 />
      <NavigationItem3
        isActive={currentPage === "profile"}
        onClick={() => onNavigate("profile")}
      />
    </div>
  );
}

function NavigationBar({
  currentPage,
  onNavigate,
}: {
  currentPage: string;
  onNavigate: (page: string) => void;
}) {
  return (
    <div
      className={`backdrop-blur-3xl backdrop-filter box-border content-stretch flex-col gap-[10px] items-start justify-center overflow-clip p-[16px] w-full ${currentPage === "explore" || currentPage === "episodes" ? "hidden" : "flex"}`}
      data-name="Navigation Bar"
    >
      <NavigationItems currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  );
}

export default function Homepage() {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <div
      className="bg-black relative w-full min-h-screen flex flex-col"
      data-name="Homepage"
    >
      <AnimatePresence mode="wait">
        {currentPage === "home" ? (
          <motion.div
            key="home"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Hero Section with Image */}
            <div className="relative w-full flex-shrink-0">
              {/* Background Image - extends further down */}
              <div
                className="relative w-full h-[650px] overflow-hidden"
                data-name="IMG_3806 1"
              >
                <img
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none scale-150 origin-center"
                  src={imgImg38065}
                />
              </div>

              {/* Gradient Overlay - blends from black at bottom to transparent */}
              <div className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-black via-black/90 to-transparent" />

              {/* Header */}
              <div className="absolute top-0 left-0 right-0">
                <Frame4 />
              </div>

              {/* Title, Description and Action Buttons */}
              <div className="absolute bottom-[200px] left-0 right-0">
                <Group />
              </div>
            </div>

            {/* Featured Section - positioned to overlap with hero gradient */}
            <div className="relative -mt-[180px] flex-1 pb-[110px]">
              <Container3 />
            </div>
          </motion.div>
        ) : currentPage === "explore" ? (
          <SeriesPage
            onNavigateBack={() => setCurrentPage("home")}
            onNavigateToEpisodes={() => setCurrentPage("episodes")}
          />
        ) : currentPage === "episodes" ? (
          <motion.div
            key="episodes"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute inset-0 z-20"
          >
            <EpisodesPage onNavigateBack={() => setCurrentPage("explore")} />
          </motion.div>
        ) : (
          <ProfilePage />
        )}
      </AnimatePresence>

      {/* Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 z-30">
        <NavigationBar currentPage={currentPage} onNavigate={setCurrentPage} />
      </div>
    </div>
  );
}
