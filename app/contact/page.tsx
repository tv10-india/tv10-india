import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-tv10-cream dark:bg-tv10-dark">
      <Header />
      <section className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="border-b-4 border-tv10-red pb-4 text-4xl font-black uppercase text-tv10-metal dark:text-white">Contact Support</h1>
        <div className="mt-8 space-y-5 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          <p>For news tips, corrections, support, or general enquiries, contact the TV10 India team.</p>
          <p><a className="font-bold text-tv10-red hover:underline" href="mailto:editor@tv10india.com">editor@tv10india.com</a></p>
          <p>Phone: <a className="font-bold text-tv10-red hover:underline" href="tel:+919876543210">+91 98765 43210</a></p>
          <p>Noida Sector 62, Uttar Pradesh, India - 201309</p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
