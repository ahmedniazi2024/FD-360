
import Link from "next/link";
import { Search, Megaphone, Globe, Code, BarChart3, Star, ArrowLeft, ArrowRight } from "lucide-react";

const services = [
  { icon: Search, title: "SEO", desc: "Rank higher on Google and drive sustainable organic traffic. We use proven on-page, off-page and technical SEO strategies.", href: "seo" },
  { icon: Megaphone, title: "PPC Advertising", desc: "Get immediate results with targeted Google Ads, Facebook Ads and remarketing campaigns.", href: "ppc" },
  { icon: Globe, title: "Social Media Marketing", desc: "Build a loyal community and grow brand awareness across Instagram, Facebook, LinkedIn and more.", href: "social-media" },
  { icon: Code, title: "Web Development", desc: "Fast, secure and conversion-optimized websites built with the latest technologies.", href: "web-development" },
  { icon: BarChart3, title: "Digital Marketing", desc: "Full-funnel marketing strategies that drive leads, conversions and revenue growth.", href: "digital-marketing" },
  { icon: Star, title: "Branding", desc: "Develop a strong brand identity with logo design, brand guidelines and visual storytelling.", href: "branding" },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 mb-8"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <h1 className="text-4xl font-bold mb-4">Our Services</h1>
        <p className="text-gray-500 text-lg mb-12 max-w-2xl">From strategy to execution, we offer everything you need to succeed online.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ icon: Icon, title, desc, href }) => (
            <div key={href} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
