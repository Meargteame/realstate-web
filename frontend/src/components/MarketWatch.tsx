import { ArrowLeft, ArrowRight, TrendingUp, Building2, FileText, Mountain } from "lucide-react";
import { useRef } from "react";
import { Button } from "./ui/button";

const marketData = [
  {
    title: "Dubai Waterfront",
    desc: "Prime residential properties in Marina and Palm Jumeirah showing unprecedented growth.",
    price: "$4,250",
    unit: "/ sq ft",
    change: "+12.4%",
    isPositive: true,
    Icon: TrendingUp,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Singapore Central",
    desc: "High-end luxury units in District 9 and 10 remain highly resilient assets.",
    price: "$3,890",
    unit: "/ sq ft",
    change: "+8.3%",
    isPositive: true,
    Icon: Building2,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    title: "London Mayfair",
    desc: "Slight cooling in historic districts provides unique acquisition windows for investors.",
    price: "£5,120",
    unit: "/ sq ft",
    change: "-1.1%",
    isPositive: false,
    Icon: FileText,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    title: "Aspen Estates",
    desc: "Limited inventory in mountain resorts driving record-breaking land valuations.",
    price: "$2,950",
    unit: "/ sq ft",
    change: "+15.9%",
    isPositive: true,
    Icon: Mountain,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
];

export default function MarketWatch() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (direction: number) => {
    const container = scrollRef.current;
    if (!container) return;
    // Scroll by roughly one card width (first child) including the gap.
    const firstCard = container.firstElementChild as HTMLElement | null;
    const amount = firstCard ? firstCard.offsetWidth + 24 : container.clientWidth * 0.8;
    container.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <section className="py-20 px-6 max-w-[1400px] mx-auto w-full bg-surface-container">
      <div className="flex justify-between items-end mb-10">
        <div>
          <p className="text-[11px] font-bold tracking-wider text-primary uppercase mb-2">Live Updates</p>
          <h2 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight">Market Watch</h2>
        </div>
        <div className="hidden md:flex gap-4">
          <Button onClick={() => scrollByCards(-1)} aria-label="Scroll left" variant="outline" size="icon" className="rounded-full border-gray-300 w-12 h-12 text-gray-500 hover:text-black">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button onClick={() => scrollByCards(1)} aria-label="Scroll right" variant="outline" size="icon" className="rounded-full border-gray-300 w-12 h-12 text-gray-500 hover:text-black">
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {marketData.map((item, idx) => (
          <div key={idx} className="snap-start shrink-0 w-[85%] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] bg-white rounded-2xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-transparent hover:border-gray-100 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.iconBg}`}>
                <item.Icon className={`w-6 h-6 ${item.iconColor}`} />
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded bg-${item.isPositive ? 'green' : 'red'}-100 text-${item.isPositive ? 'green' : 'red'}-700`}>
                {item.change}
              </span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-3">{item.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-8 h-[60px]">{item.desc}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-on-surface">{item.price}</span>
              <span className="text-xs font-semibold text-gray-400">{item.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
