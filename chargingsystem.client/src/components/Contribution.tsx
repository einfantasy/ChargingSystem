import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* ── Data ─────────────────────────────────────────────── */
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ── Configurable Parameters ──────────────────────────── */

// Year selector range
const YEAR_RANGE_SPAN = 25; // ±25 years from current year → 51 options

// Cell colors
const CELL_ACTIVE_COLOR = '#450A4F';
const CELL_CONTRIBUTION_LIGHT_COLOR = '#3C8031';
const CELL_CONTRIBUTION_COLOR = '#5DC74D';
const CELL_CONTRIBUTION_BRIGHT_COLOR = '#77FF63';
const CELL_EMPTY_COLOR = 'transparent';

// Cell sizes (Tailwind classes)
const DESKTOP_CELL_SIZE = 'w-3 h-3';
const MOBILE_CELL_SIZE = 'w-4 h-4';
const CELL_BORDER_RADIUS = 'rounded-sm';

// Gap spacing (Tailwind classes)
const DESKTOP_GAP = 'gap-1';
const MOBILE_GAP = 'gap-[5px]';

// Font sizes (Tailwind classes)
const LABEL_FONT_SIZE = 'text-[10px]';
const TITLE_FONT_SIZE = 'text-xs lg:text-sm';

// Label text colors
const TITLE_TEXT_COLOR = 'text-purple-300';
const LABEL_TEXT_COLOR = 'text-slate-400';
const SELECT_TEXT_COLOR = 'text-white';

// Navigation button icon size
const NAV_ICON_SIZE = 16;

/* ── Shared Style Classes ─────────────────────────────── */

// Container card
const CARD_CLASS = [
    'bg-white/10',
    'backdrop-blur-md',
    'border border-white/10',
    'p-4 lg:p-5',
    'rounded-xl',
    'shadow-lg transition-all duration-300',
    'hover:bg-white/20 hover:shadow-xl',
    'flex justify-center w-full',
    'overflow-x-auto lg:overflow-x-auto overflow-y-auto lg:overflow-y-hidden',
].join(' ');

// Header row
const HEADER_CLASS = 'flex items-center justify-between mb-1';
const HEADER_TITLE_CLASS = [TITLE_TEXT_COLOR, TITLE_FONT_SIZE, 'font-medium whitespace-nowrap'].join(' ');
const HEADER_NAV_CLASS = 'flex items-center gap-2';

// Navigation button
const NAV_BUTTON_CLASS = [
    'p-1',
    TITLE_TEXT_COLOR,
    'hover:text-white',
    'transition-colors',
    'rounded-lg',
    'hover:bg-white/10',
].join(' ');

// Year select dropdown
const SELECT_CLASS = [
    'bg-white/5',
    SELECT_TEXT_COLOR,
    'border border-white/10',
    'backdrop-blur-sm',
    'rounded-lg px-2 py-1 text-sm',
    'focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40',
    'cursor-pointer transition-all duration-200',
].join(' ');

const SELECT_OPTION_CLASS = 'bg-slate-800';

// Weekday label
const WEEKDAY_LABEL_CLASS = [
    'w-10 h-3 flex items-center justify-end',
    LABEL_FONT_SIZE,
    LABEL_TEXT_COLOR,
    'leading-none',
].join(' ');

const MOBILE_WEEKDAY_LABEL_CLASS = [
    MOBILE_CELL_SIZE.replace('h-', 'w-'),
    LABEL_FONT_SIZE,
    LABEL_TEXT_COLOR,
    'leading-4 text-center',
].join(' ');

// Month label
const MONTH_LABEL_CLASS = [
    DESKTOP_CELL_SIZE.replace('h-', 'w-'),
    LABEL_FONT_SIZE,
    LABEL_TEXT_COLOR,
    'leading-3 text-center',
].join(' ');

// Mobile container
const MOBILE_CONTAINER_CLASS = [
    'flex flex-col min-w-fit lg:hidden',
    'max-h-[calc(56dvh-100px)] overflow-y-auto pr-3',
].join(' ');

