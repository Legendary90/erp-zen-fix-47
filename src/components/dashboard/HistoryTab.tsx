import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ClosedGroup {
  id: string;
  name: string;
  status: string;
  created_at: string;
  closed_at: string;
  client_id: string;
}

export function HistoryTab() {
  const [closedGroups, setClosedGroups] = useState<ClosedGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { clientId } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchClosedGroups();
  }, [clientId]);

  const fetchClosedGroups = async () => {
    if (!clientId) return;

    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'closed')
      .order('closed_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch history",
        variant: "destructive",
      });
    } else {
      setClosedGroups(data || []);
    }
  };

  const filteredGroups = closedGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToExcel = (group: ClosedGroup) => {
    // Placeholder for Excel export functionality
    toast({
      title: "Export to Excel",
      description: "Excel export feature coming soon",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Project History</h2>
          <p className="text-muted-foreground">View completed work groups</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.map((group) => (
          <Card key={group.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <CardDescription>
                    Created: {new Date(group.created_at).toLocaleDateString()}
                  </CardDescription>
                  <CardDescription>
                    Closed: {new Date(group.closed_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge variant="secondary">Closed</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full" size="sm">
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => exportToExcel(group)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export to Excel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {searchQuery ? 'No groups found matching your search.' : 'No completed groups yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}