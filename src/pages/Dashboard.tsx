import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockAttendance, mockLeaveRequests, mockUsers } from '@/data/mockData';
import { Users, Clock, Calendar, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const pendingLeaves = mockLeaveRequests.filter(l => l.status === 'pending').length;
  const todayAttendance = mockAttendance.filter(a => a.date === '2026-01-03' && a.status === 'present').length;
  const totalEmployees = mockUsers.filter(u => u.role === 'employee').length;

  const myAttendance = mockAttendance.filter(a => a.employeeId === user?.employeeId);
  const myLeaves = mockLeaveRequests.filter(l => l.employeeId === user?.employeeId);
  const presentDays = myAttendance.filter(a => a.status === 'present').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome section */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            {isAdmin ? "Here's an overview of your HR dashboard" : "Here's your personal dashboard overview"}
          </p>
        </div>

        {/* Stats Grid */}
        {isAdmin ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Employees"
              value={totalEmployees}
              icon={<Users className="h-5 w-5 text-primary" />}
              description="Active employees"
            />
            <StatCard
              title="Present Today"
              value={todayAttendance}
              icon={<Clock className="h-5 w-5 text-primary" />}
              description={`Out of ${totalEmployees} employees`}
            />
            <StatCard
              title="Pending Leaves"
              value={pendingLeaves}
              icon={<Calendar className="h-5 w-5 text-primary" />}
              description="Awaiting approval"
            />
            <StatCard
              title="This Month Payroll"
              value="$21,950"
              icon={<DollarSign className="h-5 w-5 text-primary" />}
              description="December 2025"
            />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Days Present"
              value={presentDays}
              icon={<Clock className="h-5 w-5 text-primary" />}
              description="This month"
            />
            <StatCard
              title="Leave Balance"
              value="12 days"
              icon={<Calendar className="h-5 w-5 text-primary" />}
              description="Paid leave remaining"
            />
            <StatCard
              title="Net Salary"
              value="$5,350"
              icon={<DollarSign className="h-5 w-5 text-primary" />}
              description="December 2025"
            />
          </div>
        )}

        {/* Recent Activity / Leave Requests */}
        <div className="grid gap-6 lg:grid-cols-2">
          {isAdmin ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Leave Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockLeaveRequests.filter(l => l.status === 'pending').map((leave) => (
                      <div key={leave.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                        <div>
                          <p className="font-medium text-foreground">{leave.employeeName}</p>
                          <p className="text-sm text-muted-foreground">
                            {leave.startDate} - {leave.endDate} • {leave.leaveType}
                          </p>
                        </div>
                        {getStatusBadge(leave.status)}
                      </div>
                    ))}
                    {mockLeaveRequests.filter(l => l.status === 'pending').length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No pending requests</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Employees</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockUsers.slice(0, 4).map((emp) => (
                      <div key={emp.id} className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                        <img
                          src={emp.profileImage}
                          alt={emp.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{emp.name}</p>
                          <p className="text-sm text-muted-foreground">{emp.department}</p>
                        </div>
                        <Badge variant="secondary" className="capitalize">{emp.role}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">My Leave Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myLeaves.length > 0 ? myLeaves.map((leave) => (
                      <div key={leave.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                        <div>
                          <p className="font-medium text-foreground capitalize">{leave.leaveType} Leave</p>
                          <p className="text-sm text-muted-foreground">
                            {leave.startDate} - {leave.endDate}
                          </p>
                        </div>
                        {getStatusBadge(leave.status)}
                      </div>
                    )) : (
                      <p className="text-muted-foreground text-center py-4">No leave requests</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myAttendance.slice(0, 5).map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                        <div>
                          <p className="font-medium text-foreground">{record.date}</p>
                          <p className="text-sm text-muted-foreground">
                            {record.checkIn && record.checkOut
                              ? `${record.checkIn} - ${record.checkOut}`
                              : 'No check-in/out recorded'}
                          </p>
                        </div>
                        <Badge
                          variant={record.status === 'present' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {record.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
