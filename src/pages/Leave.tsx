import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mockLeaveRequests } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { LeaveType, LeaveRequest } from '@/types/hrms';
import { Plus, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';

export default function Leave() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(mockLeaveRequests);

  const [newLeave, setNewLeave] = useState({
    leaveType: 'paid' as LeaveType,
    startDate: '',
    endDate: '',
    reason: '',
  });

  const myLeaves = leaves.filter(l => l.employeeId === user?.employeeId);

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

  const handleApplyLeave = () => {
    if (!newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const leave: LeaveRequest = {
      id: String(leaves.length + 1),
      employeeId: user?.employeeId || '',
      employeeName: user?.name || '',
      leaveType: newLeave.leaveType,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      reason: newLeave.reason,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
    };

    setLeaves([leave, ...leaves]);
    setNewLeave({ leaveType: 'paid', startDate: '', endDate: '', reason: '' });
    setIsDialogOpen(false);
    
    toast({
      title: "Leave Applied",
      description: "Your leave request has been submitted for approval.",
    });
  };

  const pendingCount = myLeaves.filter(l => l.status === 'pending').length;
  const approvedCount = myLeaves.filter(l => l.status === 'approved').length;
  const rejectedCount = myLeaves.filter(l => l.status === 'rejected').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leave Management</h1>
            <p className="text-muted-foreground">Apply for leave and track your requests</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Apply Leave
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="leaveType">Leave Type</Label>
                  <Select
                    value={newLeave.leaveType}
                    onValueChange={(value) => setNewLeave({ ...newLeave, leaveType: value as LeaveType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newLeave.startDate}
                      onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newLeave.endDate}
                      onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    placeholder="Enter the reason for your leave"
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  />
                </div>

                <Button onClick={handleApplyLeave} className="w-full">
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{myLeaves.length}</p>
              <p className="text-sm text-muted-foreground">Total Requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{rejectedCount}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Leave Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Duration</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reason</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Applied On</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myLeaves.map((leave) => (
                    <tr key={leave.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="capitalize text-foreground">{leave.leaveType}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground">
                        {leave.startDate} to {leave.endDate}
                      </td>
                      <td className="py-3 px-4 text-foreground max-w-[200px] truncate">{leave.reason}</td>
                      <td className="py-3 px-4 text-muted-foreground">{leave.appliedOn}</td>
                      <td className="py-3 px-4">{getStatusBadge(leave.status)}</td>
                    </tr>
                  ))}
                  {myLeaves.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No leave requests found. Click "Apply Leave" to create one.
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
