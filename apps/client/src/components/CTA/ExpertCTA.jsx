import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";

const ExpertCTA = () => {
  return (
    <>
      <style>{`
        .cta-title { font-family: 'Cormorant Garamond', serif; }
        .cta-body  { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <section className="bg-stone-50 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-stone-900 shadow-2xl shadow-stone-900/20">
            {/* Background image with overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1400')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900/95 via-stone-900/80 to-stone-900/60" />

            {/* Ambient glow */}
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 p-10 md:p-16">
              {/* Left: Text */}
              <div className="flex-1 space-y-4">
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="cta-body text-amber-400 text-xs font-semibold tracking-widest uppercase">
                    Expert Guidance
                  </span>
                </div>

                <h2 className="cta-title text-3xl md:text-5xl font-light text-white leading-tight">
                  Talk to a Jaye Safaris{" "}
                  <span className="text-amber-400 italic">Tour Expert</span>
                </h2>

                <p className="cta-body text-stone-400 text-sm md:text-base leading-relaxed max-w-xl">
                  Embark on a once-in-a-lifetime African safari with Jaye
                  Safaris. Our experienced travel specialists are available 24/7
                  via WhatsApp, phone, or our inquiry form to assist you.
                  Whether you’re planning a wildlife safari, leisure escape,
                  cultural experience, or a tailor-made journey, we are ready to
                  design a seamless and unforgettable adventure crafted around
                  your vision.{" "}
                  <span className="text-stone-300 italic">
                    safari, leisure, culture & more.
                  </span>{" "}
                  Let us bring your dream safari to life.
                </p>

                {/* Trust row */}
                <div className="flex flex-wrap gap-6 pt-2">
                  {[
                    "Available 24/7",
                    "No booking fees",
                    "Tailored itineraries",
                  ].map((t) => (
                    <span
                      key={t}
                      className="cta-body flex items-center gap-1.5 text-stone-500 text-xs"
                    >
                      <span className="w-1 h-1 rounded-full bg-amber-500" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: CTAs */}
              <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto">
                <Link to="/inquiry-form">
                  <button className="cta-body w-full md:w-auto inline-flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-amber-900/30 text-sm whitespace-nowrap">
                    Meet with an Expert
                    <ArrowRight
                      size={16}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </Link>
                <a
                  href="https://wa.me/yourphonenumber"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="cta-body w-full md:w-auto inline-flex items-center justify-center gap-3 border border-stone-700 hover:border-stone-500 text-stone-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-all text-sm whitespace-nowrap">
                    <MessageCircle size={15} className="text-green-400" />
                    Chat on WhatsApp
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ExpertCTA;
