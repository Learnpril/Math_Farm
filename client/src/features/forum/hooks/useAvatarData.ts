/**
 * Avatar Data Management Hook
 * Math Farm Community Forum - Hook for managing avatar configurations and user data
 */

import { useState, useEffect, useCallback } from 'react';
import type { AvatarConfig } from '../types/avatar';
import { AvatarConfigUtils } from '../lib/avatar-config';

interface UserAvatarData {
  config?: AvatarConfig;
  achievements: string[];
  stats: {
    posts: number;
    likes: number;
    helpfulAnswers: number;
    joinDate: Date;
    lastActive: Date;
  };
}

interface UseAvatarDataReturn {
  avatarData: Record<number, UserAvatarData>;
  loading: boolean;
  error: string | null;
  loadUserAvatar: (userId: number) => Promise<void>;
  updateUserAvatar: (userId: number, config: AvatarConfig) => Promise<void>;
  clearCache: () => void;
}

// In-memory cache for avatar data
const avatarCache = new Map<number, UserAvatarData>();
const loadingUsers = new Set<number>();

/**
 * Hook for managing avatar data and user information in forum components
 */
export function useAvatarData(): UseAvatarDataReturn {
  const [avatarData, setAvatarData] = useState<Record<number, UserAvatarData>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load avatar data for a specific user
  const loadUserAvatar = useCallback(async (userId: number) => {
    // Check cache first
    if (avatarCache.has(userId)) {
      setAvatarData(prev => ({
        ...prev,
        [userId]: avatarCache.get(userId)!,
      }));
      return;
    }

    // Prevent duplicate requests
    if (loadingUsers.has(userId)) {
      return;
    }

    loadingUsers.add(userId);
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would be an API call
      // For now, we'll simulate with mock data
      const mockUserData = await simulateAvatarDataFetch(userId);

      // Cache the result
      avatarCache.set(userId, mockUserData);

      setAvatarData(prev => ({
        ...prev,
        [userId]: mockUserData,
      }));
    } catch (err) {
      console.error('Failed to load avatar data:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load avatar data'
      );

      // Provide fallback data
      const fallbackData: UserAvatarData = {
        config: AvatarConfigUtils.createDefaultConfig(userId),
        achievements: [],
        stats: {
          posts: 0,
          likes: 0,
          helpfulAnswers: 0,
          joinDate: new Date(),
          lastActive: new Date(),
        },
      };

      avatarCache.set(userId, fallbackData);
      setAvatarData(prev => ({
        ...prev,
        [userId]: fallbackData,
      }));
    } finally {
      loadingUsers.delete(userId);
      setLoading(false);
    }
  }, []);

  // Update user avatar configuration
  const updateUserAvatar = useCallback(
    async (userId: number, config: AvatarConfig) => {
      try {
        // In a real implementation, this would be an API call
        await simulateAvatarUpdate(userId, config);

        // Update cache and state
        const currentData = avatarCache.get(userId);
        if (currentData) {
          const updatedData = {
            ...currentData,
            config: { ...config, updatedAt: new Date() },
          };

          avatarCache.set(userId, updatedData);
          setAvatarData(prev => ({
            ...prev,
            [userId]: updatedData,
          }));
        }
      } catch (err) {
        console.error('Failed to update avatar:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to update avatar'
        );
        throw err;
      }
    },
    []
  );

  // Clear avatar cache
  const clearCache = useCallback(() => {
    avatarCache.clear();
    setAvatarData({});
  }, []);

  // Load avatar data from cache on mount
  useEffect(() => {
    const cachedData: Record<number, UserAvatarData> = {};
    avatarCache.forEach((data, userId) => {
      cachedData[userId] = data;
    });
    setAvatarData(cachedData);
  }, []);

  return {
    avatarData,
    loading,
    error,
    loadUserAvatar,
    updateUserAvatar,
    clearCache,
  };
}

// Mock functions for simulating API calls
// In a real implementation, these would be replaced with actual API calls

async function simulateAvatarDataFetch(
  userId: number
): Promise<UserAvatarData> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

  // Generate mock data based on user ID
  const mockAchievements = generateMockAchievements(userId);
  const mockStats = generateMockStats(userId);
  const mockConfig = generateMockAvatarConfig(userId, mockAchievements);

  return {
    config: mockConfig,
    achievements: mockAchievements,
    stats: mockStats,
  };
}

async function simulateAvatarUpdate(
  userId: number,
  config: AvatarConfig
): Promise<void> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

  // In a real implementation, this would save to the database
  console.log(`Avatar updated for user ${userId}:`, config);
}

function generateMockAchievements(userId: number): string[] {
  const allAchievements = [
    'first-post',
    'helpful-member',
    'calculation-novice',
    'geometry-explorer',
    'daily-learner',
    'pi-day-participant',
  ];

  // Generate achievements based on user ID for consistency
  const achievementCount = (userId % 4) + 1;
  const userAchievements: string[] = [];

  for (let i = 0; i < achievementCount; i++) {
    const index = (userId + i) % allAchievements.length;
    userAchievements.push(allAchievements[index]);
  }

  return userAchievements;
}

function generateMockStats(userId: number) {
  // Generate consistent stats based on user ID
  const baseDate = new Date('2023-01-01');
  const joinDate = new Date(baseDate.getTime() + userId * 24 * 60 * 60 * 1000);
  const lastActive = new Date(Date.now() - (userId % 10) * 60 * 60 * 1000);

  return {
    posts: (userId % 50) + 5,
    likes: (userId % 100) + 10,
    helpfulAnswers: (userId % 20) + 1,
    joinDate,
    lastActive,
  };
}

function generateMockAvatarConfig(
  userId: number,
  achievements: string[]
): AvatarConfig {
  const baseConfig = AvatarConfigUtils.createDefaultConfig(userId);

  // Customize avatar based on achievements
  if (achievements.includes('calculus-master')) {
    // Add calculus hoodie
    baseConfig.layers.push({
      itemId: 'hoodie-calculus',
      position: { x: 50, y: 65 },
      scale: 1,
      rotation: 0,
      color: '#7B68EE',
      visible: true,
    });
  }

  if (achievements.includes('geometry-explorer')) {
    // Add geometry tools
    baseConfig.layers.push({
      itemId: 'protractor-compass',
      position: { x: 70, y: 70 },
      scale: 0.8,
      rotation: 0,
      visible: true,
    });
  }

  if (achievements.includes('helpful-member')) {
    // Add glasses
    baseConfig.layers.push({
      itemId: 'glasses-round',
      position: { x: 50, y: 45 },
      scale: 1,
      rotation: 0,
      color: '#2C3E50',
      visible: true,
    });
  }

  return baseConfig;
}

// Utility function to preload avatar data for multiple users
export function usePreloadAvatars(userIds: number[]) {
  const { loadUserAvatar } = useAvatarData();

  useEffect(() => {
    // Preload avatar data for all users
    userIds.forEach(userId => {
      loadUserAvatar(userId);
    });
  }, [userIds, loadUserAvatar]);
}

export default useAvatarData;
