import svgPaths from "../imports/svg-7rdnjssp7n";
import imgImg38062 from "figma:asset/a8f5b0823315e214a77a21062ee3cc97ecb80118.png";
import imgImg38063 from "figma:asset/ef52dfe92c6bfe99dcd2568b0d65aa8729c23e3f.png";
import imgImg38064 from "figma:asset/e8bda3e3af22116533e5e4173709b018be2d4b18.png";
import imgScreenshot20250913At0723561 from "figma:asset/ae4790770ff20e3d51318aa3e4e24dabaa379eb0.png";

function FiBsSearch() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="fi-bs-search">
      <svg
        className="block size-full"
        fill="none"
        preserveAspectRatio="none"
        viewBox="0 0 24 24"
      >
        <g clipPath="url(#clip0_1_1119)" id="fi-bs-search">
          <path
            d={svgPaths.p1b437d80}
            fill="var(--fill-0, white)"
            fillOpacity="0.82"
            id="Vector"
          />
        </g>
        <defs>
          <clipPath id="clip0_1_1119">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Header() {
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

function Button() {
  return (
    <div
      className="bg-[#eb588c] h-[40px] relative rounded-[8px] shrink-0 w-full"
      data-name="Button"
    >
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex gap-[8px] h-[40px] items-center justify-center p-[12px] relative w-full">
          <p className="font-['League_Spartan:Regular',_sans-serif] font-normal leading-none relative shrink-0 text-neutral-100 text-nowrap whitespace-pre">
            Top-Up
          </p>
        </div>
      </div>
    </div>
  );
}

function WalletInfo() {
  return (
    <div
      className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full"
      data-name="Wallet Info"
    >
      <p className="font-['League_Spartan:Regular',_sans-serif] font-normal leading-none relative shrink-0 text-neutral-100 w-full">
        My Wallet
      </p>
      <p className="font-['League_Spartan:Thin',_sans-serif] font-thin leading-none relative shrink-0 text-neutral-100 w-full">
        R310.25
      </p>
      <Button />
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
        My Watchlist
      </p>
    </div>
  );
}

function Frame() {
  return (
    <div className="basis-0 bg-[#b3b3b3] grow h-[183px] min-h-px min-w-[120px] overflow-clip relative rounded-[9px] shadow-[0px_2px_20.5px_2px_rgba(0,0,0,0.37)] shrink-0">
      <img
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        src={imgImg38062}
      />
    </div>
  );
}

function Frame1() {
  return (
    <div className="basis-0 bg-[#b3b3b3] grow h-[183px] min-h-px min-w-[120px] overflow-clip relative rounded-[9px] shadow-[0px_2px_20.5px_2px_rgba(0,0,0,0.37)] shrink-0">
      <img
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        src={imgImg38063}
      />
    </div>
  );
}

function Frame2() {
  return (
    <div className="basis-0 bg-[#b3b3b3] grow h-[183px] min-h-px min-w-[120px] overflow-clip relative rounded-[9px] shadow-[0px_2px_20.5px_2px_rgba(0,0,0,0.37)] shrink-0">
      <img
        alt=""
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        src={imgImg38064}
      />
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
      className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <Container />
      <Container2 />
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div
        aria-hidden="true"
        className="absolute border-[1px_0px] border-[rgba(255,255,255,0.14)] border-solid inset-0 pointer-events-none"
      />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[16px] items-start p-[8px] relative w-full">
          <p className="font-['League_Spartan:Light',_sans-serif] font-light leading-none relative shrink-0 text-neutral-100 text-nowrap whitespace-pre">
            Watch History
          </p>
        </div>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div
        aria-hidden="true"
        className="absolute border-[0px_0px_1px] border-[rgba(255,255,255,0.14)] border-solid inset-0 pointer-events-none"
      />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[16px] items-start p-[8px] relative w-full">
          <p className="font-['League_Spartan:Light',_sans-serif] font-light leading-none relative shrink-0 text-neutral-100 text-nowrap whitespace-pre">{`Settings & Notifications`}</p>
        </div>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div
        aria-hidden="true"
        className="absolute border-[0px_0px_1px] border-[rgba(255,255,255,0.14)] border-solid inset-0 pointer-events-none"
      />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[16px] items-start p-[8px] relative w-full">
          <p className="font-['League_Spartan:Light',_sans-serif] font-light leading-none relative shrink-0 text-neutral-100 text-nowrap whitespace-pre">{`Payment Methods & History`}</p>
        </div>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div
      className="content-stretch flex flex-col items-start relative shrink-0 w-full"
      data-name="Container"
    >
      <Container4 />
      <Container5 />
      <Container6 />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div
      className="bg-black relative w-full min-h-screen flex flex-col pb-[110px]"
      data-name="My Stuff"
    >
      <div className="box-border content-stretch flex flex-col gap-[10px] items-center px-[20px] py-[31px] w-full">
        <Header />
      </div>

      <div className="content-stretch flex flex-col gap-[40px] items-start px-[20px] w-full">
        <WalletInfo />
        <Container3 />
        <Container7 />
      </div>
    </div>
  );
}
