
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 mb-8"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-blue-600" /><a href="mailto:hello@fastdigital360.com" className="text-gray-700">hello@fastdigital360.com</a></div>
            <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-blue-600" /><a href="tel:+1234567890" className="text-gray-700">+1 (234) 567-890</a></div>
            <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-blue-600" /><span className="text-gray-700">123 Digital Street, Marketing City</span></div>
          </div>
          <form className="space-y-4">
            <input className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your Name" />
            <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email Address" />
            <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="How can we help?" />
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
}
