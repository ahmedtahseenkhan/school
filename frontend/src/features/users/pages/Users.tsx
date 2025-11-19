import React from 'react';
import { Table, Column } from '@/components/ui/Table';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import * as usersApi from '@/services/users.service';

export default function UsersPage() {
  const [data, setData] = React.useState<usersApi.User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    usersApi
      .listUsers()
      .then(setData)
      .catch((e) => setError(e?.response?.data?.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<usersApi.User>[] = [
    { key: 'email', header: 'Email', sortable: true },
    { key: 'first_name', header: 'First Name', sortable: true },
    { key: 'last_name', header: 'Last Name', sortable: true },
    { key: 'role', header: 'Role', sortable: true },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="font-semibold">All Users</div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 flex justify-center"><Spinner className="w-6 h-6 text-blue-600" /></div>
          ) : error ? (
            <div className="text-red-600 text-sm">{error}</div>
          ) : (
            <Table columns={columns} data={data} initialSortKey="email" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
