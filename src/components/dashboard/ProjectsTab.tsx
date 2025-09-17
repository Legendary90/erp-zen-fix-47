import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, MoreVertical, Edit2, Archive } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Group {
  id: string;
  name: string;
  status: string;
  created_at: string;
  client_id: string;
}

export function ProjectsTab() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { clientId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchGroups();
  }, [clientId]);

  const fetchGroups = async () => {
    if (!clientId) return;

    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch groups",
        variant: "destructive",
      });
    } else {
      setGroups(data || []);
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim() || !clientId) return;

    const { error } = await supabase
      .from('groups')
      .insert([
        {
          name: newGroupName,
          client_id: clientId,
          status: 'active'
        }
      ]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Group created successfully",
      });
      setNewGroupName('');
      setIsCreateDialogOpen(false);
      fetchGroups();
    }
  };

  const updateGroupName = async () => {
    if (!editingGroup || !editingGroup.name.trim()) return;

    const { error } = await supabase
      .from('groups')
      .update({ name: editingGroup.name })
      .eq('id', editingGroup.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update group name",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Group name updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingGroup(null);
      fetchGroups();
    }
  };

  const closeGroup = async (groupId: string) => {
    const { error } = await supabase
      .from('groups')
      .update({ 
        status: 'closed',
        closed_at: new Date().toISOString()
      })
      .eq('id', groupId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to close group",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Group closed successfully",
      });
      fetchGroups();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Active Projects</h2>
          <p className="text-muted-foreground">Manage your active work groups</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>
                Create a new group to organize your work
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter group name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createGroup}>Create Group</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <CardDescription>
                    Created: {new Date(group.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => {
                      setEditingGroup(group);
                      setIsEditDialogOpen(true);
                    }}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => closeGroup(group.id)}>
                      <Archive className="mr-2 h-4 w-4" />
                      Close Group
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full" size="sm">
                  Add Products
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  View Items
                </Button>
                <div className="text-xs text-muted-foreground mt-2">
                  Manual entry available
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Group Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group Name</DialogTitle>
            <DialogDescription>
              Change the name of your group
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editingGroup?.name || ''}
                onChange={(e) => setEditingGroup(prev => prev ? {...prev, name: e.target.value} : null)}
                className="col-span-3"
                placeholder="Enter group name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={updateGroupName}>Update Name</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {groups.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No active groups. Create your first group to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}