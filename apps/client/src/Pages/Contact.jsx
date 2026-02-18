import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {FaFacebook,FaInstagram, FaTiktok, FaXTwitter } from "react-icons/fa6"
import { useSubmitInquiry } from "../hooks/useInquiry";
import { useUser } from "@clerk/clerk-react";

const Contact = () => {
  const { user } = useUser();
  const { submit, submitting, success, error } = useSubmitInquiry();

  const [formData, setFormData] = useState({
    name: user?.fullName ?? "",
    email: user?.primaryEmailAddress?.emailAddress ?? "",
    phone: "",
    destination: "",
    travelDate: "",
    numberOfTravelers: "",
    budget: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      clerkUserId: user?.id ?? null,
    };
    const result = await submit(payload);
    if (result) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        destination: "",
        travelDate: "",
        numberOfTravelers: "",
        budget: "",
        subject: "",
        message: "",
      });
    }
  };

  return (
    <>
      <style>{`
        .contact-title { font-family: 'Cormorant Garamond', serif; }
        .contact-body  { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-white contact-body">
        {/* ── Hero ── */}
        <div className="relative h-[40vh] bg-stone-900 flex items-center justify-center overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1920&q=80"
            alt="Contact Us"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/40 to-transparent" />
          <div className="relative z-10 text-center px-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="contact-body text-amber-400 text-xs font-semibold tracking-widest uppercase">
                Get In Touch
              </span>
            </div>
            <h1 className="contact-title text-4xl md:text-6xl font-light text-white mb-4">
              Start Your Journey
            </h1>
            <div className="h-px w-20 bg-amber-500 mx-auto" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/3 space-y-12">
              <div>
                <h2 className="contact-title text-3xl font-light text-stone-800 mb-4">
                  Contact Details
                </h2>
                <p className="text-stone-500 text-sm leading-relaxed mb-8">
                  Have questions about our safari packages? Our team of experts
                  is ready to help you craft the perfect African experience.
                </p>

                <div className="space-y-5">
                  {[
                    {
                      Icon: Phone,
                      label: "Call Us 24/7",
                      value: "+254 792 591 816",
                      href: "tel:+254 792 591 816",
                    },
                    {
                      Icon: Mail,
                      label: "Email Inquiry",
                      value: "jayesafaris@gmail.com",
                      href: "mailto:jayesafaris@gmail.com",
                    },
                    {
                      Icon: MapPin,
                      label: "Our Office",
                      value: "City Center, Nairobi, Kenya",
                      href: null,
                    },
                    {
                      Icon: Clock,
                      label: "Working Hours",
                      value: "Mon – Fri: 8AM – 5PM",
                      href: null,
                    },
                  ].map(({ Icon, label, value, href }) => (
                    <div key={label} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                        <Icon size={17} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-0.5">
                          {label}
                        </p>
                        {href ? (
                          <a
                            href={href}
                            className="text-stone-800 font-semibold hover:text-amber-600 transition-colors text-sm"
                          >
                            {value}
                          </a>
                        ) : (
                          <p className="text-stone-800 font-semibold text-sm">
                            {value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social */}
              <div>
                <h3 className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-4">
                  Follow Our Adventures
                </h3>

                <div className="flex gap-3">
                  {[
                    { Icon: FaFacebook, url: "https://www.facebook.com/profile.php?id=61588392027859" },
                    { Icon: FaInstagram, url: "https://www.instagram.com/jayesafarislimited?igsh=MWdrOG94aHozNWx1NA==" },
                    { Icon: FaTiktok, url: "https://www.tiktok.com/@jayesafarislimited" },
                    { Icon: FaXTwitter, url: "https://twitter.com/yourhandle" },
                  ].map(({ Icon, url }, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 border border-stone-200 rounded-xl flex items-center justify-center text-stone-400 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all"
                    >
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: Form ── */}
            <div className="lg:w-2/3">
              <div className="bg-stone-50 rounded-2xl p-8 md:p-12">
                <h3 className="contact-title text-2xl font-light text-stone-800 mb-8">
                  Safari Inquiry Form
                </h3>

                {/* Success state */}
                {success && (
                  <div className="mb-6 flex items-start gap-3 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <CheckCircle
                      size={18}
                      className="text-emerald-500 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-emerald-800 font-semibold text-sm">
                        Inquiry sent successfully!
                      </p>
                      <p className="text-emerald-600 text-xs mt-0.5">
                        Our team will get back to you within 24 hours.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error state */}
                {error && (
                  <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  {[
                    {
                      name: "name",
                      label: "Full Name",
                      type: "text",
                      placeholder: "Jane Doe",
                      required: true,
                    },
                    {
                      name: "email",
                      label: "Email Address",
                      type: "email",
                      placeholder: "jane@example.com",
                      required: true,
                    },
                    {
                      name: "phone",
                      label: "Phone Number",
                      type: "tel",
                      placeholder: "+1 234 567 890",
                    },
                    {
                      name: "travelDate",
                      label: "Travel Date",
                      type: "date",
                      placeholder: "",
                    },
                  ].map(({ name, label, type, placeholder, required }) => (
                    <div key={name} className="space-y-1.5">
                      <label className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                        {label}
                        {required && (
                          <span className="text-amber-500 ml-0.5">*</span>
                        )}
                      </label>
                      <input
                        type={type}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        required={required}
                        placeholder={placeholder}
                        className="w-full bg-transparent border-b-2 border-stone-200 py-2 text-stone-800 text-sm focus:border-amber-500 outline-none transition-colors placeholder:text-stone-300"
                      />
                    </div>
                  ))}

                  {/* Destination select */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                      Destination
                    </label>
                    <select
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b-2 border-stone-200 py-2 text-stone-800 text-sm focus:border-amber-500 outline-none transition-colors"
                    >
                      <option value="">Where to?</option>
                      {[
                        "Kenya",
                        "Tanzania",
                        "Uganda",
                        "Zanzibar",
                        "Masai Mara",
                        "Serengeti",
                        "Ngorongoro",
                        "Amboseli",
                      ].map((d) => (
                        <option key={d} value={d.toLowerCase()}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Travelers */}
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                      No. of Travelers
                    </label>
                    <input
                      type="number"
                      name="numberOfTravelers"
                      value={formData.numberOfTravelers}
                      onChange={handleChange}
                      min="1"
                      placeholder="2"
                      className="w-full bg-transparent border-b-2 border-stone-200 py-2 text-stone-800 text-sm focus:border-amber-500 outline-none transition-colors placeholder:text-stone-300"
                    />
                  </div>

                  {/* Message */}
                  <div className="md:col-span-2 space-y-1.5 pt-2">
                    <label className="text-xs uppercase font-bold text-stone-400 tracking-wider">
                      Your Message <span className="text-amber-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      placeholder="Tell us about your dream safari — dates, interests, budget, anything helps…"
                      className="w-full bg-transparent border-b-2 border-stone-200 py-2 text-stone-800 text-sm focus:border-amber-500 outline-none transition-colors resize-none placeholder:text-stone-300"
                    />
                  </div>

                  {/* Submit */}
                  <div className="md:col-span-2 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="group inline-flex items-center gap-3 bg-stone-900 hover:bg-amber-500 text-white px-10 py-4 rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-md"
                    >
                      {submitting ? "Sending…" : "Send Inquiry"}
                      <Send
                        size={15}
                        className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                      />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* ── Map ── */}
        <div className="h-[380px] w-full grayscale hover:grayscale-0 transition-all duration-700">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127642.582442434!2d36.764987!3d-1.286389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf0254b297924c!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2s!4v1645000000000"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Office Location"
          />
        </div>
      </div>
    </>
  );
};

export default Contact;
