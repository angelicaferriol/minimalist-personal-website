export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 min-h-[50vh]">
      <div className="w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
      <span className="text-[10px] font-semibold text-muted-foreground mt-3 tracking-widest uppercase animate-pulse">
        Loading page...
      </span>
    </div>
  );
}
