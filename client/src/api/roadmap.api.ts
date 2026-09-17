import apiClient from './axios';
import type { RoadmapData } from '../types/post.types';

export const roadmapApi = {
  getRoadmap: async (): Promise<RoadmapData> => {
    const response = await apiClient.get('/roadmap');
    return response.data.data;
  },
};
