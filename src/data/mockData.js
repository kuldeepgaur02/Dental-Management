export const mockData = {
  users: [
    {
      id: "1",
      role: "Admin",
      email: "admin@entnt.in",
      password: "admin123",
      name: "Dr. Anika Sharma",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: "2",
      role: "Patient",
      email: "shyam@entnt.in",
      password: "patient123",
      patientId: "p1",
      name: "Shyam kalyan"
    },
    {
      id: "3",
      role: "Patient",
      email: "jaspreet@entnt.in",
      password: "patient123",
      patientId: "p2",
      name: "Jaspreet Bhati"
    },
    {
      id: "4",
      role: "Patient",
      email: "gaurav@entnt.in",
      password: "patient123",
      patientId: "p3",
      name: "Gaurav Kumar"
    }
  ],
  patients: [
    {
      id: "p1",
      name: "Shyam kalyan",
      dob: "1990-05-10",
      contact: "1234567890",
      email: "shyam@entnt.in",
      address: "123 Main St, Delhi,India",
      healthInfo: "No allergies, Previous root canal treatment",
      emergencyContact: "9876543210",
      bloodGroup: "O+",
      createdAt: "2024-01-15T10:00:00Z"
    },
    {
      id: "p2",
      name: "Jaspreet Bhati",
      dob: "1985-08-22",
      contact: "2345678901",
      email: "jaspreet@entnt.in",
      address: "456 prem nagar, Delhi,India",
      healthInfo: "Allergic to penicillin, Diabetes Type 2",
      emergencyContact: "8765432109",
      bloodGroup: "A+",
      createdAt: "2024-02-10T14:30:00Z"
    },
    {
      id: "p3",
      name: "Gaurav Kumar",
      dob: "1992-12-03",
      contact: "3456789012",
      email: "gaurav@entnt.in",
      address: "789 Dwarka expressway ,Delhi, India",
      healthInfo: "No known allergies, Regular smoker",
      emergencyContact: "7654321098",
      bloodGroup: "B+",
      createdAt: "2024-03-05T09:15:00Z"
    },
    {
      id: "p4",
      name: "Ruhani Arora",
      dob: "1988-07-14",
      contact: "4567890123",
      email: "ruhani@entnt.in",
      address: "3 Shahadra,Delhi, India",
      healthInfo: "Hypertension, No drug allergies",
      emergencyContact: "6543210987",
      bloodGroup: "AB+",
      createdAt: "2024-04-12T16:45:00Z"
    }
  ],
  incidents: [
    {
      id: "i1",
      patientId: "p1",
      title: "Routine Cleaning",
      description: "Regular dental cleaning and check-up",
      comments: "Good oral hygiene, minor plaque buildup",
      appointmentDate: "2025-07-15T10:00:00",
      cost: 120,
      treatment: "Professional cleaning, fluoride treatment",
      status: "Completed",
      nextAppointmentDate: "2025-10-15T10:00:00",
      createdAt: "2025-06-20T10:00:00Z",
      files: [
        {
          name: "cleaning_report.pdf",
          url: "data:application/pdf;base64,JVBERi0xLjQKJcOkw6o=",
          type: "application/pdf",
          size: 1024
        }
      ]
    },
    {
      id: "i2",
      patientId: "p1",
      title: "Toothache Treatment",
      description: "Upper molar pain and sensitivity",
      comments: "Sensitive to cold, possible cavity",
      appointmentDate: "2025-07-22T14:30:00",
      cost: 280,
      treatment: "Cavity filling, pain relief medication",
      status: "Scheduled",
      nextAppointmentDate: null,
      createdAt: "2025-06-25T14:30:00Z",
      files: []
    },
    {
      id: "i3",
      patientId: "p2",
      title: "Crown Installation",
      description: "Installing ceramic crown on damaged tooth",
      comments: "Previous root canal, ready for crown",
      appointmentDate: "2025-07-08T11:00:00",
      cost: 850,
      treatment: "Ceramic crown installation",
      status: "In Progress",
      nextAppointmentDate: "2025-07-20T11:00:00",
      createdAt: "2025-06-15T11:00:00Z",
      files: [
        {
          name: "xray_crown.png",
          url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
          type: "image/png",
          size: 2048
        }
      ]
    },
    {
      id: "i4",
      patientId: "p3",
      title: "Wisdom Tooth Extraction",
      description: "Removal of impacted wisdom tooth",
      comments: "Impacted lower right wisdom tooth causing pain",
      appointmentDate: "2025-07-05T09:00:00",
      cost: 450,
      treatment: "Surgical extraction, post-op care",
      status: "Completed",
      nextAppointmentDate: "2025-07-12T09:00:00",
      createdAt: "2025-06-10T09:00:00Z",
      files: [
        {
          name: "post_extraction.jpg",
          url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
          type: "image/jpeg",
          size: 3072
        }
      ]
    },
    {
      id: "i5",
      patientId: "p4",
      title: "Dental Implant Consultation",
      description: "Initial consultation for dental implant",
      comments: "Missing upper incisor, good bone density",
      appointmentDate: "2025-07-30T15:00:00",
      cost: 200,
      treatment: "Consultation and treatment planning",
      status: "Scheduled",
      nextAppointmentDate: "2025-08-15T15:00:00",
      createdAt: "2025-06-28T15:00:00Z",
      files: []
    }
  ]
};

export const getInitialData = () => {
  const storedUsers = JSON.parse(localStorage.getItem('dental_users') || 'null');
  const storedPatients = JSON.parse(localStorage.getItem('dental_patients') || 'null');
  const storedIncidents = JSON.parse(localStorage.getItem('dental_incidents') || 'null');

  if (!storedUsers || !storedPatients || !storedIncidents) {
    localStorage.setItem('dental_users', JSON.stringify(mockData.users));
    localStorage.setItem('dental_patients', JSON.stringify(mockData.patients));
    localStorage.setItem('dental_incidents', JSON.stringify(mockData.incidents));
    
    return mockData;
  }

  return {
    users: storedUsers,
    patients: storedPatients,
    incidents: storedIncidents
  };
};