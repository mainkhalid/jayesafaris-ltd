import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users, Award, Target, Heart, Shield, Globe,
  CheckCircle, Star, ChevronLeft, ChevronRight, ArrowRight, Quote,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "/api";

const values = [
  { icon: Heart,  title: "Passion for Wildlife",   description: "We are deeply committed to wildlife conservation and sustainable tourism practices that protect Africa's natural heritage." },
  { icon: Shield, title: "Safety First",            description: "Your safety is our top priority. We maintain the highest standards in vehicle maintenance, guide training, and emergency preparedness." },
  { icon: Users,  title: "Personalized Service",   description: "Every traveler is unique. We take time to understand your dreams and craft personalized safari experiences that exceed expectations." },
  { icon: Award,  title: "Excellence",              description: "We strive for excellence in every aspect of our service, from planning to execution, ensuring memorable experiences." },
  { icon: Globe,  title: "Local Expertise",         description: "Our team of local experts brings insider knowledge and authentic cultural experiences to every safari adventure." },
  { icon: Target, title: "Sustainability",           description: "We partner with eco-friendly lodges and support local communities, ensuring tourism benefits both people and nature." },
];

const testimonials = [
  { name: "John & Mary Peterson", country: "United States", image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&q=80", rating: 5, text: "Our 10-day Kenya safari with Jayesafaris was absolutely incredible! From the moment we landed to our departure, everything was perfectly organized. We saw the Big Five, witnessed the Great Migration, and stayed in stunning lodges.", tour: "10-Day Kenya Safari Adventure" },
  { name: "Sophie Laurent",       country: "France",         image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80", rating: 5, text: "I traveled solo and felt completely safe and well taken care of. The team went above and beyond to ensure I had an amazing experience. The Masai Mara exceeded all my expectations.", tour: "7-Day Masai Mara Explorer" },
  { name: "Robert & Lisa Chen",   country: "Australia",      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80", rating: 5, text: "We booked a custom honeymoon safari and it was worth every penny. The attention to detail was impressive — romantic sundowners, private game drives, and luxury accommodations. Thank you!", tour: "Custom Honeymoon Safari" },
];

const certs = [
  "Licensed by Kenya Tourism Board",
  "Member of Kenya Association of Tour Operators",
  "Eco-Tourism Kenya Certified",
  "TripAdvisor Certificate of Excellence",
];

const About = () => {
  const [current,     setCurrent]     = useState(0);
  const [team,        setTeam]        = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);

  // Fetch live team from API
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res  = await fetch(`${API}/team/all`);
        const json = await res.json();
        setTeam((json.data || []).filter((m) => m.isVisible !== false));
      } catch {
        // Silently fail — team section will be empty rather than crashing
        setTeam([]);
      } finally {
        setTeamLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const prev = () => setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((p) => (p + 1) % testimonials.length);

  return (
    <>
      <style>{`
        .ab-title { font-family: 'Cormorant Garamond', serif; }
        .ab-body  { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.8s ease both; }
      `}</style>

      <div className="min-h-screen bg-stone-50 ab-body">

        {/* ── Hero ── */}
        <section className="relative h-[80vh] flex items-end overflow-hidden">
          <img
            src="https://i.pinimg.com/736x/21/6a/bb/216abbcf2695b12a33c7170072e8422c.jpg"
            alt="About Jaye Safaris"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-stone-900/10" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-8 pb-16 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 mb-5 fade-up">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="ab-body text-amber-400 text-xs font-semibold tracking-widest uppercase">Our Story</span>
            </div>
            <h1 className="ab-title text-5xl md:text-7xl font-light text-white leading-tight mb-5 fade-up max-w-3xl">
              Our Journey,{" "}
              <span className="text-amber-400 italic">Your Discovery</span>
            </h1>
            <p className="ab-body text-stone-300 text-base md:text-lg max-w-xl leading-relaxed mb-8 fade-up">
              Crafting world-class East African safari adventures since 2009. Join us in celebrating the untamed wild.
            </p>
            <Link to="/inquiry-form">
              <button className="ab-body group inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-white px-8 py-4 rounded-xl font-bold text-sm shadow-lg shadow-amber-900/30 transition-all fade-up">
                Start Your Story
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </section>

        {/* ── Our Story ── */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="ab-body text-amber-700 text-xs font-semibold tracking-widest uppercase">Founded 2023</span>
              </div>
              <h2 className="ab-title text-4xl md:text-5xl font-light text-stone-800 mb-8 leading-tight">
                Born from a love of Africa's wild places
              </h2>
              <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
                <p>Founded by Joseph Kebagendi, a passionate wildlife enthusiast and conservationist, Jayesafaris was born from a simple dream: to share the breathtaking beauty of East Africa's wildlife with travelers from around the world.</p>
                <p>What started as a small operation with a single safari vehicle has grown into one of Kenya's most trusted safari companies, serving thousands of happy travelers from over 50 countries.</p>
                <p>Today, we operate throughout Kenya, Tanzania, Uganda, and Zanzibar — offering everything from budget-friendly camping safaris to luxury lodge experiences. Despite our growth, we've maintained our core values: personalized service, sustainability, and life-changing experiences.</p>
                <p>We don't just organize trips — we create memories that last a lifetime.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="https://i.pinimg.com/736x/7f/d4/03/7fd40343a61823fd4d1211c3512776b8.jpg" alt="Safari"     className="rounded-2xl w-full h-56 object-cover shadow-md" />
              <img src="https://i.pinimg.com/736x/d7/3d/87/d73d875d85ec84774b15721f384ba1b6.jpg" alt="Wildlife"   className="rounded-2xl w-full h-56 object-cover shadow-md mt-8" />
              <img src="https://i.pinimg.com/736x/53/4c/aa/534caabdbdc0b527b029e27d9c845c81.jpg" alt="Landscape"  className="rounded-2xl w-full h-56 object-cover shadow-md -mt-8" />
              <img src="https://i.pinimg.com/736x/c0/71/e3/c071e3b698b08715ab9a502cf3238dcf.jpg" alt="Adventure"  className="rounded-2xl w-full h-56 object-cover shadow-md" />
            </div>
          </div>
        </section>

        {/* ── Values ── */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="ab-body text-amber-700 text-xs font-semibold tracking-widest uppercase">What Drives Us</span>
              </div>
              <h2 className="ab-title text-4xl md:text-5xl font-light text-stone-800">Our Core Values</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map(({ icon: Icon, title, description }) => (
                <div key={title} className="group bg-stone-50 hover:bg-white rounded-2xl p-7 border border-stone-100 hover:border-amber-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center mb-5 transition-colors">
                    <Icon size={22} className="text-amber-600" />
                  </div>
                  <h3 className="ab-title text-xl font-light text-stone-800 mb-2">{title}</h3>
                  <p className="ab-body text-stone-500 text-sm leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Team ── */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="ab-body text-amber-700 text-xs font-semibold tracking-widest uppercase">The People</span>
            </div>
            <h2 className="ab-title text-4xl md:text-5xl font-light text-stone-800">Meet Our Team</h2>
          </div>

          {teamLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm animate-pulse">
                  <div className="aspect-square bg-stone-100" />
                  <div className="p-5 space-y-2">
                    <div className="h-4 bg-stone-100 rounded w-2/3 mx-auto" />
                    <div className="h-3 bg-stone-50  rounded w-1/2 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : team.length === 0 ? (
            <p className="text-center text-stone-400 text-sm italic">Team information coming soon.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map(({ _id, name, role, imageUrl, bio }) => (
                <div key={_id} className="group bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="aspect-square overflow-hidden bg-stone-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl} alt={name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-stone-300">
                        {name[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="p-5 text-center">
                    <h3 className="ab-title text-lg font-light text-stone-800">{name}</h3>
                    <p className="ab-body text-xs font-bold text-amber-600 uppercase tracking-wider mt-1 mb-2">{role}</p>
                    {bio && <p className="ab-body text-xs text-stone-400">{bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Certifications ── */}
        <section className="bg-stone-900 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="ab-body text-amber-400 text-xs font-semibold tracking-widest uppercase">Accredited</span>
              </div>
              <h2 className="ab-title text-4xl md:text-5xl font-light text-white">Certified & Trusted</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {certs.map((cert) => (
                <div key={cert} className="bg-white/5 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-6 text-center transition-all group">
                  <CheckCircle size={28} className="mx-auto mb-3 text-amber-500 group-hover:scale-110 transition-transform" />
                  <p className="ab-body text-stone-300 text-xs leading-relaxed">{cert}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="ab-body text-amber-700 text-xs font-semibold tracking-widest uppercase">Traveller Stories</span>
            </div>
            <h2 className="ab-title text-4xl md:text-5xl font-light text-stone-800">What Our Travelers Say</h2>
          </div>

          <div className="relative bg-white rounded-3xl border border-stone-100 shadow-xl p-8 md:p-12 max-w-4xl mx-auto overflow-hidden">
            <Quote size={80} className="absolute -top-2 -left-2 text-amber-100 rotate-180" />
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                <img
                  src={testimonials[current].image}
                  alt={testimonials[current].name}
                  className="w-20 h-20 rounded-full object-cover shadow-md ring-2 ring-amber-200 shrink-0"
                />
                <div className="text-center sm:text-left">
                  <div className="flex gap-1 justify-center sm:justify-start mb-2">
                    {[...Array(testimonials[current].rating)].map((_, i) => (
                      <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <h3 className="ab-title text-xl font-light text-stone-800">{testimonials[current].name}</h3>
                  <p className="ab-body text-xs text-stone-400">{testimonials[current].country}</p>
                  <p className="ab-body text-xs text-amber-600 font-semibold mt-1">{testimonials[current].tour}</p>
                </div>
              </div>
              <p className="ab-body text-stone-600 leading-relaxed text-base italic mb-10">
                "{testimonials[current].text}"
              </p>
              <div className="flex items-center justify-between">
                <button onClick={prev} className="w-10 h-10 rounded-full border border-stone-200 hover:border-amber-400 hover:bg-amber-50 flex items-center justify-center transition-all">
                  <ChevronLeft size={18} className="text-stone-500" />
                </button>
                <div className="flex gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i} onClick={() => setCurrent(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-amber-500" : "w-2 bg-stone-200"}`}
                    />
                  ))}
                </div>
                <button onClick={next} className="w-10 h-10 rounded-full border border-stone-200 hover:border-amber-400 hover:bg-amber-50 flex items-center justify-center transition-all">
                  <ChevronRight size={18} className="text-stone-500" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="bg-stone-900 py-20 px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="ab-title text-4xl md:text-5xl font-light text-white mb-4">
              Ready for your African adventure?
            </h2>
            <p className="ab-body text-stone-400 text-sm mb-10 leading-relaxed">
              Our safari experts will tailor every detail to your dream itinerary — no two safaris are ever the same.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/packages">
                <button className="ab-body inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-8 py-4 rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-900/30">
                  Browse Safari Packages
                </button>
              </Link>
              <Link to="/contact">
                <button className="ab-body inline-flex items-center gap-2 border border-stone-700 hover:border-stone-500 text-stone-300 hover:text-white px-8 py-4 rounded-xl font-semibold text-sm transition-all">
                  Contact Us Today
                </button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
};

export default About;