import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Edit2, Save, X, Mail, Phone, MapPin, Building, Briefcase, Calendar } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleSave = () => {
    // Mock save - in real app, this would call backend
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="flex items-start gap-3 py-3">
      <div className="p-2 rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{value || 'Not provided'}</p>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">View and manage your personal information</p>
        </div>

        {/* Profile Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.profileImage} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user?.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-foreground">{user?.name}</h2>
                  <Badge variant="secondary" className="capitalize w-fit mx-auto md:mx-0">
                    {user?.role}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{user?.designation}</p>
                <p className="text-sm text-muted-foreground">{user?.department}</p>
                <p className="text-sm text-primary mt-2">{user?.employeeId}</p>
              </div>
              <Button
                variant={isEditing ? "ghost" : "outline"}
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" /> Cancel
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Details Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow icon={Mail} label="Email" value={user?.email || ''} />
              
              {isEditing ? (
                <div className="py-3">
                  <Label htmlFor="phone" className="text-sm text-muted-foreground">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
              ) : (
                <InfoRow icon={Phone} label="Phone" value={user?.phone || ''} />
              )}

              {isEditing ? (
                <div className="py-3">
                  <Label htmlFor="address" className="text-sm text-muted-foreground">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-1"
                  />
                </div>
              ) : (
                <InfoRow icon={MapPin} label="Address" value={user?.address || ''} />
              )}

              {isEditing && (
                <Button onClick={handleSave} className="w-full mt-4">
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow icon={Building} label="Department" value={user?.department || ''} />
              <InfoRow icon={Briefcase} label="Designation" value={user?.designation || ''} />
              <InfoRow icon={Calendar} label="Join Date" value={user?.joinDate || ''} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
