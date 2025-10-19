export function Tick({
  position = ['top-left', 'bottom-right'],
}: {
  position?: ('top-left' | 'top-right' | 'bottom-left' | 'bottom-right')[];
}) {
  return (
    <>
      {position.includes('top-left') && (
        <div className="-left-[1px] absolute top-0 max-md:hidden">
          <div className="-left-[6px] md:-left-[11px] absolute top-0 h-[12px] w-[12px] border-gray-400 border-t-[1px] md:top-0 md:h-[22px] md:w-[22px] dark:border-gray-500" />
          <div className="-top-[6px] md:-top-[11px] absolute left-0 h-[12px] w-[12px] border-gray-400 border-l-[1px] md:h-[22px] md:w-[22px] dark:border-gray-500" />
        </div>
      )}
      {position.includes('top-right') && (
        <div className="-right-[1px] absolute top-0 max-md:hidden">
          <div className="-left-[6px] md:-left-[11px] absolute top-0 h-[12px] w-[12px] border-gray-400 border-t-[1px] md:top-0 md:h-[22px] md:w-[22px] dark:border-gray-500" />
          <div className="-top-[6px] md:-top-[11px] absolute left-0 h-[12px] w-[12px] border-gray-400 border-l-[1px] md:h-[22px] md:w-[22px] dark:border-gray-500" />
        </div>
      )}
      {position.includes('bottom-left') && (
        <div className="-left-[1px] absolute bottom-0 max-md:hidden">
          <div className="-left-[6px] md:-left-[11px] absolute top-0 h-[12px] w-[12px] border-gray-400 border-t-[1px] md:top-0 md:h-[22px] md:w-[22px] dark:border-gray-500" />
          <div className="-top-[6px] md:-top-[11px] absolute left-0 h-[12px] w-[12px] border-gray-400 border-l-[1px] md:h-[22px] md:w-[22px] dark:border-gray-500" />
        </div>
      )}
      {position.includes('bottom-right') && (
        <div className="-right-[1px] absolute bottom-0 max-md:hidden">
          <div className="-left-[6px] md:-left-[11px] absolute top-0 h-[12px] w-[12px] border-gray-400 border-t-[1px] md:top-0 md:h-[22px] md:w-[22px] dark:border-gray-500" />
          <div className="-top-[6px] md:-top-[11px] absolute left-0 h-[12px] w-[12px] border-gray-400 border-l-[1px] md:h-[22px] md:w-[22px] dark:border-gray-500" />
        </div>
      )}
    </>
  );
}
