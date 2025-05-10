
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { GitBranch, Github } from "lucide-react";

interface GitHubRepoFormProps {
  onConnect: (repoUrl: string, branch: string) => void;
  isLoading: boolean;
}

const GitHubRepoForm: React.FC<GitHubRepoFormProps> = ({ onConnect, isLoading }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!repoUrl) {
      toast.error("Please enter a GitHub repository URL");
      return;
    }

    try {
      // Basic URL validation
      const url = new URL(repoUrl);
      if (!url.hostname.includes('github.com')) {
        toast.error("Please enter a valid GitHub repository URL");
        return;
      }
      
      onConnect(repoUrl, branch);
    } catch (error) {
      toast.error("Please enter a valid URL");
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repo-url">GitHub Repository URL</Label>
            <div className="flex items-center space-x-2">
              <Github className="h-4 w-4 text-muted-foreground" />
              <Input 
                id="repo-url"
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <div className="flex items-center space-x-2">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <Input 
                id="branch"
                placeholder="main"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Connect Repository'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default GitHubRepoForm;
