-- ============================================
-- DAYFLOW HRMS - Oracle Database Schema
-- Human Resource Management System
-- ============================================

-- =====================
-- 1. DROP EXISTING OBJECTS (for clean setup)
-- =====================

-- Drop triggers first
DROP TRIGGER trg_auto_attendance_on_leave_approval;
DROP TRIGGER trg_audit_leave_status;

-- Drop procedures
DROP PROCEDURE sp_apply_leave;
DROP PROCEDURE sp_approve_leave;
DROP PROCEDURE sp_reject_leave;
DROP PROCEDURE sp_mark_attendance;

-- Drop sequences
DROP SEQUENCE seq_employee_id;
DROP SEQUENCE seq_attendance_id;
DROP SEQUENCE seq_leave_id;
DROP SEQUENCE seq_payroll_id;

-- Drop tables (in correct order due to foreign keys)
DROP TABLE payroll CASCADE CONSTRAINTS;
DROP TABLE leave_requests CASCADE CONSTRAINTS;
DROP TABLE attendance CASCADE CONSTRAINTS;
DROP TABLE employees CASCADE CONSTRAINTS;
DROP TABLE departments CASCADE CONSTRAINTS;

-- =====================
-- 2. CREATE SEQUENCES
-- =====================

CREATE SEQUENCE seq_employee_id START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_attendance_id START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_leave_id START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_payroll_id START WITH 1 INCREMENT BY 1;

-- =====================
-- 3. CREATE TABLES
-- =====================

