import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockPayroll, mockUsers } from '@/data/mockData';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function Payroll() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [selectedEmployee, setSelectedEmployee] = useState<string>(user?.employeeId || 'EMP001');

  const employees = mockUsers.filter(u => u.role === 'employee');

  const payrollRecords = isAdmin
    ? mockPayroll.filter(p => p.employeeId === selectedEmployee)
    : mockPayroll.filter(p => p.employeeId === user?.employeeId);

  const allPayroll = isAdmin ? mockPayroll : payrollRecords;

  const totalNet = allPayroll.reduce((sum, p) => sum + p.netSalary, 0);
  const totalBasic = allPayroll.reduce((sum, p) => sum + p.basicSalary, 0);
  const totalAllowances = allPayroll.reduce((sum, p) => sum + p.allowances, 0);
  const totalDeductions = allPayroll.reduce((sum, p) => sum + p.deductions, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payroll</h1>
            <p className="text-muted-foreground">
              {isAdmin ? "View and manage employee payroll" : "View your salary details"}
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

        {/* Summary Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Basic Salary</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(payrollRecords[0]?.basicSalary || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Allowances</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(payrollRecords[0]?.allowances || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deductions</p>
                  <p className="text-lg font-bold text-destructive">{formatCurrency(payrollRecords[0]?.deductions || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Salary</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(payrollRecords[0]?.netSalary || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payroll History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Salary History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Month</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Basic</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Allowances</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Deductions</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Net</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollRecords.map((record) => (
                    <tr key={record.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 text-foreground">
                        {record.month} {record.year}
                      </td>
                      <td className="py-3 px-4 text-foreground">{formatCurrency(record.basicSalary)}</td>
                      <td className="py-3 px-4 text-green-600">+{formatCurrency(record.allowances)}</td>
                      <td className="py-3 px-4 text-destructive">-{formatCurrency(record.deductions)}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{formatCurrency(record.netSalary)}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={record.status === 'paid' ? 'default' : 'secondary'}
                          className={record.status === 'paid' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                        >
                          {record.status === 'paid' ? 'Paid' : 'Pending'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {payrollRecords.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No payroll records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Admin: All Employees Summary */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Employees - December 2025</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Employee</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Basic</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Net Salary</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPayroll.filter(p => p.month === 'December').map((record) => {
                      const emp = employees.find(e => e.employeeId === record.employeeId);
                      return (
                        <tr key={record.id} className="border-b border-border last:border-0">
                          <td className="py-3 px-4 text-foreground">{emp?.name || record.employeeId}</td>
                          <td className="py-3 px-4 text-foreground">{formatCurrency(record.basicSalary)}</td>
                          <td className="py-3 px-4 font-medium text-foreground">{formatCurrency(record.netSalary)}</td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={record.status === 'paid' ? 'default' : 'secondary'}
                              className={record.status === 'paid' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                            >
                              {record.status === 'paid' ? 'Paid' : 'Pending'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
