import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <h1 className="mb-4 text-center">Customer Meetings App</h1>
      <p className="lead text-center mb-5">
        Manage your customer interactions, track feedback, and organize private beta participation.
      </p>
      
      <Row className="justify-content-center mb-4">
        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title>Customers</Card.Title>
              <Card.Text>
                Manage your customers, their interests, and preferences for feedback and private beta participation.
              </Card.Text>
              <div className="d-grid gap-2">
                <Button as={Link} to="/customers" variant="primary">View Customers</Button>
                <Button as={Link} to="/customers/new" variant="outline-primary">Add New Customer</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title>Meetings</Card.Title>
              <Card.Text>
                Keep track of customer meetings, store notes, and document important takeaways.
              </Card.Text>
              <div className="d-grid gap-2">
                <Button as={Link} to="/meetings" variant="primary">View Meetings</Button>
                <Button as={Link} to="/meetings/new" variant="outline-primary">Add New Meeting</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title>Bulk Upload</Card.Title>
              <Card.Text>
                Pre-populate your database by uploading CSV or JSON files with multiple customers or meetings.
              </Card.Text>
              <div className="d-grid gap-2">
                <Button as={Link} to="/bulk-upload" variant="primary">Bulk Upload</Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;