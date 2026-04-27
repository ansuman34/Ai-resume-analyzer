import { motion } from "framer-motion";

export default function Companies() {
  const brands = [
    { name: "Amazon", logo: "https://www.resumax.ai/_next/image?url=%2Fassets%2Flogos%2FAmazon.png&w=256&q=75" },
    { name: "Netflix", logo: "https://www.resumax.ai/_next/image?url=%2Fassets%2Flogos%2FNetflix.png&w=256&q=75" },
    { name: "Nvidia", logo: "https://www.resumax.ai/_next/image?url=%2Fassets%2Flogos%2FNvidia.png&w=256&q=75" },
    { name: "Stripe", logo: "https://www.resumax.ai/_next/image?url=%2Fassets%2Flogos%2FStripe.webp&w=256&q=75" },
    { name: "Datadog", logo: "https://www.resumax.ai/_next/image?url=%2Fassets%2Flogos%2FDatadog.png&w=256&q=75" },
    { name: "LinkedIn", logo: "https://www.resumax.ai/_next/image?url=%2Fassets%2Flogos%2FLinkedIn.webp&w=256&q=75" },
    { name: "Google", logo: "https://www.resumax.ai/_next/image?url=%2Fassets%2Flogos%2FGoogle.png&w=256&q=75" },
    { name: "Microsoft", logo: "https://www.resumax.ai/_next/image?url=%2Fassets%2Flogos%2FMicrosoft.png&w=256&q=75" },
    { name: "Meta", logo: "https://www.resumax.ai/_next/image?url=%2Fassets%2Flogos%2FMeta.jpg&w=256&q=75" },
    { name: "Apple", logo: "https://www.resumax.ai/_next/image?url=%2Fassets%2Flogos%2FApple.webp&w=256&q=75" },
  ];

  // Duplicate brands for seamless infinite scroll
  const duplicatedBrands = [...brands, ...brands];

  return (
    <section className="companies">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Build resumes that land interviews at
      </motion.h2>

      <div className="company-carousel-wrapper">
        <div className="company-carousel-track">
          {duplicatedBrands.map((brand, i) => (
            <motion.div
              key={`${brand.name}-${i}`}
              className="company-logo"
              whileHover={{ scale: 1.15, opacity: 1 }}
              initial={{ opacity: 0.7 }}
            >
              <img 
                src={brand.logo} 
                alt={brand.name}
                onError={(e) => {
                  // Fallback to text if logo fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span className="company-fallback" style={{ display: 'none' }}>
                {brand.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
