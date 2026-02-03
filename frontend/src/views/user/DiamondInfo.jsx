import React from 'react'
import { Container, Row, Col, Card, Badge, Accordion } from 'react-bootstrap'
import './DiamondInfo.css'

const DiamondInfo = () => {
  const certificationBodies = [
    {
      name: 'GIA (Gemological Institute of America)',
      description: 'The world\'s leading organization for diamond evaluation and certification',
      logo: 'https://carlsbadlifeinaction.com/wp-content/uploads/2025/04/1.-74805_GIA-Carlsbad-Panorama-scaled.jpg',
      features: ['Evaluates 4C (Carat, Color, Clarity, Cut)', 'Most trusted certificate', 'Globally recognized']
    },
    {
      name: 'AGS (American Gem Society)',
      description: 'American Gem Society with strict standards',
      logo: 'https://www.americangemsociety.org/wp-content/uploads/2024/01/AGS23-8020-scaled.jpg',
      features: ['Precise cut evaluation', 'AGS 0-10 certificate', 'High quality standards']
    },
    {
      name: 'SSEF (Swiss Gemmological Institute)',
      description: 'Swiss Gemological Institute with advanced technology',
      logo: 'https://media.licdn.com/dms/image/C5622AQE5P1uEyx5QLg/feedshare-shrink_2048_1536/0/1664514514214?e=2147483647&v=beta&t=msApZSMma9OHpen6i14Fb8f_r796mn_FPjTmAonHhC4',
      features: ['Modern analytical technology', 'Origin certification', 'Comprehensive evaluation']
    }
  ]

  const diamondBenefits = [
    {
      icon: '💎',
      title: 'Value Investment',
      description: 'Diamonds are assets with stable value that appreciate over time'
    },
    {
      icon: '✨',
      title: 'Eternal Durability',
      description: 'Diamonds are the hardest natural material, symbolizing eternal love'
    },
    {
      icon: '🎨',
      title: 'Versatile Styles',
      description: 'Suitable for all styles from classic to modern'
    },
    {
      icon: '🏆',
      title: 'Symbol of Prestige',
      description: 'Diamonds are symbols of luxury and success'
    }
  ]

  return (
    <div className="diamond-info-page">
      <Container className="py-5">
        {/* Hero Section */}
        <Row className="mb-5">
          <Col lg={8} className="mx-auto text-center">
            <h1 className="display-4 fw-bold mb-3">
              <span className="text-primary">💎</span> The World of Diamonds
            </h1>
            <p className="lead text-muted mb-4">
              Discover the eternal beauty and timeless value of natural diamonds
            </p>
            <Badge bg="primary" className="fs-6 px-3 py-2">
              <i className="bi bi-gem me-1"></i>
              Premium Quality
            </Badge>
          </Col>
        </Row>

        {/* Introduction Section */}
        <Row className="mb-5">
          <Col lg={10} className="mx-auto">
            <Card className="shadow-sm border-0">
              <Card.Body className="p-4">
                <Row>
                  <Col md={6}>
                    <h2 className="h3 mb-3">What is a Diamond?</h2>
                    <p className="text-muted mb-3">
                      A diamond is the rarest natural mineral on Earth,
                      formed from pure carbon under extreme pressure and temperature
                      deep within the earth over millions of years.
                    </p>
                    <p className="text-muted">
                      With absolute hardness (level 10 on the Mohs scale),
                      diamonds are not only symbols of luxury but also
                      valuable materials for industry and jewelry.
                    </p>
                  </Col>
                  <Col md={6}>
                    <div className="text-center">
                      <img
                        src="https://cdn2.fptshop.com.vn/unsafe/hinh_nen_kim_cuong_4_30cbb04b22.png"
                        alt="Natural Diamond"
                        className="img-fluid rounded shadow"
                      />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* History Section */}
        <Row className="mb-5">
          <Col lg={10} className="mx-auto">
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-primary text-white">
                <h2 className="h4 mb-0">
                  <i className="bi bi-clock-history me-2"></i>
                  Diamond History
                </h2>
              </Card.Header>
              <Card.Body className="p-4">
                <Row>
                  <Col md={8}>
                    <div className="timeline">
                      <div className="timeline-item mb-4">
                        <Badge bg="secondary" className="me-3">3000 BC</Badge>
                        <strong>First Discovery:</strong> Diamonds were discovered in India,
                        considered as "protection against evil"
                      </div>
                      <div className="timeline-item mb-4">
                        <Badge bg="secondary" className="me-3">1477</Badge>
                        <strong>First Engagement Ring:</strong> Archduke Maximilian
                        of Austria gave a diamond ring to Mary of Burgundy
                      </div>
                      <div className="timeline-item mb-4">
                        <Badge bg="secondary" className="me-3">1866</Badge>
                        <strong>Largest Diamond:</strong> Discovery of the Cullinan diamond
                        3,106 carats in South Africa
                      </div>
                      <div className="timeline-item">
                        <Badge bg="secondary" className="me-3">1902</Badge>
                        <strong>De Beers Founded:</strong> Company controlling 90% of the
                        world diamond market
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center">
                      <img
                        src="https://www.elle.vn/wp-content/uploads/2015/08/20/the-gioi-kim-cuong-Archduke-Joseph.jpg"
                        alt="Diamond History"
                        className="img-fluid rounded shadow"
                      />
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Benefits Section */}
        <Row className="mb-5">
          <Col lg={10} className="mx-auto">
            <div className="text-center mb-4">
              <h2 className="h3">Benefits of Diamonds</h2>
              <p className="text-muted">Why diamonds are the perfect choice</p>
            </div>
            <Row>
              {diamondBenefits.map((benefit, index) => (
                <Col md={6} lg={3} key={index} className="mb-4">
                  <Card className="h-100 shadow-sm border-0 text-center">
                    <Card.Body className="p-4">
                      <div className="display-4 mb-3">{benefit.icon}</div>
                      <h5 className="card-title">{benefit.title}</h5>
                      <p className="card-text text-muted small">{benefit.description}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        {/* Certification Section */}
        <Row className="mb-5">
          <Col lg={10} className="mx-auto">
            <div className="text-center mb-4">
              <h2 className="h3">Diamond Certification</h2>
              <p className="text-muted">Ensure quality and value with trusted certification</p>
            </div>
            <Row>
              {certificationBodies.map((cert, index) => (
                <Col md={6} lg={4} key={index} className="mb-4">
                  <Card className="h-100 shadow-sm border-0">
                    <Card.Header className="text-center bg-light">
                      <img
                        src={cert.logo}
                        alt={cert.name}
                        className="img-fluid mb-2"
                        style={{ maxHeight: '50px' }}
                      />
                      <h6 className="mb-0">{cert.name}</h6>
                    </Card.Header>
                    <Card.Body className="p-3">
                      <p className="text-muted small mb-3">{cert.description}</p>
                      <ul className="list-unstyled small">
                        {cert.features.map((feature, idx) => (
                          <li key={idx} className="mb-1">
                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        {/* FAQ Section */}
        <Row className="mb-5">
          <Col lg={10} className="mx-auto">
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-info text-white">
                <h3 className="h5 mb-0">
                  <i className="bi bi-question-circle me-2"></i>
                  Frequently Asked Questions
                </h3>
              </Card.Header>
              <Card.Body className="p-4">
                <Accordion>
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>How are natural and lab-grown diamonds different?</Accordion.Header>
                    <Accordion.Body>
                      Natural diamonds are formed naturally in the earth over millions of years,
                      while lab-grown diamonds are created in laboratories.
                      Both have the same chemical structure, but their value and symbolic meaning differ.
                    </Accordion.Body>
                  </Accordion.Item>
                  <Accordion.Item eventKey="1">
                    <Accordion.Header>How to distinguish real diamonds from fakes?</Accordion.Header>
                    <Accordion.Body>
                      Real diamonds have high hardness and cannot be scratched by other materials.
                      Professional testing methods include thermal conductivity testing,
                      spectroscopy, and certification from reputable organizations.
                    </Accordion.Body>
                  </Accordion.Item>
                  <Accordion.Item eventKey="2">
                    <Accordion.Header>What are the 4C's of diamonds?</Accordion.Header>
                    <Accordion.Body>
                      The 4C's include: Carat (weight), Color (color), Clarity (purity),
                      and Cut (cut). These are the four most important criteria for evaluating diamond quality.
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Call to Action */}
        <Row>
          <Col lg={8} className="mx-auto text-center">
            <Card className="shadow-sm border-primary">
              <Card.Body className="p-4">
                <h3 className="h4 mb-3">Explore Our Diamond Collection</h3>
                <p className="text-muted mb-4">
                  Experience eternal beauty with our premium diamond collection
                </p>
                <a href="/shop" className="btn btn-primary btn-lg">
                  <i className="bi bi-shop me-2"></i>
                  View Products
                </a>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default DiamondInfo