import svgPaths from "./svg-049cfyqcvv";
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
        <g clipPath="url(#clip0_1_164)" id="fi-bs-search">
          <path
            d={svgPaths.p1b437d80}
            fill="var(--fill-0, white)"
            fillOpacity="0.82"
            id="Vector"
          />
        </g>
        <defs>
          <clipPath id="clip0_1_164">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame() {
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

export default function Frame1() {
  return (
    <div className="relative size-full">
      <div className="flex flex-col items-end size-full">
        <div className="box-border content-stretch flex flex-col gap-[10px] items-end px-[39px] py-[31px] relative size-full">
          <Frame />
        </div>
      </div>
    </div>
  );
}
