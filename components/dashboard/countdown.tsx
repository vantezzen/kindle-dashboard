interface CountdownProps {
  now: string; // ISO string
}

export function Countdown({ now }: CountdownProps) {
  const date = new Date(now);
  const goal = new Date("2026-10-27T00:00:00Z");

  const diff = goal.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  const dayName = "Thesis";

  return (
    <div className="flex items-end justify-between px-5 py-3 border-b-2 border-black">
      <div className="text-[20px] font-bold text-muted-foreground">
        {dayName}
      </div>
      <div className="text-[20px] font-bold">
        {days} days, {hours}h, {minutes}min
      </div>
    </div>
  );
}
