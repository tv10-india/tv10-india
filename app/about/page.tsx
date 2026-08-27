import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-tv10-cream dark:bg-tv10-dark">
      <Header />
      <section className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="border-b-4 border-tv10-red pb-4 text-4xl font-black uppercase text-tv10-metal dark:text-white">About TV10 India</h1>
        <div className="mt-8 space-y-5 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          <p>TV10 India is a digital news platform covering local, national, and global stories that matter to our audience.</p>
          <p>Our newsroom brings updates from Uttar Pradesh, Uttarakhand, Delhi, India, and the world across politics, business, sports, dharma, and more.</p>
          <p>We are committed to timely reporting, clear context, and responsible journalism.</p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
