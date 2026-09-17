import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Empty, EmptyDescription, EmptyTitle } from '../components/ui/empty';

export default function NotFoundPage() {
  return (
    <Empty>
      <EmptyTitle>Page not found</EmptyTitle>
      <EmptyDescription>The page you requested does not exist.</EmptyDescription>
      <Button render={<Link to="/" />}>Go home</Button>
    </Empty>
  );
}
