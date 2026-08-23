export interface Student {
  id: string;
  name: string;
  email: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  className: string;
  birthDate: string;
  gpa: number;
  status: 'Active' | 'Graduated' | 'Suspended';
}

export interface SchoolClass {
  id: string;
  name: string;
}

export interface StudentStatistics {
  totalCount: number;
  activeCount: number;
  graduatedCount: number;
  suspendedCount: number;
  averageGpa: number;
}
