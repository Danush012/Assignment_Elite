import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useStudents, useUpdateStudent, useCreateStudent, Student } from "@/hooks/useStudents";
import { useToast } from "@/hooks/use-toast";
import { User, CheckCircle, XCircle, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Profile = () => {
  const { user, loading } = useAuth();
  const { data: students, isLoading: studentsLoading } = useStudents();
  const updateStudent = useUpdateStudent();
  const createStudent = useCreateStudent();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [studentProfile, setStudentProfile] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (students && user) {
      const profile = students.find(s => s.user_id === user.id);
      setStudentProfile(profile || null);
      if (profile) {
        setFormData({ name: profile.name, email: profile.email });
      } else if (user.email) {
        setFormData({ 
          name: user.user_metadata?.name || "", 
          email: user.email 
        });
      }
    }
  }, [students, user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      if (studentProfile) {
        await updateStudent.mutateAsync({
          id: studentProfile.id,
          updates: { name: formData.name, email: formData.email }
        });
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        await createStudent.mutateAsync({
          user_id: user.id,
          name: formData.name,
          email: formData.email,
          fees_paid: false
        });
        toast({
          title: "Profile created",
          description: "Your student profile has been created successfully.",
        });
      }
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePayFees = () => {
    if (studentProfile) {
      navigate("/payment", { state: { studentId: studentProfile.id } });
    }
  };

  if (loading || studentsLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <User className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Student Profile</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your profile information and view your fee payment status
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal details here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} disabled={updateStudent.isPending || createStudent.isPending}>
                      {updateStudent.isPending || createStudent.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <p className="text-sm font-medium">{formData.name || "Not set"}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <p className="text-sm font-medium">{formData.email}</p>
                  </div>
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Fee Payment Status</span>
              </CardTitle>
              <CardDescription>
                View and manage your fee payment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentProfile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Status:</span>
                    <div className="flex items-center space-x-2">
                      {studentProfile.fees_paid ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-success" />
                          <Badge className="bg-success hover:bg-success/80">
                            Fees Paid
                          </Badge>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-destructive" />
                          <Badge variant="destructive">
                            Fees Pending
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {!studentProfile.fees_paid && (
                    <div className="pt-4 border-t">
                      <Button onClick={handlePayFees} className="w-full">
                        Pay Fees Now
                      </Button>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Last updated: {new Date(studentProfile.updated_at).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Please complete your profile to view payment status
                  </p>
                  <Button onClick={() => setIsEditing(true)}>
                    Complete Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;