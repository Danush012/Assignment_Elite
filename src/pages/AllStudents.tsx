import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStudents } from "@/hooks/useStudents";
import { Users, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const AllStudents = () => {
  const { data: students, isLoading, error } = useStudents();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">All Students</h1>
          <p className="text-muted-foreground">View all students and their fee payment status</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-6 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <p className="text-destructive">Failed to load students. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">All Students</h1>
        </div>
        <p className="text-muted-foreground">
          View all students and their fee payment status. Updates in real-time when payments are made.
        </p>
      </div>

      {students && students.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{student.name}</span>
                  {student.fees_paid ? (
                    <CheckCircle className="h-6 w-6 text-success" />
                  ) : (
                    <XCircle className="h-6 w-6 text-destructive" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground break-all">
                    {student.email}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge 
                      variant={student.fees_paid ? "default" : "destructive"}
                      className={student.fees_paid ? "bg-success hover:bg-success/80" : ""}
                    >
                      {student.fees_paid ? "Fees Paid" : "Fees Pending"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last updated: {new Date(student.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No students found</h3>
            <p className="text-muted-foreground">
              Students will appear here once they register for the system.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AllStudents;