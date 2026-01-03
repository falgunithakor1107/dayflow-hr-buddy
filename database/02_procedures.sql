-- ============================================
-- DAYFLOW HRMS - PL/SQL Procedures
-- Human Resource Management System
-- ============================================

-- =====================
-- 1. EMPLOYEE LEAVE APPLICATION PROCEDURE
-- =====================

CREATE OR REPLACE PROCEDURE sp_apply_leave (
    p_emp_id        IN NUMBER,
    p_leave_type    IN VARCHAR2,
    p_start_date    IN DATE,
    p_end_date      IN DATE,
    p_reason        IN VARCHAR2,
    p_leave_id      OUT NUMBER,
    p_status        OUT VARCHAR2,
    p_message       OUT VARCHAR2
)
AS
    v_emp_exists    NUMBER;
    v_overlap_count NUMBER;
    v_leave_days    NUMBER;
BEGIN
    -- Validate employee exists
    SELECT COUNT(*) INTO v_emp_exists 
    FROM employees 
    WHERE emp_id = p_emp_id AND is_active = 'Y';
    
    IF v_emp_exists = 0 THEN
        p_status := 'ERROR';
        p_message := 'Employee not found or inactive';
        RETURN;
    END IF;
    
    -- Validate dates
    IF p_start_date > p_end_date THEN
        p_status := 'ERROR';
        p_message := 'Start date cannot be after end date';
        RETURN;
    END IF;
    
    IF p_start_date < SYSDATE THEN
        p_status := 'ERROR';
        p_message := 'Cannot apply for leave in the past';
        RETURN;
    END IF;
    
    -- Check for overlapping leave requests
    SELECT COUNT(*) INTO v_overlap_count
    FROM leave_requests
    WHERE emp_id = p_emp_id
      AND status IN ('pending', 'approved')
      AND ((start_date BETWEEN p_start_date AND p_end_date)
           OR (end_date BETWEEN p_start_date AND p_end_date)
           OR (p_start_date BETWEEN start_date AND end_date));
    
    IF v_overlap_count > 0 THEN
        p_status := 'ERROR';
        p_message := 'Leave request overlaps with existing request';
        RETURN;
    END IF;
    
    -- Calculate leave days
    v_leave_days := p_end_date - p_start_date + 1;
    
    -- Insert leave request
    INSERT INTO leave_requests (
        leave_id,
        emp_id,
        leave_type,
        start_date,
        end_date,
        reason,
        status,
        applied_on
    ) VALUES (
        seq_leave_id.NEXTVAL,
        p_emp_id,
        p_leave_type,
        p_start_date,
        p_end_date,
        p_reason,
        'pending',
        SYSDATE
    ) RETURNING leave_id INTO p_leave_id;
    
    COMMIT;
    
    p_status := 'SUCCESS';
    p_message := 'Leave application submitted successfully for ' || v_leave_days || ' days';
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        p_status := 'ERROR';
        p_message := 'Error: ' || SQLERRM;
END sp_apply_leave;
/

-- =====================
-- 2. LEAVE APPROVAL PROCEDURE
-- =====================

CREATE OR REPLACE PROCEDURE sp_approve_leave (
    p_leave_id      IN NUMBER,
    p_reviewer_id   IN NUMBER,
    p_comment       IN VARCHAR2,
    p_status        OUT VARCHAR2,
    p_message       OUT VARCHAR2
)
AS
    v_leave_status  VARCHAR2(20);
    v_is_admin      NUMBER;
    v_emp_id        NUMBER;
    v_start_date    DATE;
    v_end_date      DATE;
BEGIN
    -- Validate reviewer is admin
    SELECT COUNT(*) INTO v_is_admin
    FROM employees
    WHERE emp_id = p_reviewer_id AND role = 'admin' AND is_active = 'Y';
    
    IF v_is_admin = 0 THEN
        p_status := 'ERROR';
        p_message := 'Only admin/HR can approve leave requests';
        RETURN;
    END IF;
    
    -- Get leave request details
    SELECT status, emp_id, start_date, end_date 
    INTO v_leave_status, v_emp_id, v_start_date, v_end_date
    FROM leave_requests
    WHERE leave_id = p_leave_id;
    
    IF v_leave_status != 'pending' THEN
        p_status := 'ERROR';
        p_message := 'Leave request is already ' || v_leave_status;
        RETURN;
    END IF;
    
    -- Update leave request
    UPDATE leave_requests
    SET status = 'approved',
        reviewed_by = p_reviewer_id,
        review_comment = p_comment,
        reviewed_at = CURRENT_TIMESTAMP
    WHERE leave_id = p_leave_id;
    
    -- Note: The trigger will automatically update attendance records
    
    COMMIT;
    
    p_status := 'SUCCESS';
    p_message := 'Leave request approved successfully';
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_status := 'ERROR';
        p_message := 'Leave request not found';
    WHEN OTHERS THEN
        ROLLBACK;
        p_status := 'ERROR';
        p_message := 'Error: ' || SQLERRM;
