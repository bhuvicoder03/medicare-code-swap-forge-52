
import React, { useState } from 'react';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileItem[];
}

interface FileExplorerProps {
  files: FileItem[];
  onSelectFile: (file: FileItem) => void;
  selectedFilePath: string | null;
}

const FileExplorerItem: React.FC<{
  item: FileItem;
  depth: number;
  onSelectFile: (file: FileItem) => void;
  selectedFilePath: string | null;
}> = ({ item, depth, onSelectFile, selectedFilePath }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDirectory = item.type === 'directory';
  const isSelected = selectedFilePath === item.path;

  const toggleDirectory = () => {
    if (isDirectory) {
      setIsOpen(!isOpen);
    }
  };

  const handleItemClick = () => {
    if (isDirectory) {
      toggleDirectory();
    } else {
      onSelectFile(item);
    }
  };

  return (
    <div>
      <div 
        className={cn(
          "file-tree-item flex items-center gap-2",
          isSelected && "selected"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleItemClick}
      >
        {isDirectory ? (
          <>
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <Folder size={16} className="text-blue-500" />
          </>
        ) : (
          <>
            <span className="w-4" /> {/* Spacer for alignment */}
            <File size={16} className="text-gray-500" />
          </>
        )}
        <span className="truncate">{item.name}</span>
      </div>

      {isDirectory && isOpen && item.children && (
        <div>
          {item.children.map((child, index) => (
            <FileExplorerItem
              key={`${child.path}-${index}`}
              item={child}
              depth={depth + 1}
              onSelectFile={onSelectFile}
              selectedFilePath={selectedFilePath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  onSelectFile,
  selectedFilePath,
}) => {
  return (
    <div className="border rounded-md h-[400px]">
      <div className="px-3 py-2 border-b bg-muted/30 font-medium">Repository Files</div>
      <ScrollArea className="h-[357px]">
        <div className="p-2">
          {files.length > 0 ? (
            files.map((item, index) => (
              <FileExplorerItem
                key={`${item.path}-${index}`}
                item={item}
                depth={0}
                onSelectFile={onSelectFile}
                selectedFilePath={selectedFilePath}
              />
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No files available
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FileExplorer;
