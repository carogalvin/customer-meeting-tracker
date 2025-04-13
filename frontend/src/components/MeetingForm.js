import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getCustomers, createMeeting, getMeetingById, updateMeeting } from '../services/api';

const MeetingForm = () => {
  const { id, customerId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    customer: customerId || '',
    notesLink: '',
    notes: '',
    meetingDate: new Date()
  });
  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all customers
        const customersData = await getCustomers();
        setCustomers(customersData);
        
        // If editing an existing meeting, fetch its data
        if (isEditMode) {
          const meetingData = await getMeetingById(id);
          setFormData({
            ...meetingData,
            customer: meetingData.customer._id || meetingData.customer,
            meetingDate: new Date(meetingData.meetingDate)
          });
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, customerId, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      meetingDate: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (isEditMode) {
        await updateMeeting(id, formData);
      } else {
        await createMeeting(formData);
      }
      
      // Navigate back to appropriate page
      if (customerId) {
        navigate(`/customers/${customerId}`);
      } else {
        navigate('/meetings');
      }
    } catch (err) {
      setError('Failed to save meeting. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title>
          {isEditMode ? 'Edit Meeting' : 'Add New Meeting'}
        </Card.Title>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Customer*</Form.Label>
                <Form.Select
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  required
                  disabled={!!customerId}
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} ({customer.organization})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Meeting Date*</Form.Label>
                <DatePicker
                  selected={formData.meetingDate}
                  onChange={handleDateChange}
                  className="form-control"
                  dateFormat="MMMM d, yyyy"
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Notes Document Link</Form.Label>
            <Form.Control
              type="url"
              name="notesLink"
              value={formData.notesLink}
              onChange={handleChange}
              placeholder="e.g. https://docs.google.com/document/d/..."
            />
            <Form.Text className="text-muted">
              Add a link to detailed meeting notes if available.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Meeting Notes/Takeaways</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter key points, action items, or important takeaways from the meeting..."
            />
          </Form.Group>

          <div className="d-flex gap-2 mt-3 justify-content-end">
            <Button 
              variant="secondary" 
              onClick={() => customerId ? navigate(`/customers/${customerId}`) : navigate('/meetings')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : (isEditMode ? 'Update Meeting' : 'Create Meeting')}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default MeetingForm;