END sp_approve_leave;
/

-- =====================
-- 3. LEAVE REJECTION PROCEDURE
-- =====================

CREATE OR REPLACE PROCEDURE sp_reject_leave (
    p_leave_id      IN NUMBER,
    p_reviewer_id   IN NUMBER,
    p_comment       IN VARCHAR2,
    p_status        OUT VARCHAR2,
    p_message       OUT VARCHAR2
)
AS
    v_leave_status  VARCHAR2(20);
    v_is_admin      NUMBER;
BEGIN
    -- Validate reviewer is admin
    SELECT COUNT(*) INTO v_is_admin
    FROM employees
    WHERE emp_id = p_reviewer_id AND role = 'admin' AND is_active = 'Y';
    
    IF v_is_admin = 0 THEN
        p_status := 'ERROR';
        p_message := 'Only admin/HR can reject leave requests';
        RETURN;
    END IF;
    
    -- Get current status
    SELECT status INTO v_leave_status
    FROM leave_requests
    WHERE leave_id = p_leave_id;
    
    IF v_leave_status != 'pending' THEN
        p_status := 'ERROR';
        p_message := 'Leave request is already ' || v_leave_status;
        RETURN;
    END IF;
    
    -- Comment is required for rejection
    IF p_comment IS NULL OR LENGTH(TRIM(p_comment)) = 0 THEN
        p_status := 'ERROR';
        p_message := 'Rejection comment is required';
        RETURN;
    END IF;
    
    -- Update leave request
    UPDATE leave_requests
    SET status = 'rejected',
        reviewed_by = p_reviewer_id,
        review_comment = p_comment,
        reviewed_at = CURRENT_TIMESTAMP
    WHERE leave_id = p_leave_id;
    
    COMMIT;
    
    p_status := 'SUCCESS';
    p_message := 'Leave request rejected';
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_status := 'ERROR';
        p_message := 'Leave request not found';
    WHEN OTHERS THEN
        ROLLBACK;
        p_status := 'ERROR';
        p_message := 'Error: ' || SQLERRM;
END sp_reject_leave;
/

-- =====================
-- 4. ATTENDANCE MARKING PROCEDURE
-- =====================

CREATE OR REPLACE PROCEDURE sp_mark_attendance (
    p_emp_id        IN NUMBER,
    p_action        IN VARCHAR2,  -- 'CHECK_IN' or 'CHECK_OUT'
    p_status        OUT VARCHAR2,
    p_message       OUT VARCHAR2
)
AS
    v_emp_exists    NUMBER;
    v_today         DATE := TRUNC(SYSDATE);
    v_att_id        NUMBER;
    v_current_time  TIMESTAMP := CURRENT_TIMESTAMP;
    v_on_leave      NUMBER;
