import Header from "@/components/Header";

export default function AdvertisePage() {
  return (
    <main className="min-h-screen bg-tv10-cream dark:bg-tv10-dark">
      <Header />
      <section className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="border-b-4 border-tv10-red pb-4 text-4xl font-black uppercase text-tv10-metal dark:text-white">Advertise With Us</h1>
        <div className="mt-8 space-y-5 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          <p>Connect your brand with TV10 India readers through display advertising, sponsored coverage, video placements, and regional campaigns.</p>
          <p>Our team can help create a package suited to your audience and campaign goals.</p>
          <p>For advertising enquiries, write to <a className="font-bold text-tv10-red hover:underline" href="mailto:editor@tv10india.com?subject=Advertising%20Enquiry">editor@tv10india.com</a>.</p>
        </div>
      </section>
    </main>
  );
}
