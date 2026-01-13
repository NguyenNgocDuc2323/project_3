import React from "react";
import { Container } from "react-bootstrap";
import "./About.css"; 

const About = () => {
  return (
    <Container className="about-container">

      <div className="about-hero">
        <h1 className="about-title">
          About <span className="highlight">Story Reader</span>
        </h1>
        <p className="about-subtitle">
          A modern platform for discovering and enjoying great stories.
        </p>
      </div>

      <div className="about-image-wrapper">
        <img
          src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200"
          alt="Story Reading"
          className="about-image"
        />
      </div>

      <h4 className="section-title">Our Purpose</h4>
      <p className="section-text">
        Story Reader was created to offer readers a simple, enjoyable, and modern way
        to access high-quality stories. We focus on user experience, clean design, and
        seamless reading across devices.
      </p>

      <blockquote className="about-quote">
        “Stories connect people, inspire creativity, and unlock new worlds.”
      </blockquote>

      {/* WHAT WE OFFER */}
      <h4 className="section-title">What We Offer</h4>
      <ul className="section-list">
        <li>Simple, clean, easy-to-use reading interface</li>
        <li>Modern responsive design</li>
        <li>Weekly story updates</li>
        <li>Reading tools like dark mode & adjustable fonts</li>
      </ul>

      <h4 className="section-title">Our Vision</h4>
      <p className="section-text">
        We aim to build a community where everyone can find inspiration, joy, and motivation 
        through the power of storytelling. Story Reader strives to deliver the best reading 
        experience possible.
      </p>

      <p className="closing-text">
        Thank you for choosing Story Reader 💙
      </p>
    </Container>
  );
};

export default About;
