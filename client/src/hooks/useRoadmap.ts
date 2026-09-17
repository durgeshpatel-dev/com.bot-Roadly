import { useQuery } from '@tanstack/react-query';
import { roadmapApi } from '../api/roadmap.api';

export const useRoadmap = () =>
  useQuery({
    queryKey: ['roadmap'],
    queryFn: roadmapApi.getRoadmap,
    refetchOnWindowFocus: true,
  });
