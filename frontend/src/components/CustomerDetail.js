import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Row, Col, Alert, Spinner, Table, Modal } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import moment from 'moment';
import { getCustomerById, getCustomerMeetings, deleteCustomer } from '../services/api';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const customerData = await getCustomerById(id);
        setCustomer(customerData);
        
        const meetingsData = await getCustomerMeetings(id);
        setMeetings(meetingsData);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load customer data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteCustomer(id);
      navigate('/customers');
    } catch (err) {
      setError('Failed to delete customer. Please try again.');
      setShowDeleteModal(false);
    }
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

  if (!customer) {
    return <Alert variant="warning">Customer not found.</Alert>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Customer Details</h2>
        <div>
          <Button 
            as={Link} 
            to="/customers" 
            variant="outline-secondary" 
            className="me-2"
          >
            Back to Customers
          </Button>
          <Button 
            as={Link}
            to={`/meetings/new/${id}`}
            variant="primary"
            className="me-2"
          >
            Add Meeting
          </Button>
          <Button
            as={Link}
            to={`/customers/edit/${id}`}
            variant="outline-primary"
            className="me-2"
          >
            Edit
          </Button>
          <Button
            variant="outline-danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <Row>
        <Col md={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <dl>
                    <dt>Name</dt>
                    <dd className="fs-4">{customer.name}</dd>
                    
                    <dt>Email</dt>
                    <dd>
                      <a href={`mailto:${customer.email}`}>{customer.email}</a>
                    </dd>
                    
                    <dt>Organization</dt>
                    <dd>{customer.organization}</dd>
                  </dl>
                </Col>
                
                <Col md={6}>
                  <dl>
                    <dt>Last Meeting</dt>
                    <dd>
                      {customer.dateOfLastMeeting 
                        ? moment(customer.dateOfLastMeeting).format('MMMM D, YYYY') 
                        : 'No meetings yet'}
                    </dd>
                    
                    <dt>Provides Feedback</dt>
                    <dd>
                      {customer.interestedInFeedback ? (
                        <Badge bg="success">Yes</Badge>
                      ) : (
                        <Badge bg="light" text="dark">No</Badge>
                      )}
                    </dd>
                    
                    <dt>Participates in Private Betas</dt>
                    <dd>
                      {customer.interestedInPrivateBetas ? (
                        <Badge bg="success">Yes</Badge>
                      ) : (
                        <Badge bg="light" text="dark">No</Badge>
                      )}
                    </dd>
                  </dl>
                </Col>
              </Row>
              
              <dl>
                <dt>Topics of Interest</dt>
                <dd>
                  {customer.topicsOfInterest.length > 0 ? (
                    customer.topicsOfInterest.map((topic, index) => (
                      <Badge bg="secondary" className="me-1 mb-1" key={index}>
                        {topic}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted">No topics specified</span>
                  )}
                </dd>
              </dl>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Customer Since</Card.Title>
              <Card.Text>
                {moment(customer.createdAt).format('MMMM D, YYYY')}
                <span className="text-muted ms-2">
                  ({moment(customer.createdAt).fromNow()})
                </span>
              </Card.Text>
              
              <Card.Title className="mt-3">Last Updated</Card.Title>
              <Card.Text>
                {moment(customer.updatedAt).format('MMMM D, YYYY')}
                <span className="text-muted ms-2">
                  ({moment(customer.updatedAt).fromNow()})
                </span>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h3 className="mt-4 mb-3">Meetings</h3>
      
      {meetings.length === 0 ? (
        <Alert variant="info">
          No meetings recorded for this customer yet.{' '}
          <Link to={`/meetings/new/${id}`}>Schedule a meeting</Link>
        </Alert>
      ) : (
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((meeting) => (
              <tr key={meeting._id}>
                <td style={{ width: '200px' }}>
                  {moment(meeting.meetingDate).format('MMM D, YYYY')}
                </td>
                <td>
                  {meeting.notes ? (
                    meeting.notes.length > 120 ? 
                      `${meeting.notes.substring(0, 120)}...` : 
                      meeting.notes
                  ) : (
                    <span className="text-muted">No notes</span>
                  )}
                </td>
                <td style={{ width: '150px' }}>
                  <Button
                    as={Link}
                    to={`/meetings/${meeting._id}`}
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                  >
                    View
                  </Button>
                  <Button
                    as={Link}
                    to={`/meetings/edit/${meeting._id}`}
                    variant="outline-secondary"
                    size="sm"
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete <strong>{customer.name}</strong>?</p>
          <p className="text-danger">
            This will also delete all associated meetings and cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Customer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CustomerDetail;