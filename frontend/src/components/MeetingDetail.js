import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Alert, Spinner, Modal } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import moment from 'moment';
import { getMeetingById, deleteMeeting } from '../services/api';

const MeetingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const data = await getMeetingById(id);
        setMeeting(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load meeting data. Please try again.');
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteMeeting(id);
      // If meeting was fetched successfully, we have a customer ID to navigate back to
      if (meeting && meeting.customer) {
        const customerId = typeof meeting.customer === 'object' ? meeting.customer._id : meeting.customer;
        navigate(`/customers/${customerId}`);
      } else {
        navigate('/meetings');
      }
    } catch (err) {
      setError('Failed to delete meeting. Please try again.');
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

  if (!meeting) {
    return <Alert variant="warning">Meeting not found.</Alert>;
  }

  // Determine customer ID correctly regardless of whether customer is populated or just an ID
  const customerId = typeof meeting.customer === 'object' ? meeting.customer._id : meeting.customer;
  const customerName = typeof meeting.customer === 'object' ? meeting.customer.name : 'Customer';

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Meeting Details</h2>
        <div>
          <Button 
            as={Link} 
            to="/meetings" 
            variant="outline-secondary" 
            className="me-2"
          >
            Back to Meetings
          </Button>
          <Button
            as={Link}
            to={`/meetings/edit/${id}`}
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

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <dl>
                <dt>Meeting Date</dt>
                <dd className="fs-4">
                  {moment(meeting.meetingDate).format('MMMM D, YYYY')}
                </dd>
                
                <dt>Customer</dt>
                <dd>
                  {typeof meeting.customer === 'object' ? (
                    <Link to={`/customers/${meeting.customer._id}`}>
                      {meeting.customer.name}
                      {meeting.customer.organization && ` (${meeting.customer.organization})`}
                    </Link>
                  ) : (
                    'Customer information not available'
                  )}
                </dd>
              </dl>
            </Col>
            
            <Col md={6}>
              <dl>
                <dt>Created</dt>
                <dd>
                  {moment(meeting.createdAt).format('MMM D, YYYY')}
                  <span className="text-muted ms-2">
                    ({moment(meeting.createdAt).fromNow()})
                  </span>
                </dd>
                
                <dt>Last Updated</dt>
                <dd>
                  {moment(meeting.updatedAt).format('MMM D, YYYY')}
                  <span className="text-muted ms-2">
                    ({moment(meeting.updatedAt).fromNow()})
                  </span>
                </dd>
              </dl>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Card.Title>Notes Document</Card.Title>
          {meeting.notesLink ? (
            <Card.Text>
              <a href={meeting.notesLink} target="_blank" rel="noopener noreferrer">
                {meeting.notesLink}
              </a>
            </Card.Text>
          ) : (
            <Card.Text className="text-muted">
              No external notes document linked.
            </Card.Text>
          )}
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title>Meeting Notes & Takeaways</Card.Title>
          {meeting.notes ? (
            <Card.Text style={{ whiteSpace: 'pre-line' }}>
              {meeting.notes}
            </Card.Text>
          ) : (
            <Card.Text className="text-muted">
              No notes recorded for this meeting.
            </Card.Text>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this meeting with <strong>{customerName}</strong> from <strong>{moment(meeting.meetingDate).format('MMMM D, YYYY')}</strong>?</p>
          <p className="text-danger">
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Meeting
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MeetingDetail;