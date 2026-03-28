import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  Linkedin, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight 
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-olive text-white pt-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-4">
          <div className="space-y-4">
            <ul className="space-y-3">
              {[
                { name: 'Kenya',    path: '/kenya' },
                { name: 'Tanzania', path: '/tanzania' },
                { name: 'Uganda',   path: '/uganda' },
                { name: 'Zanzibar', path: '/zanzibar' },
                { name: 'About Us', path: '/about-us' }
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="flex items-center gap-2 group cursor-pointer">
                    <div className="bg-[#ecbb0a] rounded-full p-1 group-hover:bg-orange-500 transition-colors shadow-sm">
                      <ChevronRight size={14} className="text-white" />
                    </div>
                    <span className="text-sm font-medium hover:text-orange-200 transition-colors">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <MapPin size={20} className="text-[#ecbb0a] shrink-0" />
              <p className="text-sm leading-relaxed">
                 Nairobi City Centre<br />
                Nairobi, Kenya
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Phone size={20} className="text-[#ecbb0a] shrink-0" />
              <p className="text-sm">+254 792 591 816</p>
            </div>
            <div className="flex items-center gap-4">
              <Mail size={20} className="text-[#ecbb0a] shrink-0" />
              <p className="text-sm">jayesafaris@gmail.com</p>
            </div>
            <div className="flex items-center gap-4">
              <MapPin size={20} className="text-[#ecbb0a] shrink-0" />
              <p className="text-sm">Amani Place, Dar es Saalam, Tanzania.</p>
            </div>
            <div className="flex items-center gap-4">
              <MapPin size={20} className="text-[#ecbb0a] shrink-0" />
              <p className="text-sm">Entebbe Uganda.</p>
            </div>
          </div>
 
          <div className="flex flex-col items-center justify-center space-y-6">
            <Link to="/request-quote">
              <button className="bg-[#ED2009] hover:bg-[#C51A07] text-white px-8 py-3 rounded font-bold uppercase tracking-wider text-sm transition-all shadow-lg hover:scale-105 active:scale-95">
                Request a Quote
              </button>
            </Link>
            <p className="font-cursive text-2xl italic opacity-90 text-center">
              The Magic of Safari Awaits
            </p>
          </div>

          <div className="flex justify-center lg:justify-end gap-4 items-start">
            {[
              { Icon: Facebook, href: "https://www.facebook.com/profile.php?id=61588392027859" },
              { Icon: Instagram, href: "https://www.instagram.com/jayesafarislimited?igsh=MWdrOG94aHozNWx1NA==" },
              { Icon: Youtube, href: "https://www.youtube.com/@jayesafaris" },
              { Icon: Linkedin, href: "https://www.linkedin.com/company/jaye-safaris-limited" }
            ].map(({ Icon, href }, idx) => (
              <a 
                key={idx} 
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-[#5d723c] p-2 rounded-full hover:bg-orange-400 hover:text-white transition-all shadow-md hover:-translate-y-1"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>
      {/* Bottom Bar */}
        <div className=" bg-dark-olive-2 pb-3 border-t border-stone-800/30 pt-6 mt-8 text-center text-xs opacity-80">
          <p>
            Copyright ©{currentYear} Jaye Safaris Adventures Limited. All Rights Reserved. 
            Design by: <a href="https://khalid-portifolio.pages.dev/" target="_blank" rel="noopener noreferrer"><span className="text-orange-300 "> Khalid Solutions</span></a>
          </p>
        </div>
    </footer>
  );
};


export default Footer;