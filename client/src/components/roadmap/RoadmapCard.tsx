import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import type { RoadmapPost } from '../../types/post.types';

export function RoadmapCard({ post }: { post: RoadmapPost }) {
  return (
    <Card className="premium-card-hover bg-card/95 backdrop-blur-sm border-white/20 dark:border-white/5 shadow-sm">
      <CardHeader className="p-4">
        <CardTitle className="text-base leading-snug font-bold text-slate-800 dark:text-slate-100">{post.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <div className="flex flex-wrap gap-1">
          {post.categories.map((category) => (
            <Badge key={category} variant="outline">{category}</Badge>
          ))}
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{post.voteCount} votes</span>
          <span>{post.commentCount} comments</span>
        </div>
      </CardContent>
    </Card>
  );
}
