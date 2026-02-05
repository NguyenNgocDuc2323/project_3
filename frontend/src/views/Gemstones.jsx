import React from "react";
import { Container } from "react-bootstrap";
import "./Gemstones.css";

const Gemstones = () => {
  const gemstones = [
    {
      id: 1,
      name: "Diamond",
      image: "https://www.graff.com/dw/image/v2/BFNT_PRD/on/demandware.static/-/Library-Sites-GraffSharedLibrary/default/dwf815bbe4/Landing%20Pages/Bridal%20Guides/Graff-A-Guide-to-Diamond-Carat-Hero-1080x1350px.jpg",
      color: "Colorless, Pink, Blue, Yellow",
      hardness: "10 (Mohs)",
      benefits: "Strength, Clarity, Love, Protection",
      description: "The hardest natural substance, diamonds are a symbol of eternal love and luxury. They represent purity, innocence, and endurance."
    },
    {
      id: 2,
      name: "Ruby",
      image: "https://store.museumofjewelry.com/cdn/shop/articles/ruby-the-king-of-precious-stone-709034_720x.jpg?v=1680493164",
      color: "Deep Red",
      hardness: "9 (Mohs)",
      benefits: "Passion, Courage, Vitality, Success",
      description: "Known as the 'King of Gemstones', rubies are extremely precious and represent passion, desire, and life force. They are associated with power and prosperity."
    },
    {
      id: 3,
      name: "Sapphire",
      image: "https://www.larsenjewellery.com.au/wp-content/uploads/2022/04/ceylon-sapphire-1.jpg",
      color: "Blue, Pink, Yellow, White",
      hardness: "9 (Mohs)",
      benefits: "Wisdom, Intuition, Peace, Protection",
      description: "Sapphires symbolize wisdom, virtue, and good fortune. Blue sapphires are associated with calmness and truth, making them highly valued in jewelry."
    },
    {
      id: 4,
      name: "Emerald",
      image: "https://www.americangemsociety.org/wp-content/uploads/2020/11/emerald.png",
      color: "Green",
      hardness: "7.5-8 (Mohs)",
      benefits: "Harmony, Growth, Love, Communication",
      description: "Emeralds are symbols of rebirth and love. Known for their stunning green color, they promote healing, fertility, and eloquence. Cleopatra was famously fond of emeralds."
    },
    {
      id: 5,
      name: "Pearl",
      image: "https://clara.in/cdn/shop/products/xlgpe3_1_1_1_1024x1024.jpg?v=1625045963",
      color: "White, Pink, Black, Golden",
      hardness: "3-4 (Mohs)",
      benefits: "Purity, Innocence, Serenity, New Beginnings",
      description: "Formed within oysters and mussels, pearls represent purity and innocence. They are organic gemstones symbolizing wisdom and new beginnings."
    },
    {
      id: 6,
      name: "Topaz",
      image: "https://plumbclub.com/wp-content/uploads/2022/11/yellow-topaz-gemstone-hero.jpg",
      color: "Blue, Yellow, Pink, Colorless",
      hardness: "8 (Mohs)",
      benefits: "Clarity, Strength, Joy, Positive Energy",
      description: "Topaz is believed to enhance mental clarity and strength. It brings joy and positive energy to the wearer, promoting emotional balance and creativity."
    },
    {
      id: 7,
      name: "Amethyst",
      image: "https://diamondbuzz.blog/wp-content/uploads/2021/02/Amethyst_-Introduction-and-General-Characteristics-2.jpg",
      color: "Purple, Violet",
      hardness: "7 (Mohs)",
      benefits: "Calm, Spirituality, Clarity, Protection",
      description: "A purple variety of quartz, amethyst is known for its calming properties. It promotes spiritual awareness and is believed to protect against negative energy."
    },
    {
      id: 8,
      name: "Aquamarine",
      image: "https://img.vuahanghieu.com/unsafe/0x0/left/top/smart/filters:quality(90)/https://admin.vuahanghieu.com/upload/news/content/2025/05/da-aquamarine-la-gi-1-jpg-1747818121-21052025160201.jpg",
      color: "Light Blue, Blue-Green",
      hardness: "7.5-8 (Mohs)",
      benefits: "Calm, Courage, Communication, Clarity",
      description: "Named after seawater, aquamarine represents the beauty of the ocean. It is believed to calm emotions, enhance communication, and promote clarity of thought."
    }
  ];

  return (
    <Container className="gemstones-container">
      {/* Hero Section */}
      <div className="gemstones-hero">
        <h1 className="gemstones-title">
          Precious <span className="highlight">Gemstones</span>
        </h1>
        <p className="gemstones-subtitle">
          Discover the beauty, history, and benefits of the world's most precious gems
        </p>
      </div>

      {/* History Section */}
      <section className="history-section">
        <h2 className="section-heading">History of Precious Gemstones</h2>
        <div className="history-content">
          <div className="history-item">
            <h4>Ancient Civilizations</h4>
            <p>
              Gemstones have been treasured since ancient times. The Egyptians wore emeralds as symbols of fertility and rebirth, 
              while the Romans valued diamonds for their believed magical powers. Ancient texts from India and Persia extensively 
              documented the properties and uses of gemstones.
            </p>
          </div>

          <div className="history-item">
            <h4>Medieval Period</h4>
            <p>
              During the Middle Ages, gemstones were not only valued for their beauty but also for their supposed healing and 
              protective properties. Kings and queens adorned themselves with precious gems, believing them to possess magical 
              and medicinal properties. Each gemstone was associated with specific virtues and powers.
            </p>
          </div>

          <div className="history-item">
            <h4>Renaissance to Modern Era</h4>
            <p>
              The Renaissance brought a renewed appreciation for gemstones as both artistic and valuable commodities. With improved 
              cutting techniques and gemological science, the brilliance and beauty of precious stones reached new heights. Today, 
              gemstones are valued not only for their rarity and beauty but also for their investment potential.
            </p>
          </div>
        </div>
      </section>

      {/* Gemstones Grid */}
      <section className="gemstones-section">
        <h2 className="section-heading">Our Collection of Precious Stones</h2>
        <div className="gemstones-grid">
          {gemstones.map((stone) => (
            <div key={stone.id} className="gemstone-card">
              <div className="gemstone-image-wrapper">
                <img src={stone.image} alt={stone.name} className="gemstone-image" />
              </div>
              <div className="gemstone-content">
                <h3 className="gemstone-name">{stone.name}</h3>
                <p className="gemstone-description">{stone.description}</p>
                
                <div className="gemstone-details">
                  <div className="detail-item">
                    <span className="detail-label">Color:</span>
                    <span className="detail-value">{stone.color}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Hardness:</span>
                    <span className="detail-value">{stone.hardness}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Benefits:</span>
                    <span className="detail-value">{stone.benefits}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <h2 className="section-heading">Benefits of Gemstones</h2>
        <div className="benefits-grid">
          <div className="benefit-item">
            <div className="benefit-icon">💎</div>
            <h4>Emotional Balance</h4>
            <p>Gemstones are believed to promote emotional healing, reduce stress, and enhance emotional well-being.</p>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">✨</div>
            <h4>Spiritual Growth</h4>
            <p>Many cultures believe gemstones enhance spiritual awareness, meditation, and personal transformation.</p>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">🛡️</div>
            <h4>Protection</h4>
            <p>Traditionally, gemstones are worn as protective amulets against negative energy and harmful influences.</p>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">🌟</div>
            <h4>Physical Wellness</h4>
            <p>Ancient healing practices attribute various health benefits to gemstones, promoting vitality and wellness.</p>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">💖</div>
            <h4>Love & Relationships</h4>
            <p>Certain gemstones are believed to enhance love, strengthen relationships, and attract positive connections.</p>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">🧠</div>
            <h4>Mental Clarity</h4>
            <p>Gemstones are thought to improve focus, enhance memory, and promote mental clarity and concentration.</p>
          </div>
        </div>
      </section>

      {/* Quality Guide Section */}
      <section className="quality-section">
        <h2 className="section-heading">How to Evaluate Gemstones</h2>
        <div className="quality-content">
          <div className="quality-item">
            <h4>The 4 Cs (for Diamonds)</h4>
            <ul>
              <li><strong>Carat:</strong> Weight of the gemstone</li>
              <li><strong>Clarity:</strong> Absence of inclusions or flaws</li>
              <li><strong>Color:</strong> Hue, saturation, and tone of the stone</li>
              <li><strong>Cut:</strong> Quality of the cutting and polishing</li>
            </ul>
          </div>

          <div className="quality-item">
            <h4>Durability (Mohs Scale)</h4>
            <p>
              The Mohs hardness scale (1-10) measures gemstone durability. Harder stones (9-10) are suitable for daily wear, 
              while softer stones (below 7) require more careful handling and are better for special occasions.
            </p>
          </div>

          <div className="quality-item">
            <h4>Authentication</h4>
            <p>
              Always purchase gemstones from reputable dealers. Look for certifications from recognized gemological institutes 
              like GIA (Gemological Institute of America) to ensure authenticity and quality.
            </p>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="conclusion-section">
        <blockquote className="gemstones-quote">
          "Gemstones are nature's finest treasures, each with its own unique beauty, history, and significance."
        </blockquote>
        <p className="conclusion-text">
          Whether you're drawn to gemstones for their breathtaking beauty, historical significance, or believed metaphysical 
          properties, Yash Gems & Jewelleries offers an exquisite collection of authentic, high-quality precious stones. 
          Each gem in our collection is carefully selected and crafted into stunning jewelry pieces that will be treasured for generations.
        </p>
      </section>
    </Container>
  );
};

export default Gemstones;
