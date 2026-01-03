import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockAttendance, mockUsers } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle, XCircle, AlertCircle, LogIn, LogOut } from 'lucide-react';

export default function Attendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === 'admin';
  const [selectedEmployee, setSelectedEmployee] = useState<string>(user?.employeeId || 'EMP001');
  const [checkedIn, setCheckedIn] = useState(false);

  const attendance = isAdmin
    ? mockAttendance.filter(a => a.employeeId === selectedEmployee)
    : mockAttendance.filter(a => a.employeeId === user?.employeeId);

  const employees = mockUsers.filter(u => u.role === 'employee');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Present</Badge>;
      case 'absent':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Absent</Badge>;
      case 'half-day':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><AlertCircle className="w-3 h-3 mr-1" />Half Day</Badge>;
      case 'on-leave':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />On Leave</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCheckIn = () => {
    setCheckedIn(true);
    toast({
      title: "Checked In",
      description: `You checked in at ${new Date().toLocaleTimeString()}`,
    });
  };

  const handleCheckOut = () => {
    setCheckedIn(false);
    toast({
      title: "Checked Out",
      description: `You checked out at ${new Date().toLocaleTimeString()}`,
    });
  };

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const halfDayCount = attendance.filter(a => a.status === 'half-day').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "View and manage employee attendance" : "Track your daily attendance"}
            </p>
          </div>

          {isAdmin && (
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.employeeId} value={emp.employeeId}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Check In/Out for employees */}
        {!isAdmin && (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-lg font-medium text-foreground">Today's Attendance</p>
                  <p className="text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleCheckIn}
                    disabled={checkedIn}
                    className="min-w-[120px]"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Check In
                  </Button>
                  <Button
                    onClick={handleCheckOut}
                    disabled={!checkedIn}
                    variant="outline"
                    className="min-w-[120px]"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Check Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{presentCount}</p>
              <p className="text-sm text-muted-foreground">Present</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{absentCount}</p>
              <p className="text-sm text-muted-foreground">Absent</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{halfDayCount}</p>
              <p className="text-sm text-muted-foreground">Half Days</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{attendance.length}</p>
              <p className="text-sm text-muted-foreground">Total Records</p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Check In</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Check Out</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 text-foreground">{record.date}</td>
                      <td className="py-3 px-4 text-foreground">{record.checkIn || '-'}</td>
                      <td className="py-3 px-4 text-foreground">{record.checkOut || '-'}</td>
                      <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                    </tr>
                  ))}
                  {attendance.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        No attendance records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
