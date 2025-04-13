import React, { useState, useEffect } from 'react';
import { Table, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getMeetings } from '../services/api';
import moment from 'moment';

const MeetingList = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const data = await getMeetings();
        setMeetings(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch meetings. Please try again later.');
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Meetings</h2>
        <Button as={Link} to="/meetings/new" variant="success">
          Add New Meeting
        </Button>
      </div>

      {meetings.length === 0 ? (
        <Alert variant="info">No meetings found. Add your first meeting to get started.</Alert>
      ) : (
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Organization</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((meeting) => (
              <tr key={meeting._id}>
                <td style={{ width: '150px' }}>
                  {moment(meeting.meetingDate).format('MMM D, YYYY')}
                </td>
                <td>
                  {meeting.customer && (
                    <Link to={`/customers/${meeting.customer._id}`}>
                      {meeting.customer.name}
                    </Link>
                  )}
                </td>
                <td>
                  {meeting.customer && meeting.customer.organization}
                </td>
                <td>
                  {meeting.notes ? (
                    meeting.notes.length > 100 ?
                      `${meeting.notes.substring(0, 100)}...` :
                      meeting.notes
                  ) : (
                    <span className="text-muted">No notes</span>
                  )}
                </td>
                <td>
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
    </div>
  );
};

export default MeetingList;