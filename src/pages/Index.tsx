import Navigation from "@/components/Navigation";
import HeroCarousel from "@/components/HeroCarousel";
import CategoryFilters from "@/components/CategoryFilters";
import ArtworkGrid from "@/components/ArtworkGrid";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroCarousel />
        <CategoryFilters />
        <ArtworkGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
