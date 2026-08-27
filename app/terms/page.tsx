import Header from "@/components/Header";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-tv10-cream dark:bg-tv10-dark">
      <Header />
      <section className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="border-b-4 border-tv10-red pb-4 text-4xl font-black uppercase text-tv10-metal dark:text-white">Terms & Conditions</h1>
        <div className="mt-8 space-y-6 text-gray-700 dark:text-gray-300">
          <div><h2 className="text-xl font-bold text-tv10-metal dark:text-white">Use of Content</h2><p className="mt-2 leading-relaxed">Content published by TV10 India is provided for personal, non-commercial use. Republishing, copying, or distributing material requires prior permission.</p></div>
          <div><h2 className="text-xl font-bold text-tv10-metal dark:text-white">Accuracy</h2><p className="mt-2 leading-relaxed">We aim to provide accurate and timely information, but news can develop quickly. Readers should verify important information from official sources.</p></div>
          <div><h2 className="text-xl font-bold text-tv10-metal dark:text-white">External Links</h2><p className="mt-2 leading-relaxed">Links to third-party websites are provided for convenience. TV10 India is not responsible for their content or privacy practices.</p></div>
          <div><h2 className="text-xl font-bold text-tv10-metal dark:text-white">Contact</h2><p className="mt-2 leading-relaxed">For questions, email <a className="font-bold text-tv10-red hover:underline" href="mailto:editor@tv10india.com">editor@tv10india.com</a>.</p></div>
        </div>
      </section>
    </main>
  );
}
