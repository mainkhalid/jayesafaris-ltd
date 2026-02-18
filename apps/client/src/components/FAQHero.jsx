import { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const faqs = [
  {
    question: "What's the best time to visit national parks?",
    answer:
      "The ideal visiting season varies by location. Spring and fall typically offer pleasant weather, fewer crowds, and active wildlife. Summer is peak season with full facility access, while winter provides unique experiences like snow sports and solitude.",
  },
  {
    question: "How long should I plan for my trip?",
    answer:
      "We recommend at least 5–7 days to fully experience the highlights of most destinations. This allows time for acclimatization, game drives, cultural experiences, and relaxation without feeling rushed.",
  },
  {
    question: "Are meals provided during the expedition?",
    answer:
      "Yes, all meals are included in our packages — from hearty breakfasts to gourmet dinners. We cater to dietary restrictions and preferences when notified in advance. Bush dinners and picnic lunches add to the adventure.",
  },
  {
    question: "What wildlife can I expect to see?",
    answer:
      "Depending on your destination, you may encounter elephants, lions, leopards, rhinos, buffalo, giraffes, zebras, and hundreds of bird species. Wildlife sightings vary by season, location, and the luck of nature.",
  },
  {
    question: "Do you offer family-friendly tours?",
    answer:
      "Absolutely! We have specially designed family packages with age-appropriate activities, shorter game drives, and accommodations that welcome children. Many lodges offer kids' programmes and family suites.",
  },
  {
    question: "What level of fitness is required?",
    answer:
      "Most of our tours require minimal physical fitness as game drives are the primary activity. Walking safaris and hiking excursions are optional and clearly marked with difficulty levels in the itinerary.",
  },
];

export default function FAQHero() {
  const [openIndex, setOpenIndex] = useState(0);
  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <>
      <style>{`
        .faq-title { font-family: 'Cormorant Garamond', serif; }
        .faq-body  { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <section className="relative overflow-hidden bg-stone-900">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1600')" }}
        />
        {/* Overlay — same gradient style as site hero */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/95 via-stone-900/80 to-stone-900/50" />

        {/* Ambient glows */}
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Left: Hero copy */}
            <div className="space-y-8">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="faq-body text-amber-400 text-xs font-semibold tracking-widest uppercase">
                  Safari FAQ
                </span>
              </div>

              {/* Heading */}
              <div>
                <h1 className="faq-title text-5xl lg:text-6xl font-light text-white leading-tight">
                  Your Questions,
                </h1>
                <h1 className="faq-title text-5xl lg:text-6xl font-light text-amber-400 leading-tight">
                  Answered.
                </h1>
              </div>

              <p className="faq-body text-stone-400 text-base leading-relaxed max-w-md">
                Everything you need to know before embarking on your East African
                adventure. Can't find what you're looking for? Our team is always
                happy to help.
              </p>

              <Link to="/inquiry-form">
                <button className="faq-body group inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-amber-900/30">
                  Plan My Safari
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-stone-800">
                {[
                  { value: "500+", label: "Tours Completed" },
                  { value: "98%",  label: "Happy Travellers" },
                  { value: "15+",  label: "Destinations" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <div className="faq-title text-3xl font-light text-amber-400">{value}</div>
                    <div className="faq-body text-xs text-stone-500 mt-1 uppercase tracking-wider">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: FAQ accordion */}
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className={`rounded-xl border overflow-hidden transition-all duration-200 ${
                    openIndex === i
                      ? "border-amber-500/40"
                      : "border-stone-700/60 hover:border-stone-600"
                  }`}
                  style={{
                    background: openIndex === i ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
                  }}
                >
                  <button
                    onClick={() => toggle(i)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center gap-4"
                  >
                    <span className={`faq-body font-medium text-sm leading-snug transition-colors ${
                      openIndex === i ? "text-white" : "text-stone-300"
                    }`}>
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 transition-all duration-300 ${
                        openIndex === i ? "rotate-180 text-amber-400" : "text-stone-500"
                      }`}
                    />
                  </button>

                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    openIndex === i ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                  }`}>
                    <p className="faq-body px-6 pb-5 pt-3 text-stone-400 text-sm leading-relaxed border-t border-stone-700/50">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}

              <p className="faq-body text-center text-stone-600 text-xs pt-3">
                Still have questions?{" "}
                <Link to="/contact" className="text-amber-500 hover:text-amber-400 underline underline-offset-2 transition-colors">
                  Contact our safari experts
                </Link>
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}