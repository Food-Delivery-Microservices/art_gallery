import artwork1 from "@/assets/artwork-1.jpg";
import artwork2 from "@/assets/artwork-2.jpg";
import artwork3 from "@/assets/artwork-3.jpg";
import artwork4 from "@/assets/artwork-4.jpg";
import artwork5 from "@/assets/artwork-5.jpg";
import artwork6 from "@/assets/artwork-6.jpg";

export interface Artwork {
  id: number;
  image: string;
  title: string;
  artist: string;
  price: string;
  category: string;
  description: string;
  dimensions: string;
  medium: string;
  year: string;
  availability: string;
}

export const artworks: Artwork[] = [
  {
    id: 1,
    image: artwork1,
    title: "Abstract Harmony",
    artist: "Elena Rodriguez",
    price: "₹12,200",
    category: "Abstract",
    description: "A mesmerizing abstract composition that explores the interplay of colors and forms. This piece invites viewers to find their own meaning within the harmonious chaos of shapes and hues.",
    dimensions: "24 x 36 inches",
    medium: "Acrylic on Canvas",
    year: "2023",
    availability: "Available",
  },
  {
    id: 2,
    image: artwork2,
    title: "Mountain Dreams",
    artist: "David Chen",
    price: "₹13,000",
    category: "Landscape",
    description: "Inspired by the majestic peaks of the Himalayas, this landscape captures the serene beauty and grandeur of mountain ranges. The artist's masterful use of light creates a dreamlike atmosphere.",
    dimensions: "30 x 40 inches",
    medium: "Oil on Canvas",
    year: "2023",
    availability: "Available",
  },
  {
    id: 3,
    image: artwork3,
    title: "Contemporary Portrait",
    artist: "Sarah Mitchell",
    price: "₹14,200",
    category: "Figurative",
    description: "A striking contemporary portrait that challenges traditional representation. The bold brushstrokes and vibrant colors bring the subject to life with emotional intensity.",
    dimensions: "20 x 30 inches",
    medium: "Mixed Media on Canvas",
    year: "2024",
    availability: "Available",
  },
  {
    id: 4,
    image: artwork4,
    title: "Urban Expression",
    artist: "Marcus Johnson",
    price: "₹15,600",
    category: "Expressionism",
    description: "An explosive expression of urban energy and emotion. This piece captures the raw vitality of city life through dynamic composition and bold color choices.",
    dimensions: "36 x 48 inches",
    medium: "Acrylic and Spray Paint on Canvas",
    year: "2023",
    availability: "Available",
  },
  {
    id: 5,
    image: artwork5,
    title: "Floral Symphony",
    artist: "Isabella Romano",
    price: "₹18,900",
    category: "Flowers",
    description: "A delicate and enchanting floral composition that celebrates the beauty of nature. Each petal is rendered with exquisite detail, creating a symphony of colors and textures.",
    dimensions: "28 x 36 inches",
    medium: "Watercolor on Paper",
    year: "2024",
    availability: "Available",
  },
  {
    id: 6,
    image: artwork6,
    title: "Geometric Serenity",
    artist: "Alex Turner",
    price: "₹17,800",
    category: "Abstract",
    description: "A meditation on form and space through geometric abstraction. The precise lines and balanced composition create a sense of calm and order.",
    dimensions: "32 x 32 inches",
    medium: "Acrylic on Canvas",
    year: "2023",
    availability: "Available",
  },
];

// Made with Bob
