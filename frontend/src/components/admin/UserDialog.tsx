import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import type { UserInfo } from '../../services/api';

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: { name: string; email: string; password: string; isAdmin: boolean }) => void;
  user?: UserInfo;
  mode: 'create' | 'edit';
}

export default function UserDialog({ isOpen, onClose, onSubmit, user, mode }: UserDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isAdmin: false,
  });

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        isAdmin: user.role === 'admin',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        isAdmin: false,
      });
    }
  }, [user, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New User' : 'Edit User'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              Password {mode === 'edit' && '(Leave blank to keep current)'}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              required={mode === 'create'}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAdmin"
              checked={formData.isAdmin}
              onCheckedChange={checked => setFormData({ ...formData, isAdmin: checked as boolean })}
            />
            <Label htmlFor="isAdmin">Make Admin User</Label>
            <span className="text-sm text-muted-foreground ml-2">
              (If unchecked, user will be Support)
            </span>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{mode === 'create' ? 'Create' : 'Update'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
