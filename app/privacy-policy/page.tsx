import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-tv10-cream dark:bg-tv10-dark">
      <Header />
      <section className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="border-b-4 border-tv10-red pb-4 text-4xl font-black uppercase text-tv10-metal dark:text-white">Privacy Policy</h1>
        <div className="mt-8 space-y-6 text-gray-700 dark:text-gray-300">
          <div><h2 className="text-xl font-bold text-tv10-metal dark:text-white">Information We Collect</h2><p className="mt-2 leading-relaxed">We may collect information you provide when contacting us, together with standard technical data such as browser and device information.</p></div>
          <div><h2 className="text-xl font-bold text-tv10-metal dark:text-white">How We Use Information</h2><p className="mt-2 leading-relaxed">Information is used to operate and improve the website, respond to enquiries, and maintain its security.</p></div>
          <div><h2 className="text-xl font-bold text-tv10-metal dark:text-white">Cookies</h2><p className="mt-2 leading-relaxed">This website may use cookies and similar technologies to remember preferences and understand site usage.</p></div>
          <div><h2 className="text-xl font-bold text-tv10-metal dark:text-white">Contact</h2><p className="mt-2 leading-relaxed">Questions about privacy can be sent to <a className="font-bold text-tv10-red hover:underline" href="mailto:editor@tv10india.com">editor@tv10india.com</a>.</p></div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
