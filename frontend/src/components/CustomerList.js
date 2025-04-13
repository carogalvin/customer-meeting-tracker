import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Alert, Spinner, Form, InputGroup, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getCustomers } from '../services/api';
import moment from 'moment';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // New filter states
  const [interestFilter, setInterestFilter] = useState('');
  const [feedbackFilter, setFeedbackFilter] = useState('any');
  const [betaFilter, setBetaFilter] = useState('any');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers();
        setCustomers(data);
        setFilteredCustomers(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch customers. Please try again later.');
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Get all unique interests from customers for the filter dropdown
  const getAllInterests = () => {
    const interestsSet = new Set();
    customers.forEach(customer => {
      customer.topicsOfInterest.forEach(topic => {
        interestsSet.add(topic);
      });
    });
    return Array.from(interestsSet).sort();
  };

  // Apply all filters and search
  useEffect(() => {
    let filtered = [...customers];
    
    // Apply text search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.organization.toLowerCase().includes(term) ||
        customer.topicsOfInterest.some(topic => 
          topic.toLowerCase().includes(term)
        )
      );
    }
    
    // Apply interest filter
    if (interestFilter) {
      filtered = filtered.filter(customer => 
        customer.topicsOfInterest.some(topic => 
          topic === interestFilter
        )
      );
    }
    
    // Apply feedback filter
    if (feedbackFilter !== 'any') {
      const isInterested = feedbackFilter === 'yes';
      filtered = filtered.filter(customer => 
        customer.interestedInFeedback === isInterested
      );
    }
    
    // Apply beta filter
    if (betaFilter !== 'any') {
      const isInterested = betaFilter === 'yes';
      filtered = filtered.filter(customer => 
        customer.interestedInPrivateBetas === isInterested
      );
    }
    
    setFilteredCustomers(filtered);
  }, [searchTerm, interestFilter, feedbackFilter, betaFilter, customers]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setInterestFilter('');
    setFeedbackFilter('any');
    setBetaFilter('any');
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  // Check if any filter is active
  const isFilterActive = searchTerm || interestFilter || feedbackFilter !== 'any' || betaFilter !== 'any';

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Customers</h2>
        <Button as={Link} to="/customers/new" variant="success">
          Add New Customer
        </Button>
      </div>

      {/* Search Box */}
      <div className="mb-4">
        <InputGroup className="mb-2">
          <Form.Control
            placeholder="Search customers by name, email, organization..."
            value={searchTerm}
            onChange={handleSearch}
            aria-label="Search customers"
          />
          <Button 
            variant="outline-secondary" 
            onClick={toggleFilters}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          {isFilterActive && (
            <Button 
              variant="outline-danger" 
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          )}
        </InputGroup>

        {/* Advanced Filters */}
        {showFilters && (
          <Card className="mb-3">
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Topic of Interest</Form.Label>
                    <Form.Select
                      value={interestFilter}
                      onChange={(e) => setInterestFilter(e.target.value)}
                    >
                      <option value="">Any Topic</option>
                      {getAllInterests().map(interest => (
                        <option key={interest} value={interest}>
                          {interest}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Interested in Feedback</Form.Label>
                    <Form.Select
                      value={feedbackFilter}
                      onChange={(e) => setFeedbackFilter(e.target.value)}
                    >
                      <option value="any">Any</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Interested in Private Betas</Form.Label>
                    <Form.Select
                      value={betaFilter}
                      onChange={(e) => setBetaFilter(e.target.value)}
                    >
                      <option value="any">Any</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {isFilterActive && (
          <div className="text-muted mt-1">
            Found {filteredCustomers.length} out of {customers.length} customers
          </div>
        )}
      </div>

      {customers.length === 0 ? (
        <Alert variant="info">No customers found. Add your first customer to get started.</Alert>
      ) : filteredCustomers.length === 0 ? (
        <Alert variant="info">No customers match your search criteria.</Alert>
      ) : (
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Organization</th>
              <th>Email</th>
              <th>Interests</th>
              <th>Last Meeting</th>
              <th>Feedback</th>
              <th>Beta</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer._id}>
                <td>
                  <Link to={`/customers/${customer._id}`}>
                    {customer.name}
                  </Link>
                </td>
                <td>{customer.organization}</td>
                <td>
                  <a href={`mailto:${customer.email}`}>{customer.email}</a>
                </td>
                <td>
                  {customer.topicsOfInterest.map((topic, index) => (
                    <Badge 
                      bg={interestFilter === topic ? "primary" : "secondary"} 
                      className="me-1 mb-1" 
                      key={index}
                      onClick={() => setInterestFilter(interestFilter === topic ? '' : topic)}
                      style={{ cursor: 'pointer' }}
                    >
                      {topic}
                    </Badge>
                  ))}
                </td>
                <td>
                  {customer.dateOfLastMeeting 
                    ? moment(customer.dateOfLastMeeting).format('MMM D, YYYY') 
                    : 'No meetings yet'}
                </td>
                <td>
                  {customer.interestedInFeedback ? (
                    <Badge 
                      bg="success"
                      onClick={() => setFeedbackFilter(feedbackFilter === 'yes' ? 'any' : 'yes')}
                      style={{ cursor: 'pointer' }}
                    >
                      Yes
                    </Badge>
                  ) : (
                    <Badge 
                      bg="light" 
                      text="dark"
                      onClick={() => setFeedbackFilter(feedbackFilter === 'no' ? 'any' : 'no')}
                      style={{ cursor: 'pointer' }}
                    >
                      No
                    </Badge>
                  )}
                </td>
                <td>
                  {customer.interestedInPrivateBetas ? (
                    <Badge 
                      bg="success"
                      onClick={() => setBetaFilter(betaFilter === 'yes' ? 'any' : 'yes')}
                      style={{ cursor: 'pointer' }}
                    >
                      Yes
                    </Badge>
                  ) : (
                    <Badge 
                      bg="light" 
                      text="dark"
                      onClick={() => setBetaFilter(betaFilter === 'no' ? 'any' : 'no')}
                      style={{ cursor: 'pointer' }}
                    >
                      No
                    </Badge>
                  )}
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button 
                      as={Link} 
                      to={`/customers/${customer._id}`} 
                      variant="primary" 
                      size="sm"
                    >
                      View
                    </Button>
                    <Button 
                      as={Link} 
                      to={`/meetings/new/${customer._id}`} 
                      variant="outline-primary" 
                      size="sm"
                    >
                      Add Meeting
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default CustomerList;