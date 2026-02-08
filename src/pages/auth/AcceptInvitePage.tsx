import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AcceptInvitePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { redeemInvitation, signOut, supabaseUser, session, isLoading, hasMembership } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = searchParams.get('token');

  // If user already has a membership, show error
  useEffect(() => {
    if (hasMembership) {
      setError('You are already a member of an organisation. Users can only belong to one organisation.');
    }
  }, [hasMembership]);

  // If no token, show error
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Invalid Invitation</CardTitle>
            <CardDescription className="text-center">
              No invitation token provided.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
              Go to sign in
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If not authenticated, prompt to sign in/up
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Accept Invitation</CardTitle>
            <CardDescription className="text-center">
              Sign in or create an account to accept this invitation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                You'll need to sign in or create an account before you can accept this invitation.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button className="w-full" onClick={() => navigate(`/login?redirect=/accept-invite?token=${token}`)}>
              Sign in
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate(`/signup?redirect=/accept-invite?token=${token}`)}>
              Create account
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleAccept = async () => {
    setError(null);
    setIsSubmitting(true);

    const { error } = await redeemInvitation(token);

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
          <CardTitle className="text-2xl font-bold text-center">Accept Invitation</CardTitle>
          <CardDescription className="text-center">
            You've been invited to join an organisation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <p className="text-sm text-muted-foreground text-center">
            Signed in as <strong>{supabaseUser?.email}</strong>
          </p>
          {hasMembership ? (
            <Alert variant="destructive">
              <AlertDescription>
                You are already a member of an organisation. Users can only belong to one organisation.
                If you want to join a different organisation, please contact your current organisation's admin.
              </AlertDescription>
            </Alert>
          ) : (
            <p className="text-sm text-center">
              Click accept to join the organisation and start using Flexra.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {!hasMembership && (
            <Button className="w-full" onClick={handleAccept} disabled={isSubmitting}>
              {isSubmitting ? 'Accepting...' : 'Accept invitation'}
            </Button>
          )}
          {hasMembership && (
            <Button className="w-full" onClick={() => navigate('/app/broker/dashboard')}>
              Go to dashboard
            </Button>
          )}
          <Button type="button" variant="ghost" className="w-full" onClick={handleSignOut}>
            Sign out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
