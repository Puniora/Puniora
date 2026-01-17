const About = () => {
  return (
    <section id="about" className="py-24 bg-cream">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="animate-slide-up">
            <span className="text-xs uppercase tracking-[0.4em] text-gold mb-4 block">
              Our Promise
            </span>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl mb-6">
              Crafted with
              <br />
              <span className="italic">Intention</span>
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                At Puniora, we believe that fragrance is more than just a scent—it's 
                an expression of who you are. Each of our perfumes is meticulously 
                crafted using the finest ingredients sourced from around the world.
              </p>
              <p>
                Our commitment to excellence extends beyond the bottle. We're proud 
                to be cruelty-free, paraben-free, and use a luxurious 25% parfum 
                concentration for long-lasting wear.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-10">
              <div>
                <span className="font-heading text-3xl md:text-4xl text-gold block">25%</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Parfum Concentration
                </span>
              </div>
              <div>
                <span className="font-heading text-3xl md:text-4xl text-gold block">12+</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Hours Longevity
                </span>
              </div>
              <div>
                <span className="font-heading text-3xl md:text-4xl text-gold block">100%</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Cruelty-Free
                </span>
              </div>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="aspect-square bg-secondary/50 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <span className="font-heading text-6xl md:text-8xl gold-text-gradient">
                    P
                  </span>
                  <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                    Est. 2024
                  </p>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-4 left-4 w-20 h-20 border border-gold/30" />
              <div className="absolute bottom-4 right-4 w-20 h-20 border border-gold/30" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
