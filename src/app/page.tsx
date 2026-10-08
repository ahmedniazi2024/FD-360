
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, Zap, BarChart3, Globe, Search, Megaphone, Code, Star } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: pageContent } = await supabase.from("website_pages").select("content").eq("slug", "home").single();
  const content = (pageContent?.content ?? {}) as Record<string, string>;

  const heroHeading = content.hero_heading || "Grow Your Business with Fast Digital 360";
  const heroSubheading = content.hero_subheading || "Full-service digital marketing agency helping businesses scale online through SEO, PPC, social media, and web development.";
  const heroCta = content.hero_cta_text || "Get Started Today";
  const statsClients = content.stats_clients || "200+";
  const statsProjects = content.stats_projects || "500+";
  const statsExp = content.stats_experience || "8+";

  const services = [
    { icon: Search, title: "SEO", desc: "Dominate search rankings and drive organic traffic to your website.", href: "/services/seo" },
    { icon: Megaphone, title: "PPC Advertising", desc: "ROI-focused paid advertising campaigns on Google and social platforms.", href: "/services/ppc" },
    { icon: Globe, title: "Social Media Marketing", desc: "Build brand awareness and engage your audience across all platforms.", href: "/services/social-media" },
    { icon: Code, title: "Web Development", desc: "Modern, fast, and conversion-optimized websites and web apps.", href: "/services/web-development" },
    { icon: BarChart3, title: "Digital Marketing", desc: "Comprehensive digital marketing strategies tailored to your goals.", href: "/services/digital-marketing" },
    { icon: Star, title: "Branding", desc: "Create a powerful brand identity that resonates with your audience.", href: "/services/branding" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            Fast Digital 360
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/about" className="hover:text-gray-900">About</Link>
            <Link href="/services" className="hover:text-gray-900">Services</Link>
            <Link href="/blog" className="hover:text-gray-900">Blog</Link>
            <Link href="/contact" className="hover:text-gray-900">Contact</Link>
          </div>
          <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Staff Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm mb-6">
            <Zap className="w-4 h-4" />
            Full-Service Digital Marketing Agency
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">{heroHeading}</h1>
          <p className="text-xl text-slate-300 mb-10 max-w-3xl mx-auto">{heroSubheading}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-2 justify-center transition-colors">
              {heroCta} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/services" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-2 justify-center transition-colors">
              View Services
            </Link>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { value: statsClients, label: "Happy Clients" },
              { value: statsProjects, label: "Projects Delivered" },
              { value: statsExp + " Years", label: "Of Experience" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold">{value}</p>
                <p className="text-slate-400 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Everything you need to succeed online — from strategy to execution.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, title, desc, href }) => (
              <Link key={href} href={href} className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                  <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
                <div className="flex items-center gap-1 mt-4 text-blue-600 text-sm font-medium">
                  Learn more <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Grow Your Business?</h2>
          <p className="text-blue-100 text-lg mb-8">Let's build a digital marketing strategy that delivers real results.</p>
          <Link href="/contact" className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-colors inline-flex items-center gap-2">
            Start a Conversation <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 text-white font-bold mb-4">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                Fast Digital 360
              </Link>
              <p className="text-sm">Full-service digital marketing agency helping businesses grow online.</p>
            </div>
            {[
              { title: "Services", links: [["SEO", "/services/seo"], ["PPC", "/services/ppc"], ["Social Media", "/services/social-media"], ["Web Dev", "/services/web-development"]] },
              { title: "Company", links: [["About", "/about"], ["Blog", "/blog"], ["Contact", "/contact"]] },
              { title: "Legal", links: [["Privacy Policy", "/privacy"], ["Terms", "/terms"]] },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-white font-semibold mb-3">{title}</p>
                <ul className="space-y-2">
                  {links.map(([label, href]) => (
                    <li key={label}><Link href={href} className="text-sm hover:text-white transition-colors">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 mt-8 pt-6 text-center text-sm">
            &copy; {new Date().getFullYear()} Fast Digital 360. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
