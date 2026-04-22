import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { fetchAdminUsers } from '@/api/roleFeatureService';

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchAdminUsers();
        setUsers(response?.items || []);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">View all platform users grouped by roles. Read-only view.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Users className="h-4 w-4 text-primary" />
          Total Users: {users.length}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading users...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Region/Hospital</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id || user._id} className="border-b border-border/70">
                    <td className="py-2">{user.name}</td>
                    <td className="py-2">{user.email}</td>
                    <td className="py-2 capitalize">{String(user.role || '').replaceAll('_', ' ')}</td>
                    <td className="py-2">{user.hospital_name || user.region || '-'}</td>
                    <td className="py-2 capitalize">{user.status || 'active'}</td>
                    <td className="py-2">{user.last_active_at ? new Date(user.last_active_at).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
