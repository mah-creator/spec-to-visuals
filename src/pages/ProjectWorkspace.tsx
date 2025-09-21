import { useState, useContext } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AuthContext } from "../App";
import { useProject } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useTaskFiles } from "@/hooks/useFiles";
import { API_BASE_URL } from "@/lib/api-client";
import FileUploadDialog from "@/components/FileUploadDialog";

import { 
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  Users,
  FileText,
  Upload,
  Download,
  MessageSquare,
  Send,
  CheckCircle,
  Timer,
  AlertCircle,
  MoreHorizontal
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const ProjectWorkspace = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState("tasks");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedTaskForUpload, setSelectedTaskForUpload] = useState<string | null>(null);
  
  const { project, isLoading: projectLoading } = useProject(id);
  const { tasks, isLoading: tasksLoading } = useTasks(id);

  const selectedTaskId = tasks.length > 0 ? tasks[0].id : undefined; // Use first task for demo
  const { files, isLoading: filesLoading } = useTaskFiles(selectedTaskId || "");

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <Button onClick={() => navigate('/')}>Go Back</Button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'in-progress': return <Timer className="w-4 h-4 text-primary" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'completed': 'bg-success/10 text-success',
      'in-progress': 'bg-primary/10 text-primary',
      'pending': 'bg-muted/50 text-muted-foreground'
    };
    return variants[status] || 'bg-muted';
  };

  const handleAddComment = (taskId: string) => {
    if (!newComment.trim()) return;
    // Here you would typically add the comment to the task
    setNewComment("");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-[var(--content-width)] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{project.title}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                {user?.role === 'freelancer' ? project.client : project.freelancer}
              </p>
            </div>
            <Badge className={getStatusBadge(project.status)}>
              {project.status}
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-[var(--content-width)] mx-auto px-6 py-8">
        {/* Project Overview */}
        <Card className="border-0 shadow-md mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Project Description</h3>
                <p className="text-muted-foreground">{project.description}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Timeline</h3>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Progress</h3>
                <div className="space-y-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-primary h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-primary font-medium">{project.progress}% complete</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === "tasks" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("tasks")}
            className={activeTab === "tasks" ? "bg-card shadow-sm" : ""}
          >
            Tasks
          </Button>
          <Button
            variant={activeTab === "files" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("files")}
            className={activeTab === "files" ? "bg-card shadow-sm" : ""}
          >
            Files
          </Button>
        </div>

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Tasks</h2>
              {user?.role === 'freelancer' && (
                <Button className="bg-gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              {tasks.map((task) => (
                <Card key={task.id} className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(task.status)}
                        <div className="flex-1">
                          <h3 className="font-semibold">{task.title}</h3>
                          <p className="text-muted-foreground text-sm">{task.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusBadge(task.status)}>
                          {task.status.replace('-', ' ')}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedTaskForUpload(task.id);
                            setUploadDialogOpen(true);
                          }}
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {task.assignee}
                      </span>
                    </div>

                    {/* Comments */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium">Comments ({task.comments.length})</span>
                      </div>
                      
                      <div className="space-y-3 pl-6">
                        {task.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{comment.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-muted/50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{comment.author}</span>
                                <span className="text-xs text-muted-foreground">{new Date(comment.time).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm">{comment.message}</p>
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{user?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 flex gap-2">
                            <Input
                              placeholder="Add a comment..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddComment(task.id)}
                            />
                            <Button size="sm" onClick={() => handleAddComment(task.id)}>
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === "files" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Project Files</h2>
              <Button 
                className="bg-gradient-primary"
                onClick={() => setUploadDialogOpen(true)}
                disabled={!selectedTaskId}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </div>
            
            <Card className="border-0 shadow-md">
              <CardContent className="p-6">
                {filesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading files...</p>
                  </div>
                ) : files.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No files uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{file.filename}</p>
                            <p className="text-sm text-muted-foreground">
                              {Math.round(file.size / 1024)} KB • Uploaded by {file.uploader} • {new Date(file.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <a href={`${API_BASE_URL}/${file.path}`}>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                        </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* File Upload Dialog */}
        {(selectedTaskForUpload || selectedTaskId) && (
          <FileUploadDialog
            open={uploadDialogOpen}
            onOpenChange={(open) => {
              setUploadDialogOpen(open);
              if (!open) setSelectedTaskForUpload(null);
            }}
            projectId={id!}
            taskId={selectedTaskForUpload || selectedTaskId!}
            taskTitle={tasks.find(task => task.id === (selectedTaskForUpload || selectedTaskId))?.title || "Unknown Task"}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectWorkspace;