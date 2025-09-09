export interface ExtractedClientData {
  name: string;
  dateOfBirth: string;
  address: string;
  email: string;
  phone: string;
  policyRef: string;
  confidence: {
    name: number;
    dateOfBirth: number;
    address: number;
    email: number;
    phone: number;
    policyRef: number;
  };
}

export const mockExtractedData: ExtractedClientData = {
  name: "Rebecca Thompson",
  dateOfBirth: "1985-03-15",
  address: "45 Oak Street, Manchester, M1 2AB",
  email: "rebecca.thompson@example.com",
  phone: "+44 7700 900555",
  policyRef: "POL-2024-789456",
  confidence: {
    name: 95,
    dateOfBirth: 88,
    address: 92,
    email: 97,
    phone: 85,
    policyRef: 91
  }
};