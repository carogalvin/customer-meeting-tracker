import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createCustomer, getCustomerById, updateCustomer } from '../services/api';

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    topicsOfInterest: '',
    interestedInFeedback: false,
    interestedInPrivateBetas: false,
    dateOfLastMeeting: null
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchCustomer = async () => {
        try {
          const data = await getCustomerById(id);
          setFormData({
            ...data,
            topicsOfInterest: data.topicsOfInterest.join(', '),
            dateOfLastMeeting: data.dateOfLastMeeting ? new Date(data.dateOfLastMeeting) : null
          });
          setLoading(false);
        } catch (err) {
          setError('Failed to load customer data. Please try again.');
          setLoading(false);
        }
      };

      fetchCustomer();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      dateOfLastMeeting: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Process topics of interest from comma-separated string to array
      const processedData = {
        ...formData,
        topicsOfInterest: formData.topicsOfInterest
          ? formData.topicsOfInterest.split(',').map(topic => topic.trim())
          : []
      };
      
      if (isEditMode) {
        await updateCustomer(id, processedData);
      } else {
        await createCustomer(processedData);
      }
      
      navigate('/customers');
    } catch (err) {
      setError('Failed to save customer. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title>{isEditMode ? 'Edit Customer' : 'Add New Customer'}</Card.Title>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Name*</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email*</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Organization*</Form.Label>
            <Form.Control
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Topics of Interest (comma-separated)</Form.Label>
            <Form.Control
              type="text"
              name="topicsOfInterest"
              value={formData.topicsOfInterest}
              onChange={handleChange}
              placeholder="e.g. AI, Machine Learning, Cloud Solutions"
            />
          </Form.Group>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Interested in providing feedback"
                  name="interestedInFeedback"
                  checked={formData.interestedInFeedback}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Interested in private betas"
                  name="interestedInPrivateBetas"
                  checked={formData.interestedInPrivateBetas}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Last Meeting Date</Form.Label>
                <DatePicker
                  selected={formData.dateOfLastMeeting}
                  onChange={handleDateChange}
                  className="form-control"
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Select date"
                  isClearable
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex gap-2 mt-3 justify-content-end">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/customers')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : (isEditMode ? 'Update Customer' : 'Create Customer')}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CustomerForm;