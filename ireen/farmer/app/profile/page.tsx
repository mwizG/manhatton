'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { AuthProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await apiClient.getProfile();
        setProfile(data);
      } catch {
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setError('');
    try {
      const updated = await apiClient.updateProfile({
        email: profile.user.email,
        firstname: profile.profile.firstname,
        lastname: profile.profile.lastname,
        bio: profile.profile.bio,
        location: profile.profile.location,
        birth_date: profile.profile.birth_date,
      });
      setProfile(updated);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-muted-foreground">Loading profile...</div>;
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Username</label>
                  <Input value={profile.user.username} disabled />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    value={profile.user.email}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        user: { ...profile.user, email: event.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">First Name</label>
                  <Input
                    value={profile.profile.firstname}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        profile: { ...profile.profile, firstname: event.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Last Name</label>
                  <Input
                    value={profile.profile.lastname}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        profile: { ...profile.profile, lastname: event.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Location</label>
                  <Input
                    value={profile.profile.location}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        profile: { ...profile.profile, location: event.target.value },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Birth Date</label>
                  <Input
                    type="date"
                    value={profile.profile.birth_date}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        profile: { ...profile.profile, birth_date: event.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Bio</label>
                <Input
                  value={profile.profile.bio}
                  onChange={(event) =>
                    setProfile({
                      ...profile,
                      profile: { ...profile.profile, bio: event.target.value },
                    })
                  }
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/logout')}>
                  Logout
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
