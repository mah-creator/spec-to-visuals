import { useState, useContext, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AuthContext } from "../App";
import { useProject } from "@/hooks/useProjects";
import { useTasks, useTaskComments } from "@/hooks/useTasks";
import { useProjectFiles, useTaskFiles } from "@/hooks/useFiles";
import { API_BASE_URL } from "@/lib/api-client";
import FileUploadDialog from "@/components/FileUploadDialog";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { InviteToProjectDialog } from "@/components/InviteToProjectDialog";
import { cn, getTimeDifference } from "@/lib/utils"; // Common path for cn utility



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
  MoreHorizontal,
  UserPlus
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

const ProjectWorkspace = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [taskComments, setTaskComments] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("tasks");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedTaskForUpload, setSelectedTaskForUpload] = useState<string | null>(null);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  
  const { project, isLoading: projectLoading } = useProject(id);
  const { tasks, isLoading: tasksLoading } = useTasks(id);
  const { addComment, isAddingComment } = useTaskComments();
  
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    // Start animation after component mounts
    const timer = setTimeout(() => {
      setAnimatedProgress(project?.progress * 100 || 0);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [project?.progress || 0]);
  
  var selectedTaskId: string;
  const { files: projectFiles, isLoading: filesLoading } = useProjectFiles(id || "");

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
      case 'Done': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'InProgress': return <Timer className="w-4 h-4 text-primary" />;
      case 'Todo': return <AlertCircle className="w-4 h-4 text-warning" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getProjectStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'Completed': 'bg-success/10 text-success',
      'Active': 'bg-primary/10 text-primary',
    };
    return variants[status] || 'bg-muted';
  };

  const getTaskStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'Done': 'bg-success/10 text-success',
      'InProgress': 'bg-primary/10 text-primary',
      'Todo': 'bg-warning/10 text-warning',
    };
    return variants[status] || 'bg-muted';
  };

  const handleAddComment = (taskId: string) => {
    const comment = taskComments[taskId];
    if (!comment?.trim()) return;
    
    addComment({ projectId: id!, taskId, comment });
    setTaskComments(prev => ({ ...prev, [taskId]: "" }));
  };

  const updateTaskComment = (taskId: string, comment: string) => {
    setTaskComments(prev => ({ ...prev, [taskId]: comment }));
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
            <div className="flex items-center gap-2">
              {user?.role === 'freelancer' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setInviteDialogOpen(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Client
                </Button>
              )}
              <Badge className={getProjectStatusBadge(project.status)}>
                {project.status}
              </Badge>
            </div>
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
                  {/* <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress * 100 || 0}%` }}
                    ></div>
                  </div> */}
                  
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${animatedProgress}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-primary font-medium">{(project.progress*100).toPrecision(3)}% complete</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        {/* <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg w-fit">
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
        </div> */}

      <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "tasks" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("tasks")}
          className={cn(
            activeTab === "tasks" && "bg-card text-card-foreground shadow-sm",
            "transition-all duration-200"
          )}
        >
          Tasks
        </Button>
        <Button
          variant={activeTab === "files" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("files")}
          className={cn(
            activeTab === "files" && "bg-card text-card-foreground shadow-sm",
            "transition-all duration-200"
          )}
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
        <Button 
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
          onClick={() => setCreateTaskDialogOpen(true)}
        >
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
              <div 
                className="flex items-start gap-3 cursor-pointer flex-1"
                onClick={() => toggleTaskExpansion(task.id)}
              >
                {getStatusIcon(task.status)}
                <div className="flex-1">
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-muted-foreground text-sm">{task.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getTaskStatusBadge(task.status)}>
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
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleTaskExpansion(task.id)}
                >
                  {expandedTasks[task.id] ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
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

            {/* Comments Section - Conditionally Rendered */}
            {expandedTasks[task.id] && (
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
                          <span className="text-xs text-muted-foreground">{getTimeDifference(new Date(comment.time))}</span>
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
                        value={taskComments[task.id] || ""}
                        onChange={(e) => updateTaskComment(task.id, e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddComment(task.id)}
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleAddComment(task.id)}
                        disabled={isAddingComment || !taskComments[task.id]?.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
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
                ) : projectFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No files uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projectFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{file.filename}</p>
                            <p className="text-sm text-muted-foreground">
                              {Math.round(file.size / 1024)} KB • Uploaded by {file.uploader} • {getTimeDifference(new Date(file.uploadedAt))}
                            </p>
                          </div>
                        </div>
                        <a href={`${API_BASE_URL}/${file.path}`} target="_blank">
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

        {/* Create Task Dialog */}
        <CreateTaskDialog 
          open={createTaskDialogOpen}
          onOpenChange={setCreateTaskDialogOpen}
          projectId={id!}
        />

        {/* Invite to Project Dialog */}
        <InviteToProjectDialog 
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          projectId={id!}
          projectTitle={project.title}
        />
      </div>
    </div>
  );
};

export default ProjectWorkspace;