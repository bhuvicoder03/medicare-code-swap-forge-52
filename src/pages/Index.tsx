
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import GitHubRepoForm from '@/components/GitHubRepoForm';
import FileExplorer, { FileItem } from '@/components/FileExplorer';
import CodePreview from '@/components/CodePreview';
import { fetchRepositoryContents, fetchFileContent, importFile } from '@/services/githubService';
import { toast } from 'sonner';
import { Github, FileCode, Import } from 'lucide-react';

const Index = () => {
  // States
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  const [branch, setBranch] = useState<string>('main');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRepoConnected, setIsRepoConnected] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importedFiles, setImportedFiles] = useState<string[]>([]);
  
  // Connect to GitHub repository
  const handleConnectRepo = async (url: string, branchName: string) => {
    setIsConnecting(true);
    
    try {
      const repoContents = await fetchRepositoryContents(url, branchName);
      setRepoUrl(url);
      setBranch(branchName);
      setFiles(repoContents);
      setIsRepoConnected(true);
      setSelectedFile(null);
      setFileContent(null);
      toast.success('Successfully connected to repository');
    } catch (error) {
      toast.error('Failed to connect to repository');
      console.error(error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle file selection
  const handleSelectFile = async (file: FileItem) => {
    if (file.type === 'file') {
      setIsLoadingFile(true);
      setSelectedFile(file);
      setFileContent(null);
      
      try {
        if (repoUrl) {
          const content = await fetchFileContent(repoUrl, file.path, branch);
          setFileContent(content);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingFile(false);
      }
    }
  };

  // Handle file import
  const handleImportFile = async () => {
    if (selectedFile && fileContent && repoUrl) {
      setIsImporting(true);
      
      try {
        const success = await importFile(repoUrl, selectedFile.path, fileContent);
        
        if (success) {
          toast.success(`Successfully imported ${selectedFile.name}`);
          setImportedFiles([...importedFiles, selectedFile.path]);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to import file');
      } finally {
        setIsImporting(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b py-4 bg-white">
        <div className="container flex items-center justify-between">
          <div className="flex items-center">
            <Github className="h-6 w-6 mr-2" />
            <h1 className="text-lg font-semibold">GitHub Code Importer</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container">
          <Tabs defaultValue="repository" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="repository" disabled={isConnecting}>
                <Github className="h-4 w-4 mr-2" />
                Repository
              </TabsTrigger>
              <TabsTrigger value="files" disabled={!isRepoConnected}>
                <FileCode className="h-4 w-4 mr-2" />
                Files
              </TabsTrigger>
            </TabsList>

            <TabsContent value="repository">
              <div className="grid gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">Connect to GitHub Repository</h2>
                    <p className="text-muted-foreground mb-6">
                      Enter the URL of a GitHub repository to browse and import files.
                    </p>
                    <GitHubRepoForm onConnect={handleConnectRepo} isLoading={isConnecting} />
                  </CardContent>
                </Card>
                
                {isRepoConnected && (
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-2">Connected Repository</h3>
                      <p className="text-primary font-semibold">{repoUrl}</p>
                      <p className="text-sm text-muted-foreground mt-1">Branch: {branch}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="files">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <FileExplorer 
                    files={files} 
                    onSelectFile={handleSelectFile} 
                    selectedFilePath={selectedFile?.path || null}
                  />
                </div>
                <div>
                  <CodePreview 
                    fileName={selectedFile?.name || null}
                    content={fileContent}
                    isLoading={isLoadingFile}
                    onImport={handleImportFile}
                    isImporting={isImporting}
                  />
                </div>
              </div>
              
              {importedFiles.length > 0 && (
                <Card className="mt-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <Import className="h-5 w-5 mr-2 text-green-500" />
                      <h3 className="text-lg font-medium">Imported Files</h3>
                    </div>
                    <ul className="space-y-1">
                      {importedFiles.map((file, index) => (
                        <li key={index} className="text-sm py-1 px-2 bg-muted/50 rounded-md">
                          {file}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="py-4 border-t bg-muted/30">
        <div className="container text-sm text-center text-muted-foreground">
          GitHub Code Importer | Import code from external repositories
        </div>
      </footer>
    </div>
  );
};

export default Index;
