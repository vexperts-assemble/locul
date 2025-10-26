export default function TitleAndDescription() {
  return (
    <div
      className="content-stretch flex flex-col gap-[8px] items-start leading-none relative size-full text-neutral-100"
      data-name="Title and Description"
    >
      <p className="font-['League_Spartan:Regular',_sans-serif] font-normal relative shrink-0 text-[24px] w-full">
        Chronicles of Kwa-Zulu
      </p>
      <p className="font-['League_Spartan:ExtraLight',_sans-serif] font-extralight relative shrink-0 text-[17px] w-full whitespace-pre-wrap">{`A young man attempts to learn the  culture and tradition of a clan...`}</p>
    </div>
  );
}
