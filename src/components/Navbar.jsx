import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export const Navbar = ({ isBestSellerEmpty = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigationItems = [
    !isBestSellerEmpty && { name: "Best Seller", href: "#" },
    !isBestSellerEmpty && { name: "Main Dish", href: "#Main Dish" },
    isBestSellerEmpty && {name: "Main Dish", href: "#"},
    { name: "Sides", href: "#Sides" },
    { name: "Rice Bowl", href: "#Rice Bowl" },
    { name: "Coffee", href: "#Coffee" },
    { name: "Non-Coffee", href: "#Non-Coffee" },
    { name: "Juice", href: "#Juice" },
    { name: "Tea", href: "#Tea" },
    { name: "Soft Drinks", href: "#Soft Drink" },
    { name: "Beer", href: "#Beer" },
  ].filter(Boolean);

  return (
    <nav
      className={`fixed container w-full pt-8 z-40 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-xs" : "bg-transparent"
      }`}
    >
      <div className="flex items-start justify-between">
        <h1 className="text-left text-sm text-agro-color font-semibold mb-1">MENU LIST</h1>
        <button
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="lg:hidden text-foreground z-50"
          aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div
          className={`
            fixed inset-0 z-40
            flex flex-col items-center justify-center
            bg-background/50 backdrop-blur-md
            transition-all duration-300 lg:hidden
            ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
          `}
        >
          <div className="flex flex-col space-y-8 text-xl">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="text-foreground/80 hover:text-primary hover:scale-105 active:scale-95 transition-colors duration-300"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};