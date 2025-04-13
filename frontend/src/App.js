import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Import components
import Navigation from './components/Navigation';
import CustomerList from './components/CustomerList';
import CustomerDetail from './components/CustomerDetail';
import CustomerForm from './components/CustomerForm';
import MeetingList from './components/MeetingList';
import MeetingDetail from './components/MeetingDetail';
import MeetingForm from './components/MeetingForm';
import BulkUpload from './components/BulkUpload';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/new" element={<CustomerForm />} />
            <Route path="/customers/edit/:id" element={<CustomerForm />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/meetings" element={<MeetingList />} />
            <Route path="/meetings/new" element={<MeetingForm />} />
            <Route path="/meetings/new/:customerId" element={<MeetingForm />} />
            <Route path="/meetings/edit/:id" element={<MeetingForm />} />
            <Route path="/meetings/:id" element={<MeetingDetail />} />
            <Route path="/bulk-upload" element={<BulkUpload />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
