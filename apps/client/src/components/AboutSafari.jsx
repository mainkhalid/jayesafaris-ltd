import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

const offerings = [
  "Private 4x4 Land Cruiser safaris from Nairobi",
  "Budget and luxury safari options",
  "Professional English-speaking driver-guides",
  "Carefully selected lodges and tented camps",
  "Flexible departures year-round",
];

const AboutSafari = () => {
  return (
    <>
      <style>{`
        .as-title { font-family: 'Cormorant Garamond', serif; }
        .as-body  { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <section className="max-w-7xl mx-auto px-6 py-20 as-body">
        <div className="grid md:grid-cols-2 gap-16 items-start">

          {/* ── Left: Text ── */}
          <div>
            
            {/* Heading */}
            <h2 className="as-title text-4xl md:text-5xl font-light text-stone-800 leading-tight mb-4">
              Kenya Safari Tours{" "}
              <span className="text-amber-500 italic">Tailored to You</span>
            </h2>

            <p className="as-body text-stone-500 text-sm font-medium mb-6">
              Private, Budget & Luxury Safari Packages from Nairobi to the Wild.
            </p>

            {/* Body copy */}
            <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
              <p>
                Welcome to JayeSafaris — your trusted local operator for unforgettable{" "}
                <span className="text-amber-600 font-semibold">Kenya safari tours</span>. Whether you're planning a
                once-in-a-lifetime{" "}
                <span className="text-amber-600 font-semibold">Masai Mara safari package</span>, an affordable
                budget safari, or a custom private tour, we turn your dream into a thrilling African adventure.
              </p>
              <p>
                From the iconic plains of the{" "}
                <span className="text-amber-600 font-semibold">Masai Mara</span> to the red-soil wilderness of{" "}
                <span className="text-amber-600 font-semibold">Tsavo East</span> and the coast-to-savannah
                transition from <span className="text-amber-600 font-semibold">Diani</span>, we offer
                handcrafted experiences built around your interests, timeline, and budget.
              </p>
            </div>

            {/* ── What We Offer ── */}
            <div className="mt-10 bg-stone-50 border border-stone-100 rounded-2xl p-6">
              <h3 className="as-title text-xl font-light text-stone-800 mb-5">What We Provide</h3>

              <ul className="space-y-3 mb-6">
                {offerings.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={11} className="text-amber-600" strokeWidth={3} />
                    </div>
                    <span className="as-body text-stone-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>

              <p className="as-body text-stone-500 text-sm leading-relaxed border-t border-stone-200 pt-5">
                From the{" "}
                <span className="text-stone-700 font-semibold">Great Migration in the Masai Mara</span> to
                elephants in <span className="text-stone-700 font-semibold">Amboseli</span> beneath Mount
                Kilimanjaro, Jaye Safaris delivers authentic wildlife experiences with personalized service
                and competitive pricing.{" "}
                <span className="text-amber-600 font-semibold">
                  Start planning with confidence — travel with local expertise.
                </span>
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/packages">
                <button className="as-body inline-flex items-center gap-2 bg-stone-900 hover:bg-amber-500 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md">
                  Discover More
                  <ArrowRight size={15} />
                </button>
              </Link>
              <Link to="/inquiry-form">
                <button className="as-body inline-flex items-center gap-2 border border-stone-200 hover:border-amber-400 text-stone-700 hover:text-amber-600 px-7 py-3.5 rounded-xl font-bold text-sm transition-all">
                  Plan My Safari →
                </button>
              </Link>
            </div>
          </div>

          {/* ── Right: Image ── */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl aspect-[4/5]">
              <img
                src="https://i.pinimg.com/736x/20/47/67/2047671daec72970c219a0bb41f766f6.jpg"
                alt="Kenya Safari Landscape"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-stone-900 rounded-2xl px-5 py-4 shadow-xl">
              <p className="as-title text-3xl font-light text-amber-400">15+</p>
              <p className="as-body text-stone-400 text-xs uppercase tracking-wider mt-0.5">Years of expertise</p>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default AboutSafari;