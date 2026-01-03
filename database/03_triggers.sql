-- ============================================
-- DAYFLOW HRMS - PL/SQL Triggers
-- Human Resource Management System
-- ============================================

-- =====================
-- 1. AUTO ATTENDANCE UPDATE TRIGGER
-- When a leave is approved, automatically mark attendance as 'on-leave'
-- =====================

CREATE OR REPLACE TRIGGER trg_auto_attendance_on_leave_approval
AFTER UPDATE OF status ON leave_requests
FOR EACH ROW
WHEN (NEW.status = 'approved' AND OLD.status = 'pending')
DECLARE
    v_current_date DATE;
BEGIN
    -- Loop through each day of the approved leave
    v_current_date := :NEW.start_date;
    
    WHILE v_current_date <= :NEW.end_date LOOP
        -- Try to insert or update attendance record
        MERGE INTO attendance a
        USING (SELECT :NEW.emp_id AS emp_id, v_current_date AS att_date FROM dual) src
        ON (a.emp_id = src.emp_id AND a.attendance_date = src.att_date)
        WHEN MATCHED THEN
            UPDATE SET 
                status = 'on-leave',
                remarks = 'Auto-marked: Leave approved (ID: ' || :NEW.leave_id || ')'
        WHEN NOT MATCHED THEN
            INSERT (attendance_id, emp_id, attendance_date, status, remarks)
            VALUES (
                seq_attendance_id.NEXTVAL,
                :NEW.emp_id,
                v_current_date,
                'on-leave',
                'Auto-marked: Leave approved (ID: ' || :NEW.leave_id || ')'
            );
        
        v_current_date := v_current_date + 1;
    END LOOP;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the trigger
        DBMS_OUTPUT.PUT_LINE('Trigger Error: ' || SQLERRM);
END trg_auto_attendance_on_leave_approval;
/

-- =====================
-- 2. LEAVE STATUS AUDIT TRIGGER
-- Logs changes to leave request status for audit trail
-- =====================

-- Create audit table first
CREATE TABLE leave_audit_log (
    audit_id        NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    leave_id        NUMBER NOT NULL,
    emp_id          NUMBER NOT NULL,
    old_status      VARCHAR2(20),
    new_status      VARCHAR2(20),
    changed_by      NUMBER,
    changed_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks         VARCHAR2(255)
);

CREATE OR REPLACE TRIGGER trg_audit_leave_status
AFTER UPDATE OF status ON leave_requests
FOR EACH ROW
BEGIN
    INSERT INTO leave_audit_log (
        leave_id,
        emp_id,
        old_status,
        new_status,
        changed_by,
        remarks
    ) VALUES (
        :NEW.leave_id,
        :NEW.emp_id,
        :OLD.status,
        :NEW.status,
        :NEW.reviewed_by,
        'Status changed from ' || :OLD.status || ' to ' || :NEW.status
    );
END trg_audit_leave_status;
/

-- =====================
-- 3. EMPLOYEE TIMESTAMP UPDATE TRIGGER
-- Automatically update updated_at timestamp on employee changes
-- =====================

CREATE OR REPLACE TRIGGER trg_employee_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END trg_employee_updated_at;
/

-- =====================
-- 4. PAYROLL NET SALARY VALIDATION TRIGGER
-- Ensures net salary is never negative
-- =====================

CREATE OR REPLACE TRIGGER trg_validate_payroll
BEFORE INSERT OR UPDATE ON payroll
FOR EACH ROW
BEGIN
    -- Validate basic salary is positive
    IF :NEW.basic_salary <= 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Basic salary must be greater than zero');
    END IF;
    
    -- Validate allowances are not negative
    IF :NEW.allowances < 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Allowances cannot be negative');
    END IF;
    
    -- Validate deductions don't exceed gross salary
    IF :NEW.deductions > (:NEW.basic_salary + :NEW.allowances) THEN
        RAISE_APPLICATION_ERROR(-20003, 'Deductions cannot exceed gross salary');
    END IF;
END trg_validate_payroll;
/

-- Verify triggers created
SELECT trigger_name, triggering_event, table_name, status 
FROM user_triggers 
ORDER BY trigger_name;

-- =====================
-- TEST THE TRIGGERS
-- =====================

-- Test 1: Apply a leave and approve it to see auto-attendance update
DECLARE
    v_leave_id NUMBER;
    v_status VARCHAR2(20);
    v_message VARCHAR2(255);
BEGIN
    -- Apply leave for employee 1 (John Doe)
    sp_apply_leave(
        p_emp_id => 1,
        p_leave_type => 'paid',
        p_start_date => SYSDATE + 30,
        p_end_date => SYSDATE + 32,
        p_reason => 'Test trigger - vacation',
        p_leave_id => v_leave_id,
        p_status => v_status,
        p_message => v_message
    );
    
    DBMS_OUTPUT.PUT_LINE('Leave Application: ' || v_status || ' - ' || v_message);
    DBMS_OUTPUT.PUT_LINE('Leave ID: ' || v_leave_id);
    
    -- Approve the leave (by admin emp_id = 2)
    sp_approve_leave(
        p_leave_id => v_leave_id,
        p_reviewer_id => 2,
        p_comment => 'Approved for trigger test',
        p_status => v_status,
        p_message => v_message
    );
    
    DBMS_OUTPUT.PUT_LINE('Leave Approval: ' || v_status || ' - ' || v_message);
END;
/

-- Check the auto-created attendance records
SELECT a.*, e.full_name 
FROM attendance a
JOIN employees e ON a.emp_id = e.emp_id
WHERE a.status = 'on-leave'
ORDER BY a.attendance_date DESC;

-- Check audit log
SELECT * FROM leave_audit_log ORDER BY audit_id DESC;

COMMIT;
