// HRMS Type Definitions

export type UserRole = 'employee' | 'admin';

export type LeaveType = 'paid' | 'sick' | 'unpaid';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'on-leave';

export interface User {
  id: string;
  employeeId: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  designation: string;
  phone: string;
  address: string;
  joinDate: string;
  profileImage?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  reviewedBy?: string;
  reviewComment?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'paid' | 'pending';
}
