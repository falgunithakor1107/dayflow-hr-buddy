import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mockLeaveRequests } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { LeaveRequest } from '@/types/hrms';
import { CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';

export default function LeaveApprovals() {
  const { toast } = useToast();
  const [leaves, setLeaves] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [comment, setComment] = useState('');

  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const processedLeaves = leaves.filter(l => l.status !== 'pending');

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

  const handleApprove = (leaveId: string) => {
    setLeaves(leaves.map(l => 
      l.id === leaveId 
        ? { ...l, status: 'approved' as const, reviewedBy: 'Sarah Johnson', reviewComment: comment || 'Approved' }
        : l
    ));
    setSelectedLeave(null);
    setComment('');
    toast({
      title: "Leave Approved",
      description: "The leave request has been approved.",
    });
  };

  const handleReject = (leaveId: string) => {
    if (!comment) {
      toast({
        title: "Comment Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    setLeaves(leaves.map(l => 
      l.id === leaveId 
        ? { ...l, status: 'rejected' as const, reviewedBy: 'Sarah Johnson', reviewComment: comment }
        : l
    ));
    setSelectedLeave(null);
    setComment('');
    toast({
      title: "Leave Rejected",
      description: "The leave request has been rejected.",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leave Approvals</h1>
          <p className="text-muted-foreground">Review and manage employee leave requests</p>
        </div>

        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Pending Requests ({pendingLeaves.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingLeaves.map((leave) => (
                <div key={leave.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-accent/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-foreground">{leave.employeeName}</p>
                      <Badge variant="secondary" className="capitalize">{leave.leaveType}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {leave.startDate} to {leave.endDate}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{leave.reason}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedLeave(leave)}>
                      <Eye className="w-4 h-4 mr-1" /> Review
                    </Button>
                    <Button size="sm" onClick={() => handleApprove(leave.id)}>
                      <CheckCircle className="w-4 h-4 mr-1" /> Approve
                    </Button>
                  </div>
                </div>
              ))}
              {pendingLeaves.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No pending requests</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Processed Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Processed Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Employee</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Duration</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reviewed By</th>
                  </tr>
                </thead>
                <tbody>
                  {processedLeaves.map((leave) => (
                    <tr key={leave.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 text-foreground">{leave.employeeName}</td>
                      <td className="py-3 px-4 capitalize text-foreground">{leave.leaveType}</td>
                      <td className="py-3 px-4 text-foreground">{leave.startDate} - {leave.endDate}</td>
                      <td className="py-3 px-4">{getStatusBadge(leave.status)}</td>
                      <td className="py-3 px-4 text-muted-foreground">{leave.reviewedBy || '-'}</td>
                    </tr>
                  ))}
                  {processedLeaves.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No processed requests
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={!!selectedLeave} onOpenChange={() => setSelectedLeave(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Leave Request</DialogTitle>
            </DialogHeader>
            {selectedLeave && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Employee</p>
                    <p className="font-medium text-foreground">{selectedLeave.employeeName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Leave Type</p>
                    <p className="font-medium capitalize text-foreground">{selectedLeave.leaveType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium text-foreground">{selectedLeave.startDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium text-foreground">{selectedLeave.endDate}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <p className="font-medium text-foreground">{selectedLeave.reason}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Comment (required for rejection)</p>
                  <Textarea
                    placeholder="Add your comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleReject(selectedLeave.id)}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleApprove(selectedLeave.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
