
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Import } from 'lucide-react';

interface CodePreviewProps {
  fileName: string | null;
  content: string | null;
  isLoading: boolean;
  onImport: () => void;
  isImporting: boolean;
}

const CodePreview: React.FC<CodePreviewProps> = ({
  fileName,
  content,
  isLoading,
  onImport,
  isImporting
}) => {
  if (!fileName && !isLoading) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <CardContent className="text-center text-muted-foreground">
          <p>Select a file to preview its content</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">
          {isLoading ? <Skeleton className="h-4 w-40" /> : fileName}
        </CardTitle>
        {!isLoading && content && (
          <Button 
            size="sm" 
            onClick={onImport}
            disabled={isImporting}
          >
            <Import className="h-4 w-4 mr-1" />
            {isImporting ? 'Importing...' : 'Import File'}
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : content ? (
          <pre className="code-preview">{content}</pre>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No content available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CodePreview;
