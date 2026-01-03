import { User, AttendanceRecord, LeaveRequest, PayrollRecord } from '@/types/hrms';

export const mockUsers: User[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    email: 'john.doe@dayflow.com',
    name: 'John Doe',
    role: 'employee',
    department: 'Engineering',
    designation: 'Software Developer',
    phone: '+1 234 567 8901',
    address: '123 Tech Street, Silicon Valley, CA',
    joinDate: '2023-01-15',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '2',
    employeeId: 'EMP002',
    email: 'sarah.admin@dayflow.com',
    name: 'Sarah Johnson',
    role: 'admin',
    department: 'Human Resources',
    designation: 'HR Manager',
    phone: '+1 234 567 8902',
    address: '456 HR Avenue, Silicon Valley, CA',
    joinDate: '2022-06-01',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '3',
    employeeId: 'EMP003',
    email: 'mike.wilson@dayflow.com',
    name: 'Mike Wilson',
    role: 'employee',
    department: 'Marketing',
    designation: 'Marketing Specialist',
    phone: '+1 234 567 8903',
    address: '789 Marketing Blvd, Silicon Valley, CA',
    joinDate: '2023-03-20',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '4',
    employeeId: 'EMP004',
    email: 'emily.chen@dayflow.com',
    name: 'Emily Chen',
    role: 'employee',
    department: 'Finance',
    designation: 'Financial Analyst',
    phone: '+1 234 567 8904',
    address: '321 Finance Way, Silicon Valley, CA',
    joinDate: '2023-05-10',
    profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  }
];

export const mockAttendance: AttendanceRecord[] = [
  { id: '1', employeeId: 'EMP001', date: '2026-01-03', checkIn: '09:00', checkOut: '18:00', status: 'present' },
  { id: '2', employeeId: 'EMP001', date: '2026-01-02', checkIn: '09:15', checkOut: '18:30', status: 'present' },
  { id: '3', employeeId: 'EMP001', date: '2026-01-01', status: 'absent' },
  { id: '4', employeeId: 'EMP001', date: '2025-12-31', checkIn: '09:00', checkOut: '13:00', status: 'half-day' },
  { id: '5', employeeId: 'EMP001', date: '2025-12-30', status: 'on-leave' },
  { id: '6', employeeId: 'EMP003', date: '2026-01-03', checkIn: '08:45', checkOut: '17:45', status: 'present' },
  { id: '7', employeeId: 'EMP003', date: '2026-01-02', checkIn: '09:00', checkOut: '18:00', status: 'present' },
  { id: '8', employeeId: 'EMP004', date: '2026-01-03', checkIn: '09:30', checkOut: '18:30', status: 'present' },
  { id: '9', employeeId: 'EMP004', date: '2026-01-02', status: 'on-leave' },
];

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    leaveType: 'paid',
    startDate: '2026-01-10',
    endDate: '2026-01-12',
    reason: 'Family vacation',
    status: 'pending',
    appliedOn: '2026-01-02'
  },
  {
    id: '2',
    employeeId: 'EMP003',
    employeeName: 'Mike Wilson',
    leaveType: 'sick',
    startDate: '2026-01-05',
    endDate: '2026-01-06',
    reason: 'Medical appointment',
    status: 'approved',
    appliedOn: '2026-01-03',
    reviewedBy: 'Sarah Johnson',
    reviewComment: 'Approved. Get well soon!'
  },
  {
    id: '3',
    employeeId: 'EMP004',
    employeeName: 'Emily Chen',
    leaveType: 'unpaid',
    startDate: '2026-01-15',
    endDate: '2026-01-20',
    reason: 'Personal reasons',
    status: 'pending',
    appliedOn: '2026-01-01'
  }
];

export const mockPayroll: PayrollRecord[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    month: 'December',
    year: 2025,
    basicSalary: 5000,
    allowances: 800,
    deductions: 450,
    netSalary: 5350,
    status: 'paid'
  },
  {
    id: '2',
    employeeId: 'EMP001',
    month: 'November',
    year: 2025,
    basicSalary: 5000,
    allowances: 800,
    deductions: 450,
    netSalary: 5350,
    status: 'paid'
  },
  {
    id: '3',
    employeeId: 'EMP003',
    month: 'December',
    year: 2025,
    basicSalary: 4500,
    allowances: 600,
    deductions: 380,
    netSalary: 4720,
    status: 'paid'
  },
  {
    id: '4',
    employeeId: 'EMP004',
    month: 'December',
    year: 2025,
    basicSalary: 5500,
    allowances: 900,
    deductions: 520,
    netSalary: 5880,
    status: 'pending'
  }
];
