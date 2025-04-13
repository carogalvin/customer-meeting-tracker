import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner, Table, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const BulkUpload = () => {
  const [activeTab, setActiveTab] = useState('customers');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResponse(null);
    setError(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    // Validate file type
    const fileType = file.type;
    if (fileType !== 'text/csv' && 
        fileType !== 'application/vnd.ms-excel' && 
        fileType !== 'application/json') {
      setError('Only CSV and JSON files are allowed');
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const endpoint = activeTab === 'customers' 
        ? `${API_URL}/bulk-upload/customers` 
        : `${API_URL}/bulk-upload/meetings`;
      
      const res = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setResponse(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'An error occurred during upload. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setFile(null);
    setResponse(null);
    setError(null);
  };

  const downloadTemplate = (type) => {
    let csvContent = '';
    
    if (type === 'customers') {
      csvContent = 'name,email,organization,topicsOfInterest,interestedInFeedback,interestedInPrivateBetas,dateOfLastMeeting\n' +
                  'John Doe,john@example.com,Acme Inc,"AI, Machine Learning",true,false,2023-01-15\n' +
                  'Jane Smith,jane@example.com,XYZ Corp,"Cloud Computing, Security",false,true,2023-02-20';
    } else {
      csvContent = 'customerEmail,meetingDate,notesLink,notes\n' +
                  'john@example.com,2023-03-15,https://docs.example.com/notes1,"Discussion about new features"\n' +
                  'jane@example.com,2023-04-10,https://docs.example.com/notes2,"Follow-up on beta testing"';
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_template.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2 className="mb-4">Bulk Upload</h2>
      
      <Tabs
        activeKey={activeTab}
        onSelect={handleTabChange}
        className="mb-4"
      >
        <Tab eventKey="customers" title="Customers">
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title>Upload Customers</Card.Title>
              <Card.Text>
                Upload a CSV or JSON file containing multiple customers to add them to the database.
                <Button 
                  variant="link" 
                  className="p-0 ms-2" 
                  onClick={() => downloadTemplate('customers')}
                >
                  Download template
                </Button>
              </Card.Text>
              
              <h6>Required Fields:</h6>
              <ul>
                <li><strong>name</strong> - Customer's full name</li>
                <li><strong>email</strong> - Customer's email address (must be unique)</li>
                <li><strong>organization</strong> - Customer's company or organization</li>
              </ul>
              
              <h6>Optional Fields:</h6>
              <ul>
                <li><strong>topicsOfInterest</strong> - Comma-separated list of interests</li>
                <li><strong>interestedInFeedback</strong> - "true" or "false"</li>
                <li><strong>interestedInPrivateBetas</strong> - "true" or "false"</li>
                <li><strong>dateOfLastMeeting</strong> - Date in YYYY-MM-DD format</li>
              </ul>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="meetings" title="Meetings">
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title>Upload Meetings</Card.Title>
              <Card.Text>
                Upload a CSV or JSON file containing multiple meetings to add them to the database.
                <Button 
                  variant="link" 
                  className="p-0 ms-2" 
                  onClick={() => downloadTemplate('meetings')}
                >
                  Download template
                </Button>
              </Card.Text>
              
              <h6>Required Fields:</h6>
              <ul>
                <li><strong>customerEmail</strong> - Email of an existing customer</li>
                <li><strong>meetingDate</strong> - Date of meeting in YYYY-MM-DD format</li>
              </ul>
              
              <h6>Optional Fields:</h6>
              <ul>
                <li><strong>notesLink</strong> - URL to meeting notes</li>
                <li><strong>notes</strong> - Text notes about the meeting</li>
              </ul>
              
              <div className="alert alert-info mb-0">
                <strong>Note:</strong> Customers must already exist in the system before uploading meetings for them.
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Form onSubmit={handleUpload}>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Upload {activeTab === 'customers' ? 'Customers' : 'Meetings'} File</Form.Label>
              <Form.Control 
                type="file" 
                onChange={handleFileChange}
                accept=".csv,.json"
                disabled={uploading}
              />
              <Form.Text className="text-muted">
                Select a CSV or JSON file containing {activeTab === 'customers' ? 'customer' : 'meeting'} data.
              </Form.Text>
            </Form.Group>
            
            {error && (
              <Alert variant="danger">{error}</Alert>
            )}
            
            <Button variant="primary" type="submit" disabled={!file || uploading}>
              {uploading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
      
      {response && (
        <Card className="shadow-sm">
          <Card.Body>
            <Card.Title>Upload Results</Card.Title>
            <Alert variant={response.errorCount > 0 ? "warning" : "success"}>
              {response.message}
            </Alert>
            
            {response.errors && response.errors.length > 0 && (
              <>
                <h6>Errors:</h6>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Row/Email</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {response.errors.map((err, idx) => (
                      <tr key={idx}>
                        <td>
                          {err.row || err.email || err.customerEmail || 'Unknown'}
                        </td>
                        <td>{err.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            )}
            
            {response.results && response.successCount > 0 && (
              <div className="mt-3">
                <h6>Successfully Processed {response.successCount} {activeTab === 'customers' ? 'Customers' : 'Meetings'}</h6>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default BulkUpload;