import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Clock, Calendar, DollarSign, Shield, BarChart3 } from 'lucide-react';

export default function Index() {
  const features = [
    {
      icon: Users,
      title: 'Employee Management',
      description: 'Manage employee profiles, departments, and organizational structure.',
    },
    {
      icon: Clock,
      title: 'Attendance Tracking',
      description: 'Track daily attendance with check-in/check-out functionality.',
    },
    {
      icon: Calendar,
      title: 'Leave Management',
      description: 'Apply for leaves, track balances, and manage approvals.',
    },
    {
      icon: DollarSign,
      title: 'Payroll View',
      description: 'View salary breakdowns, allowances, and payment history.',
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Secure access with employee and admin role separation.',
    },
    {
      icon: BarChart3,
      title: 'Reports & Analytics',
      description: 'View attendance and leave reports with visual analytics.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">D</span>
            </div>
            <span className="text-2xl font-bold text-foreground">Dayflow</span>
          </div>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Human Resource Management
            <span className="text-primary"> Made Simple</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Streamline your HR operations with Dayflow. Manage employees, track attendance, 
            handle leave requests, and view payroll—all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="min-w-[200px]">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="min-w-[200px]">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-card">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Everything You Need
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="bg-background border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Transform Your HR?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of companies using Dayflow to streamline their HR processes.
          </p>
          <Link to="/auth">
            <Button size="lg">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">D</span>
            </div>
            <span className="text-lg font-bold text-foreground">Dayflow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Dayflow HRMS. Built for hackathon demonstration.
          </p>
        </div>
      </footer>
    </div>
  );
}
