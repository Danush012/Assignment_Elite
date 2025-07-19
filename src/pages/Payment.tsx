import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreatePayment } from "@/hooks/usePayments";
import { useUpdateStudent } from "@/hooks/useStudents";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Lock, ArrowLeft } from "lucide-react";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const createPayment = useCreatePayment();
  const updateStudent = useUpdateStudent();
  
  const studentId = location.state?.studentId;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    amount: "5000",
    paymentMethod: "",
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  });

  const handleInputChange = (field: string, value: string) => {
    if (field === "cardNumber") {
      value = value.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();
      value = value.substring(0, 19);
    } else if (field === "expiryDate") {
      value = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").substring(0, 5);
    } else if (field === "cvv") {
      value = value.replace(/\D/g, "").substring(0, 3);
    }
    
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentId) {
      toast({
        title: "Error",
        description: "No student ID found. Please go back to your profile.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await createPayment.mutateAsync({
        student_id: studentId,
        amount: parseFloat(formData.amount),
        payment_method: formData.paymentMethod,
        card_number: formData.cardNumber.replace(/\s/g, ""), 
        cardholder_name: formData.cardholderName,
        expiry_date: formData.expiryDate,
        cvv: formData.cvv,
      });

      await updateStudent.mutateAsync({
        id: studentId,
        updates: { fees_paid: true }
      });

      toast({
        title: "Payment Successful!",
        description: `Your fee payment of ₹${formData.amount} has been processed successfully.`,
      });

      navigate("/profile");
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!studentId) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">
              Invalid payment session. Please return to your profile and try again.
            </p>
            <Button onClick={() => navigate("/profile")}>
              Go to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/profile")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          
          <div className="flex items-center space-x-3 mb-4">
            <CreditCard className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Pay Fees</h1>
          </div>
          <p className="text-muted-foreground">
            Complete your fee payment securely below
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Secure Payment</span>
            </CardTitle>
            <CardDescription>
              Your payment information is encrypted and secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
             
              <div className="space-y-2">
                <Label htmlFor="amount">Fee Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  placeholder="5000"
                  required
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value) => handleInputChange("paymentMethod", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit-card">Credit Card</SelectItem>
                    <SelectItem value="debit-card">Debit Card</SelectItem>
                    <SelectItem value="net-banking">Net Banking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <h3 className="font-medium text-sm">Card Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    value={formData.cardholderName}
                    onChange={(e) => handleInputChange("cardholderName", e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={formData.cvv}
                      onChange={(e) => handleInputChange("cvv", e.target.value)}
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Lock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Secure Payment</p>
                    <p className="text-muted-foreground">
                      This is a simulation. No real payment will be processed.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isProcessing || !formData.paymentMethod}
              >
                {isProcessing ? (
                  "Processing Payment..."
                ) : (
                  `Pay ₹${formData.amount} Now`
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment;