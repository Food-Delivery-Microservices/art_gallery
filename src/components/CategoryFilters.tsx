import { Button } from "@/components/ui/button";

const categories = [
  "Shop All",
  "Paintings",
  "Abstracts",
  "Large Works",
  "Landscapes",
  "Sculptures",
  "Figurative",
  "Expressionism",
  "Flowers",
  "People",
];

const CategoryFilters = () => {
  return (
    <div className="w-full bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              className="rounded-full bg-background hover:bg-accent cursor-default"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilters;
