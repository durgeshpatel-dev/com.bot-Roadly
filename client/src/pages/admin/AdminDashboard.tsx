import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { PageHeader } from '../../components/layout/PageHeader';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Dashboard"
        description="Review feature requests and manage their roadmap status."
      />

      <Card>
        <CardHeader>
          <CardTitle>Request management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Dashboard analytics are deferred. Use the request management view to review and transition submissions.
          </p>
          <Button render={<Link to="/admin/posts" />}>Manage requests</Button>
        </CardContent>
      </Card>
    </div>
  );
}
