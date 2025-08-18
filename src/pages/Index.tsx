import hero from "@/assets/hero-recycle.jpg";
import { Button } from "@/components/ui/button";
import GarbageUploader from "@/components/GarbageUploader";
import ResultsCard from "@/components/ResultsCard";
import NearbyCenters from "@/components/NearbyCenters";
import CategoryShowcase from "@/components/CategoryShowcase";
import { useState } from "react";
import type { ClassificationResult } from "@/services/wasteClassifier";

const Index = () => {
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Smart Recyclables Pricing",
    description: "Identify recyclables from photos, get price estimates, and find nearby centers.",
    url: "/",
    applicationCategory: "Utility",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="container py-6">
        <nav className="flex items-center justify-between">
          <a href="/" className="text-lg font-semibold">EcoSell</a>
          <div className="hidden sm:block">
            <Button asChild variant="outline"><a href="#upload">Sell Now</a></Button>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="container py-10 md:py-16 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Sell Recyclable Garbage with a Photo</h1>
              <p className="mt-4 text-lg text-muted-foreground">Upload your waste photo—paper, glass, plastic, metal—and get instant pricing plus nearby centers to call or navigate.</p>
              <div className="mt-6 flex gap-3">
                <Button asChild variant="hero"><a href="#upload">Start Selling</a></Button>
                <Button asChild variant="secondary"><a href="#how">How it works</a></Button>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-elegant">
                <img src={hero} alt="Recycling marketplace illustration" loading="lazy" className="w-full h-auto" />
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-background/40" />
        </section>

        <section id="upload" className="container py-10 md:py-14">
          <GarbageUploader
            onClassified={(r, _file, url) => {
              setResult(r);
              setPreviewUrl(url);
            }}
          />
        </section>

        {result && (
          <section className="container py-8">
            <ResultsCard imageUrl={previewUrl} label={result.label} confidence={result.score} category={result.category} />
            <div className="mt-8">
              <NearbyCenters />
            </div>
          </section>
        )}

        <section id="how" className="container py-14">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold text-lg">1. Upload</h3>
              <p className="text-muted-foreground">Drag & drop or select an image of your recyclables.</p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold text-lg">2. Identify & Price</h3>
              <p className="text-muted-foreground">We auto-detect the category and show indicative rates.</p>
            </div>
            <div className="p-6 rounded-lg border bg-card">
              <h3 className="font-semibold text-lg">3. Call & Go</h3>
              <p className="text-muted-foreground">Find nearby centers, call them, and get directions instantly.</p>
            </div>
          </div>
        </section>

        <section className="container py-14">
          <CategoryShowcase />
        </section>
      </main>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
};

export default Index;
