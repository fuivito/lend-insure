import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CreateOrgPage() {
  const navigate = useNavigate();
  const { createOrganisation, signOut, supabaseUser, isLoading, hasMembership } = useAuth();
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('BROKER');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user already has a membership, redirect to dashboard
  if (hasMembership) {
    navigate('/app/broker/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error } = await createOrganisation(orgName, orgType);

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
    } else {
      navigate('/app/broker/dashboard');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create your organisation</CardTitle>
          <CardDescription className="text-center">
            Welcome, {supabaseUser?.email}! Set up your organisation to get started.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="orgName">Organisation Name</Label>
              <Input
                id="orgName"
                type="text"
                placeholder="Acme Insurance Brokers Ltd"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgType">Organisation Type</Label>
              <Select value={orgType} onValueChange={setOrgType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BROKER">Insurance Broker</SelectItem>
                  <SelectItem value="MGA">Managing General Agent (MGA)</SelectItem>
                  <SelectItem value="INSURER">Insurer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create organisation'}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={handleSignOut}>
              Sign out
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
