import React from "react";
import { Container } from "react-bootstrap";
import "./About.css"; 

const About = () => {
  return (
    <Container className="about-container">

      <div className="about-hero">
        <h1 className="about-title">
          About <span className="highlight">Yash Gems & Jewelleries</span>
        </h1>
        <p className="about-subtitle">
          Fine gold and diamond jewelry crafted with heritage and brilliance.
        </p>
      </div>

      <div className="about-image-wrapper">
        <img
          src="https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=1200&fit=crop&q=80"
          alt="Luxury jewelry display"
          className="about-image"
        />
      </div>

      <h4 className="section-title">Our Story</h4>
      <p className="section-text">
        Mr. Robert D'costa started the business from scratch in 2005. The flagship company
        of Yash Gems & Jewelleries (P) Ltd was formed to carry on the business of
        manufacturing and trading of gold and diamond jewelry.
      </p>

      <blockquote className="about-quote">
        "We reflect special magic in every jewel, born from craftsmanship, spirit, and art."
      </blockquote>

      <h4 className="section-title">What We Offer</h4>
      <ul className="section-list">
        <li>Advanced technology for ultimate diamond brilliance</li>
        <li>Exclusive designs tailored to market trends and culture</li>
        <li>Trusted supply for leading retailers nationwide</li>
        <li>Top quality merchandise at the best possible price</li>
      </ul>

      <h4 className="section-title">Our Vision</h4>
      <p className="section-text">
        With a vision of impeccable quality, Yash sets the benchmark for innovation and
        craftsmanship in the Indian jewelry industry. Our desire is to give every client
        a reason to feel good, every time they choose Yash.
      </p>

      <h4 className="section-title">Your Online Experience</h4>
      <p className="section-text">
        Our web platform makes it easy to explore collections, filter by gold carat,
        diamond quality, and gemstone type, and shop securely from anywhere in the world.
        We also share curated insights on diamonds, gemstones, and certifications.
      </p>

      <p className="closing-text">
        Thank you for choosing Yash Gems & Jewelleries
      </p>
    </Container>
  );
};

export default About;