// Mobile month label column
const MOBILE_MONTH_LABEL_CLASS = [
    'w-4 shrink-0 h-4',
    'flex items-center justify-center',
    LABEL_FONT_SIZE,
    LABEL_TEXT_COLOR,
    'leading-none',
].join(' ');

/* ── Types ────────────────────────────────────────────── */
interface WeekDay {
    month: number | null;
    day: number | null;
}

export default function Contribution() {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [contributionHours, setContributionHours] = useState<Map<string, number>>(new Map());

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        fetch(`/api/consume/query_contribution?queryYear=${year}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (res) => {
                if (!res.ok) throw new Error('Fetch failed');
                return res.json();
            })
            .then((data: { date: string; hour: number }[]) => {
                const hoursMap = new Map<string, number>();
                for (const item of data) {
                    const d = new Date(item.date);
                    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                    hoursMap.set(key, item.hour);
                }
                setContributionHours(hoursMap);
            })
            .catch(() => {
                setContributionHours(new Map());
            });
    }, [year]);

    const { weeks, monthFirstDayCol, monthDay1Row } = useMemo(() => {
        const firstDay = new Date(year, 0, 1);

        const startSunday = new Date(firstDay);
        startSunday.setDate(startSunday.getDate() - startSunday.getDay());

        const weeks: WeekDay[][] = [];
        const cursor = new Date(startSunday);

        while (true) {
            const weekDays: WeekDay[] = [];
            for (let r = 0; r < 7; r++) {
                const d = new Date(cursor);
                d.setDate(d.getDate() + r);
                const inYear = d.getFullYear() === year;
                weekDays.push({
                    month: inYear ? d.getMonth() : null,
                    day: inYear ? d.getDate() : null,
                });
            }
            weeks.push(weekDays);
            cursor.setDate(cursor.getDate() + 7);
            if (cursor.getFullYear() > year) break;
        }

        const firstDayCol: Record<number, number> = {};
        for (let col = 0; col < weeks.length; col++) {
            for (const wd of weeks[col]) {
                if (wd.day === 1 && wd.month !== null) {
                    firstDayCol[wd.month] = col;
                }
            }
        }

        const day1Row: Record<number, number> = {};
        for (let row = 0; row < weeks.length; row++) {
            for (const wd of weeks[row]) {
                if (wd.day === 1 && wd.month !== null) {
                    day1Row[wd.month] = row;
                }
            }
        }

        return { weeks, monthFirstDayCol: firstDayCol, monthDay1Row: day1Row };
    }, [year]);

    const prevYear = () => setYear(y => y - 1);
    const nextYear = () => setYear(y => y + 1);

    /* ── Year Options ─────────────────────────────────── */
    const yearOptions = useMemo(
        () =>
            Array.from({ length: YEAR_RANGE_SPAN * 2 + 1 }, (_, i) => currentYear - YEAR_RANGE_SPAN + i),
        [currentYear]
    );

    /* ── Cell Renderer ────────────────────────────────── */
    const renderCell = (wd: WeekDay, key: number, sizeClass: string) => {
        const dateKey = wd.month !== null && wd.day !== null ? `${year}-${wd.month}-${wd.day}` : null;
        const hour = dateKey ? contributionHours.get(dateKey) : undefined;

        let bgColor = wd.day ? CELL_ACTIVE_COLOR : CELL_EMPTY_COLOR;
        if (hour !== undefined) {
            bgColor = hour <= 4 ? CELL_CONTRIBUTION_LIGHT_COLOR : hour <= 8 ? CELL_CONTRIBUTION_COLOR : CELL_CONTRIBUTION_BRIGHT_COLOR;
        }

        return (
            <div
                key={key}
                className={`${sizeClass} ${CELL_BORDER_RADIUS}`}
                style={{ backgroundColor: bgColor }}
                title={wd.day ? `${year}年${wd.month! + 1}月${wd.day}日` : undefined}
            />
        );
    };

    return (
        <div className={CARD_CLASS}>
            <div className="min-w-fit">
                {/* ── Header ──────────────────────────────────────── */}
                <div className={HEADER_CLASS}>
                    <h3 className={HEADER_TITLE_CLASS}>上课记录</h3>
                    <div className={HEADER_NAV_CLASS}>
                        <button onClick={prevYear} className={NAV_BUTTON_CLASS}>
                            <ChevronLeft size={NAV_ICON_SIZE} />
                        </button>
                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className={SELECT_CLASS}
                        >
                            {yearOptions.map(y => (
                                <option key={y} value={y} className={SELECT_OPTION_CLASS}>{y}</option>
                            ))}
                        </select>
                        <button onClick={nextYear} className={NAV_BUTTON_CLASS}>
                            <ChevronRight size={NAV_ICON_SIZE} />
                        </button>
                    </div>
                </div>

                {/* ── Desktop View ──────────────────────────────── */}
                <div className="flex min-w-fit hidden lg:flex">
                    {/* Weekday labels */}
                    <div className={`flex flex-col ${DESKTOP_GAP} mr-1 shrink-0`}>
                        <div className="h-3" />
                        {WEEKDAYS.map((d, i) => (
                            <div key={i} className={WEEKDAY_LABEL_CLASS}>{d}</div>
                        ))}
                    </div>

                    <div className="flex flex-col">
                        {/* Month labels */}
                        <div className={`flex ${DESKTOP_GAP} h-3 mb-1`}>
                            {weeks.map((week, col) => {
                                const firstDayEntry = week.find(wd => wd.day === 1);
                                if (!firstDayEntry) return <div key={col} className="w-3" />;
                                const month = firstDayEntry.month!;
                                if (monthFirstDayCol[month] !== col) return <div key={col} className="w-3" />;

                                return (
                                    <div key={col} className={MONTH_LABEL_CLASS}>
                                        {MONTH_NAMES[month]}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Grid */}
                        <div className={`flex ${DESKTOP_GAP}`}>
                            {weeks.map((week, col) => (
                                <div key={col} className={`flex flex-col ${DESKTOP_GAP}`}>
                                    {week.map((wd, r) => renderCell(wd, r, DESKTOP_CELL_SIZE))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Mobile View ───────────────────────────────── */}
                <div className={MOBILE_CONTAINER_CLASS}>
                    <div className={`flex flex-col ${MOBILE_GAP}`}>
                        {/* Weekday labels */}
                        <div className={`flex ${MOBILE_GAP}`}>
                            <div className="w-4 shrink-0" />
                            {WEEKDAYS.map((d, i) => (
                                <div key={i} className={MOBILE_WEEKDAY_LABEL_CLASS}>{d}</div>
                            ))}
                        </div>

                        {/* Grid rows */}
                        {weeks.map((week, row) => {
                            const day1Entry = week.find(wd => wd.day === 1 && wd.month !== null);
                            const showMonth = day1Entry && monthDay1Row[day1Entry.month!] === row;

                            return (
                                <div key={row} className={`flex items-center ${MOBILE_GAP}`}>
                                    <div className={MOBILE_MONTH_LABEL_CLASS}>
                                        {showMonth ? MONTH_NAMES[day1Entry.month!] : ''}
                                    </div>
                                    {week.map((wd, col) => renderCell(wd, col, MOBILE_CELL_SIZE))}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Legend ───────────────────────────────────────── */}
                <div className="flex items-center justify-center gap-3 mt-3">
                    {[
                        { color: CELL_ACTIVE_COLOR, label: '无课时' },
                        { color: CELL_CONTRIBUTION_LIGHT_COLOR, label: '≤4h' },
                        { color: CELL_CONTRIBUTION_COLOR, label: '4~8h' },
                        { color: CELL_CONTRIBUTION_BRIGHT_COLOR, label: '>8h' },
                    ].map((item) => (
                        <div key={item.label} className="flex items-center gap-1">
                            <div className={`w-3 h-3 ${CELL_BORDER_RADIUS}`} style={{ backgroundColor: item.color }} />
                            <span className={LABEL_TEXT_COLOR + ' ' + LABEL_FONT_SIZE}>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
