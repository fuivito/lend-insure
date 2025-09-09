export interface BrokerClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  agreementCount: number;
  lastActivity: string;
}

export const mockBrokerClients: BrokerClient[] = [
  {
    id: "client-001",
    name: "Sarah Johnson",
    email: "sarah.johnson@motorinsurance.com",
    phone: "+44 7700 900123",
    agreementCount: 3,
    lastActivity: "2024-09-08"
  },
  {
    id: "client-002", 
    name: "Michael Chen",
    email: "m.chen@homeprotect.co.uk",
    phone: "+44 7700 900456",
    agreementCount: 1,
    lastActivity: "2024-09-07"
  },
  {
    id: "client-003",
    name: "Emma Wilson",
    email: "emma.wilson@travelinsure.com",
    phone: "+44 7700 900789",
    agreementCount: 2,
    lastActivity: "2024-09-06"
  },
  {
    id: "client-004",
    name: "David Thompson",
    email: "david.t@petcare.org",
    phone: "+44 7700 900012",
    agreementCount: 1,
    lastActivity: "2024-09-05"
  },
  {
    id: "client-005",
    name: "Jessica Brown",
    email: "j.brown@businesscover.co.uk",
    phone: "+44 7700 900345",
    agreementCount: 4,
    lastActivity: "2024-09-04"
  },
  {
    id: "client-006",
    name: "Robert Lee",
    email: "rob.lee@propertyguard.com",
    phone: "+44 7700 900678",
    agreementCount: 2,
    lastActivity: "2024-09-03"
  },
  {
    id: "client-007",
    name: "Lisa Martinez",
    email: "lisa.martinez@healthfirst.org",
    phone: "+44 7700 900901",
    agreementCount: 1,
    lastActivity: "2024-09-02"
  },
  {
    id: "client-008",
    name: "James Anderson",
    email: "james.anderson@autocare.co.uk",
    phone: "+44 7700 900234",
    agreementCount: 3,
    lastActivity: "2024-09-01"
  }
];