import {
  Hero,
  Features,
  ProductShowcase,
  FAQ,
  Footer,
} from "@/components/landing";

export default function Page() {
  return (
    <main className="min-h-screen">
      <Hero />
      <ProductShowcase />
      <Features />
      <FAQ />
      <Footer />
    </main>
  );
}