BEGIN
    -- Validate employee exists
    SELECT COUNT(*) INTO v_emp_exists 
    FROM employees 
    WHERE emp_id = p_emp_id AND is_active = 'Y';
    
    IF v_emp_exists = 0 THEN
        p_status := 'ERROR';
        p_message := 'Employee not found or inactive';
        RETURN;
    END IF;
    
    -- Check if employee is on approved leave today
    SELECT COUNT(*) INTO v_on_leave
    FROM leave_requests
    WHERE emp_id = p_emp_id
      AND status = 'approved'
      AND v_today BETWEEN start_date AND end_date;
    
    IF v_on_leave > 0 THEN
        p_status := 'ERROR';
        p_message := 'Cannot mark attendance - employee is on approved leave';
        RETURN;
    END IF;
    
    IF p_action = 'CHECK_IN' THEN
        -- Check if already checked in today
        SELECT attendance_id INTO v_att_id
        FROM attendance
        WHERE emp_id = p_emp_id AND attendance_date = v_today;
        
        -- Already has a record - update check-in time if not already done
        UPDATE attendance
        SET check_in_time = v_current_time,
            status = 'present'
        WHERE attendance_id = v_att_id
          AND check_in_time IS NULL;
        
        IF SQL%ROWCOUNT = 0 THEN
            p_status := 'ERROR';
            p_message := 'Already checked in today';
            RETURN;
        END IF;
        
        p_message := 'Check-in recorded at ' || TO_CHAR(v_current_time, 'HH24:MI:SS');
        
    ELSIF p_action = 'CHECK_OUT' THEN
        -- Check if checked in today
        SELECT attendance_id INTO v_att_id
        FROM attendance
        WHERE emp_id = p_emp_id 
          AND attendance_date = v_today
          AND check_in_time IS NOT NULL;
        
        -- Update check-out time
        UPDATE attendance
        SET check_out_time = v_current_time,
            status = CASE 
                        WHEN EXTRACT(HOUR FROM (v_current_time - check_in_time)) < 4 
                        THEN 'half-day' 
                        ELSE 'present' 
                     END
        WHERE attendance_id = v_att_id
          AND check_out_time IS NULL;
        
        IF SQL%ROWCOUNT = 0 THEN
            p_status := 'ERROR';
            p_message := 'Already checked out or not checked in';
            RETURN;
        END IF;
        
        p_message := 'Check-out recorded at ' || TO_CHAR(v_current_time, 'HH24:MI:SS');
        
    ELSE
        p_status := 'ERROR';
        p_message := 'Invalid action. Use CHECK_IN or CHECK_OUT';
        RETURN;
    END IF;
    
    COMMIT;
    p_status := 'SUCCESS';
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        IF p_action = 'CHECK_IN' THEN
            -- Create new attendance record
            INSERT INTO attendance (attendance_id, emp_id, attendance_date, check_in_time, status)
            VALUES (seq_attendance_id.NEXTVAL, p_emp_id, v_today, v_current_time, 'present');
            COMMIT;
            p_status := 'SUCCESS';
            p_message := 'Check-in recorded at ' || TO_CHAR(v_current_time, 'HH24:MI:SS');
        ELSE
            p_status := 'ERROR';
            p_message := 'Must check in before checking out';
        END IF;
    WHEN OTHERS THEN
        ROLLBACK;
        p_status := 'ERROR';
        p_message := 'Error: ' || SQLERRM;
END sp_mark_attendance;
/

-- =====================
-- 5. HELPER PROCEDURE: Get Employee Leave Balance
-- =====================

CREATE OR REPLACE PROCEDURE sp_get_leave_balance (
    p_emp_id        IN NUMBER,
    p_paid_balance  OUT NUMBER,
    p_sick_balance  OUT NUMBER,
    p_unpaid_used   OUT NUMBER,
    p_status        OUT VARCHAR2,
    p_message       OUT VARCHAR2
)
AS
    v_paid_used     NUMBER := 0;
    v_sick_used     NUMBER := 0;
    v_year          NUMBER := EXTRACT(YEAR FROM SYSDATE);
    c_paid_annual   CONSTANT NUMBER := 15;  -- Annual paid leave allowance
    c_sick_annual   CONSTANT NUMBER := 10;  -- Annual sick leave allowance
BEGIN
    -- Calculate used paid leave
    SELECT NVL(SUM(end_date - start_date + 1), 0) INTO v_paid_used
    FROM leave_requests
    WHERE emp_id = p_emp_id
      AND leave_type = 'paid'
      AND status = 'approved'
      AND EXTRACT(YEAR FROM start_date) = v_year;
    
    -- Calculate used sick leave
    SELECT NVL(SUM(end_date - start_date + 1), 0) INTO v_sick_used
    FROM leave_requests
    WHERE emp_id = p_emp_id
      AND leave_type = 'sick'
      AND status = 'approved'
      AND EXTRACT(YEAR FROM start_date) = v_year;
    
    -- Calculate used unpaid leave
    SELECT NVL(SUM(end_date - start_date + 1), 0) INTO p_unpaid_used
    FROM leave_requests
    WHERE emp_id = p_emp_id
      AND leave_type = 'unpaid'
      AND status = 'approved'
      AND EXTRACT(YEAR FROM start_date) = v_year;
    
    p_paid_balance := c_paid_annual - v_paid_used;
    p_sick_balance := c_sick_annual - v_sick_used;
    
    p_status := 'SUCCESS';
    p_message := 'Leave balance retrieved successfully';
    
EXCEPTION
    WHEN OTHERS THEN
        p_status := 'ERROR';
        p_message := 'Error: ' || SQLERRM;
END sp_get_leave_balance;
/

-- Verify procedures created
SELECT object_name, object_type, status 
FROM user_objects 
WHERE object_type = 'PROCEDURE'
ORDER BY object_name;
