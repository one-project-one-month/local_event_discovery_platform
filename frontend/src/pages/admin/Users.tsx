import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { UserPlus, Search, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import UserDialog from '../../components/admin/UserDialog.tsx';
import { authService } from '../../services/api';
import type { UserInfo } from '../../services/api';
import Layout from '../../components/admin/Layout';
import { Pagination } from '../../components/ui/pagination';

interface User extends UserInfo {
  // Add any additional fields specific to the Users component
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfo | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Show error message if there is an error
  const errorMessage = error ? (
    <div className="p-4 text-red-500 bg-red-50 border-b">{error}</div>
  ) : null;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.getUsers({
        pageNumber: currentPage,
        keyword: searchTerm,
      });
      setUsers(response.users || []);
      setTotalPages(response.pages || 1);
      setTotalCount(response.count || 0);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to load users. Please try again later.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when search term changes
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateUser = () => {
    setSelectedUser(undefined);
    setDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await authService.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      toast.error(errorMessage);
    }
  };

  const handleUserSubmit = async (userData: {
    name: string;
    email: string;
    password: string;
    isAdmin: boolean;
  }) => {
    try {
      const userDataToSubmit = {
        name: userData.name,
        email: userData.email,
        password: userData.password || undefined, // Only send password if it's not empty
        role: userData.isAdmin ? ('admin' as const) : ('support' as const), // Properly type the role
      };

      if (selectedUser) {
        await authService.updateUser(selectedUser._id, userDataToSubmit);
        toast.success('User updated successfully');
      } else {
        // For create, we need to maintain the original format with isAdmin
        await authService.createUser({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          isAdmin: userData.isAdmin,
        });
        toast.success('User created successfully');
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save user';
      toast.error(errorMessage);
    }
  };

  // Function to get role badge style
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'organizer':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-sm text-gray-500 mt-1">
              Total {totalCount} user{totalCount !== 1 ? 's' : ''}
            </p>
          </div>
          <Button onClick={handleCreateUser}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="border rounded-lg">
          {errorMessage}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeStyle(
                          user.role
                        )}`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages || 1}
            onPageChange={handlePageChange}
          />
        </div>

        <UserDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleUserSubmit}
          user={selectedUser}
          mode={selectedUser ? 'edit' : 'create'}
        />
      </div>
    </Layout>
  );
}