-- Departments Table
CREATE TABLE departments (
    dept_id         NUMBER PRIMARY KEY,
    dept_name       VARCHAR2(100) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees Table
CREATE TABLE employees (
    emp_id          NUMBER PRIMARY KEY,
    employee_code   VARCHAR2(20) UNIQUE NOT NULL,
    email           VARCHAR2(100) UNIQUE NOT NULL,
    password_hash   VARCHAR2(255) NOT NULL,
    full_name       VARCHAR2(100) NOT NULL,
    role            VARCHAR2(20) DEFAULT 'employee' CHECK (role IN ('employee', 'admin')),
    dept_id         NUMBER REFERENCES departments(dept_id),
    designation     VARCHAR2(100),
    phone           VARCHAR2(20),
    address         VARCHAR2(255),
    join_date       DATE DEFAULT SYSDATE,
    profile_image   VARCHAR2(255),
    is_active       CHAR(1) DEFAULT 'Y' CHECK (is_active IN ('Y', 'N')),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Table
CREATE TABLE attendance (
    attendance_id   NUMBER PRIMARY KEY,
    emp_id          NUMBER REFERENCES employees(emp_id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    check_in_time   TIMESTAMP,
    check_out_time  TIMESTAMP,
    status          VARCHAR2(20) DEFAULT 'absent' 
                    CHECK (status IN ('present', 'absent', 'half-day', 'on-leave')),
    remarks         VARCHAR2(255),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_emp_date UNIQUE (emp_id, attendance_date)
);

-- Leave Requests Table
CREATE TABLE leave_requests (
    leave_id        NUMBER PRIMARY KEY,
    emp_id          NUMBER REFERENCES employees(emp_id) ON DELETE CASCADE,
    leave_type      VARCHAR2(20) NOT NULL CHECK (leave_type IN ('paid', 'sick', 'unpaid')),
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    reason          VARCHAR2(500),
    status          VARCHAR2(20) DEFAULT 'pending' 
                    CHECK (status IN ('pending', 'approved', 'rejected')),
    applied_on      DATE DEFAULT SYSDATE,
    reviewed_by     NUMBER REFERENCES employees(emp_id),
    review_comment  VARCHAR2(255),
    reviewed_at     TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_leave_dates CHECK (end_date >= start_date)
);

-- Payroll Table
CREATE TABLE payroll (
    payroll_id      NUMBER PRIMARY KEY,
    emp_id          NUMBER REFERENCES employees(emp_id) ON DELETE CASCADE,
    pay_month       VARCHAR2(20) NOT NULL,
    pay_year        NUMBER(4) NOT NULL,
    basic_salary    NUMBER(10,2) NOT NULL,
    allowances      NUMBER(10,2) DEFAULT 0,
    deductions      NUMBER(10,2) DEFAULT 0,
    net_salary      NUMBER(10,2) GENERATED ALWAYS AS (basic_salary + allowances - deductions) VIRTUAL,
    payment_status  VARCHAR2(20) DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending')),
    payment_date    DATE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_emp_month_year UNIQUE (emp_id, pay_month, pay_year)
);

-- =====================
-- 4. CREATE INDEXES
-- =====================

CREATE INDEX idx_attendance_emp_id ON attendance(emp_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_leave_emp_id ON leave_requests(emp_id);
CREATE INDEX idx_leave_status ON leave_requests(status);
CREATE INDEX idx_payroll_emp_id ON payroll(emp_id);

-- =====================
-- 5. INSERT SAMPLE DATA
-- =====================

-- Insert Departments
INSERT INTO departments (dept_id, dept_name) VALUES (1, 'Engineering');
INSERT INTO departments (dept_id, dept_name) VALUES (2, 'Human Resources');
INSERT INTO departments (dept_id, dept_name) VALUES (3, 'Marketing');
INSERT INTO departments (dept_id, dept_name) VALUES (4, 'Finance');

-- Insert Employees
INSERT INTO employees (emp_id, employee_code, email, password_hash, full_name, role, dept_id, designation, phone, address, join_date)
VALUES (seq_employee_id.NEXTVAL, 'EMP001', 'john.doe@dayflow.com', 'hashed_password_123', 'John Doe', 'employee', 1, 'Software Developer', '+1 234 567 8901', '123 Tech Street, Silicon Valley, CA', DATE '2023-01-15');

INSERT INTO employees (emp_id, employee_code, email, password_hash, full_name, role, dept_id, designation, phone, address, join_date)
VALUES (seq_employee_id.NEXTVAL, 'EMP002', 'sarah.admin@dayflow.com', 'hashed_password_456', 'Sarah Johnson', 'admin', 2, 'HR Manager', '+1 234 567 8902', '456 HR Avenue, Silicon Valley, CA', DATE '2022-06-01');

INSERT INTO employees (emp_id, employee_code, email, password_hash, full_name, role, dept_id, designation, phone, address, join_date)
VALUES (seq_employee_id.NEXTVAL, 'EMP003', 'mike.wilson@dayflow.com', 'hashed_password_789', 'Mike Wilson', 'employee', 3, 'Marketing Specialist', '+1 234 567 8903', '789 Marketing Blvd, Silicon Valley, CA', DATE '2023-03-20');

INSERT INTO employees (emp_id, employee_code, email, password_hash, full_name, role, dept_id, designation, phone, address, join_date)
VALUES (seq_employee_id.NEXTVAL, 'EMP004', 'emily.chen@dayflow.com', 'hashed_password_012', 'Emily Chen', 'employee', 4, 'Financial Analyst', '+1 234 567 8904', '321 Finance Way, Silicon Valley, CA', DATE '2023-05-10');

-- Insert Attendance Records
INSERT INTO attendance (attendance_id, emp_id, attendance_date, check_in_time, check_out_time, status)
VALUES (seq_attendance_id.NEXTVAL, 1, DATE '2026-01-03', TIMESTAMP '2026-01-03 09:00:00', TIMESTAMP '2026-01-03 18:00:00', 'present');

INSERT INTO attendance (attendance_id, emp_id, attendance_date, check_in_time, check_out_time, status)
VALUES (seq_attendance_id.NEXTVAL, 1, DATE '2026-01-02', TIMESTAMP '2026-01-02 09:15:00', TIMESTAMP '2026-01-02 18:30:00', 'present');

INSERT INTO attendance (attendance_id, emp_id, attendance_date, status)
VALUES (seq_attendance_id.NEXTVAL, 1, DATE '2026-01-01', 'absent');

-- Insert Leave Requests
INSERT INTO leave_requests (leave_id, emp_id, leave_type, start_date, end_date, reason, status)
VALUES (seq_leave_id.NEXTVAL, 1, 'paid', DATE '2026-01-10', DATE '2026-01-12', 'Family vacation', 'pending');

INSERT INTO leave_requests (leave_id, emp_id, leave_type, start_date, end_date, reason, status, reviewed_by, review_comment, reviewed_at)
VALUES (seq_leave_id.NEXTVAL, 3, 'sick', DATE '2026-01-05', DATE '2026-01-06', 'Medical appointment', 'approved', 2, 'Approved. Get well soon!', CURRENT_TIMESTAMP);

-- Insert Payroll Records
INSERT INTO payroll (payroll_id, emp_id, pay_month, pay_year, basic_salary, allowances, deductions, payment_status, payment_date)
VALUES (seq_payroll_id.NEXTVAL, 1, 'December', 2025, 5000, 800, 450, 'paid', DATE '2025-12-31');

INSERT INTO payroll (payroll_id, emp_id, pay_month, pay_year, basic_salary, allowances, deductions, payment_status, payment_date)
VALUES (seq_payroll_id.NEXTVAL, 3, 'December', 2025, 4500, 600, 380, 'paid', DATE '2025-12-31');

INSERT INTO payroll (payroll_id, emp_id, pay_month, pay_year, basic_salary, allowances, deductions, payment_status)
VALUES (seq_payroll_id.NEXTVAL, 4, 'December', 2025, 5500, 900, 520, 'pending');

COMMIT;

-- =====================
-- 6. ENTITY RELATIONSHIPS
-- =====================
/*
RELATIONSHIPS:
1. departments (1) ----< (M) employees
   - One department can have many employees
   - Each employee belongs to one department

2. employees (1) ----< (M) attendance
   - One employee has many attendance records
   - Each attendance record belongs to one employee

3. employees (1) ----< (M) leave_requests
   - One employee can have many leave requests
   - Each leave request is made by one employee

4. employees (1) ----< (M) leave_requests (as reviewer)
   - One admin can review many leave requests
   - Each leave request is reviewed by one admin

5. employees (1) ----< (M) payroll
   - One employee has many payroll records
   - Each payroll record belongs to one employee
*/
