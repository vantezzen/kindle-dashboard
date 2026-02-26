// Header: full date on the left, large time on the right.
// `now` is passed as a serializable string from the server page component.

interface HeaderProps {
  now: string; // ISO string
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function DashboardHeader({ now }: HeaderProps) {
  // Parse in local time
  const date = new Date(now);
  const localStr = date.toLocaleString("en-US", {
    timeZone: process.env.NEXT_PUBLIC_TIMEZONE,
  });
  const localDate = new Date(localStr);

  const dayName = DAYS[localDate.getDay()];
  const dayNum = localDate.getDate();
  const monthName = MONTHS[localDate.getMonth()];
  const hh = String(localDate.getHours()).padStart(2, "0");
  const mm = String(localDate.getMinutes()).padStart(2, "0");

  return (
    <div className="flex items-end justify-between px-4 pt-4 pb-2.5 border-b-2 border-black">
      {/* Date */}
      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
          {dayName}
        </div>
        <div className="text-[15px] font-semibold tracking-tight leading-tight">
          {dayNum} {monthName}
        </div>
      </div>

      {/* Time */}
      <div className="font-mono text-[38px] font-light tracking-[-2px] leading-none">
        {hh}:{mm}
      </div>
    </div>
  );
}
