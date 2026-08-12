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
