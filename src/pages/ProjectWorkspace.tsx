import { useState, useContext, useEffect } from "react";
import { 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  PlayCircle, 
  XCircle,
  ArrowLeft,
  Plus,
  Calendar,
  Users,
  FileText,
  Upload,
  Download,
  MessageSquare,
  Send,
  MoreHorizontal,
  UserPlus,
  Paperclip,
  ListChecks,
  Clock,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "../App";
import { useProject } from "@/hooks/useProjects";
import { useTasks, useTaskComments } from "@/hooks/useTasks";
import FileUploadDialog from "@/components/FileUploadDialog";
import { useProjectFiles } from "@/hooks/useFiles";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { InviteToProjectDialog } from "@/components/InviteToProjectDialog";
import { cn, getTimeDifference } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "@/lib/api-client";

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
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<Record<string, boolean>>({});
  
  const { project, isLoading: projectLoading } = useProject(id);
  const { tasks, isLoading: tasksLoading, updateTaskStatus, isUpdating } = useTasks(id);
  const { addComment, isAddingComment } = useTaskComments();
  const [taskFilter, setTaskFilter] = useState<'all' | 'active' | 'canceled'>('active');
  
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const toggleActionsMenu = (taskId: string) => {
    setIsActionsMenuOpen(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(project?.progress * 100 || 0);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [project?.progress || 0]);
  
  const { files: projectFiles, isLoading: filesLoading } = useProjectFiles(id || "");

  // Enhanced status configuration
  const statusConfig = {
    todo: { 
      label: 'To Do', 
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: <Clock className="w-3 h-3" />
    },
    in_progress: { 
      label: 'In Progress', 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <PlayCircle className="w-3 h-3" />
    },
    pending_review: { 
      label: 'Pending Review', 
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: <Eye className="w-3 h-3" />
    },
    done: { 
      label: 'Completed', 
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: <CheckCircle2 className="w-3 h-3" />
    },
    canceled: { 
      label: 'Canceled', 
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: <XCircle className="w-3 h-3" />
    }
  };

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

  const getStatusConfig = (status: string) => {
    return statusConfig[status.toLowerCase()] || statusConfig.todo;
  };

  const getProjectStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'Deleted': 'bg-red-100 text-red-800 border-red-200',
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Active': 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return variants[status] || 'bg-gray-100 text-gray-800 border-gray-200';
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

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTaskStatus({ taskId, status: newStatus });
  };

  const getNextStatus = (currentStatus: string, userRole: string): string | null => {
    const normalizedStatus = currentStatus.toLowerCase();
    if (userRole === 'freelancer') {
      if (normalizedStatus === 'todo') return 'In_progress';
      if (normalizedStatus === 'in_progress') return 'Pending_review';
      return null;
    } else if (userRole === 'customer') {
      if (normalizedStatus === 'pending_review') return 'Done';
      return null;
    }
    return null;
  };

  const canChangeStatus = (currentStatus: string, userRole: string): boolean => {
    return getNextStatus(currentStatus, userRole) !== null;
  };

  const filteredTasks = tasks.filter(task => {
    if (taskFilter === 'active') return task.status !== 'Canceled';
    if (taskFilter === 'canceled') return task.status === 'Canceled';
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[var(--content-width)] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
              <p className="text-sm text-gray-600 flex items-center gap-2">
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
                  className="border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Client
                </Button>
              )}
              <Badge className={cn("border px-3 py-1 rounded-full text-sm font-medium", getProjectStatusBadge(project.status))}>
                {project.status}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[var(--content-width)] mx-auto px-6 py-8">
        {/* Project Overview */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-gray-900">Project Description</h3>
                <p className="text-gray-600 leading-relaxed">{project.description}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-gray-900">Timeline</h3>
                <p className="text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-gray-900">Progress</h3>
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${animatedProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-blue-600 font-medium">{(project.progress * 100).toFixed(1)}% complete</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === "tasks" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("tasks")}
            className={cn(
              activeTab === "tasks" && "bg-white text-gray-900 shadow-sm",
              "transition-all duration-200 hover:bg-white/50"
            )}
          >
            Tasks
          </Button>
          <Button
            variant={activeTab === "files" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("files")}
            className={cn(
              activeTab === "files" && "bg-white text-gray-900 shadow-sm",
              "transition-all duration-200 hover:bg-white/50"
            )}
          >
            Files
          </Button>
        </div>

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
              <div className="flex items-center gap-3">
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  <Button
                    variant={taskFilter === 'active' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTaskFilter('active')}
                    className={cn(
                      taskFilter === 'active' && "bg-white text-gray-900 shadow-sm",
                      "transition-all duration-200 hover:bg-white/50"
                    )}
                  >
                    <ListChecks className="w-4 h-4 mr-2" />
                    Active
                  </Button>
                  <Button
                    variant={taskFilter === 'canceled' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTaskFilter('canceled')}
                    className={cn(
                      taskFilter === 'canceled' && "bg-white text-gray-900 shadow-sm",
                      "transition-all duration-200 hover:bg-white/50"
                    )}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Canceled
                  </Button>
                </div>
                {user?.role === 'freelancer' && (
                  <Button 
                    className="bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all duration-200"
                    onClick={() => setCreateTaskDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                const status = getStatusConfig(task.status);
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                
                return (
                  <div key={task.id} className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border",
                              status.color
                            )}>
                              {status.icon}
                              {status.label}
                            </span>
                            
                            {/* Overdue Badge */}
                            {task.isOverdue && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Overdue
                              </span>
                            )}
                          </div>

                          <h3 
                            className="font-semibold text-gray-900 text-lg mb-1 hover:text-blue-600 cursor-pointer transition-colors"
                            onClick={() => toggleTaskExpansion(task.id)}
                          >
                            {task.title}
                          </h3>
                          
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {task.description}
                          </p>

                          {/* Metadata Row */}
                          <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              {task.dueDate ? (
                                <span className={task.isOverdue ? 'text-red-600 font-medium' : ''}>
                                  Due {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              ) : (
                                'No due date'
                              )}
                            </span>
                            
                            <span className="flex items-center gap-1.5">
                              <Users className="w-4 h-4" />
                              {task.assignee || 'Unassigned'}
                            </span>

                            {/* File Count */}
                            {task.filesCount > 0 && (
                              <span className="flex items-center gap-1.5">
                                <Paperclip className="w-4 h-4" />
                                {task.filesCount} file{task.filesCount !== 1 ? 's' : ''}
                              </span>
                            )}

                            {/* Comment Count */}
                            {task.comments?.length > 0 && (
                              <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                                <MessageSquare className="w-4 h-4" />
                                {task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Area */}
                        <div className="flex items-center gap-2">
                          {/* Primary Action Button */}
                          {canChangeStatus(task.status, user?.role || '') && task.status !== 'Canceled' && (
                            <Button 
                              onClick={() => handleStatusChange(task.id, getNextStatus(task.status, user?.role || '')!)}
                              disabled={isUpdating}
                              className={cn(
                                "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm",
                                user?.role === 'freelancer' && task.status.toLowerCase() === 'todo' 
                                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                  : user?.role === 'freelancer' && task.status.toLowerCase() === 'in_progress'
                                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                                  : user?.role === 'customer' && task.status.toLowerCase() === 'pending_review'
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              )}
                            >
                              {user?.role === 'freelancer' && task.status.toLowerCase() === 'todo' && (
                                <>
                                  <PlayCircle className="w-4 h-4 mr-2" />
                                  Start Task
                                </>
                              )}
                              {user?.role === 'freelancer' && task.status.toLowerCase() === 'in_progress' && (
                                <>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Submit for Review
                                </>
                              )}
                              {user?.role === 'customer' && task.status.toLowerCase() === 'pending_review' && (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve
                                </>
                              )}
                            </Button>
                          )}

                          {/* Expand/Collapse Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTaskExpansion(task.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            {expandedTasks[task.id] ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>

                          {/* Actions Menu */}
                          <div className="relative">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleActionsMenu(task.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                            
                            {isActionsMenuOpen[task.id] && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 animate-in fade-in duration-200">
                                <button
                                  onClick={() => {
                                    setSelectedTaskForUpload(task.id);
                                    setUploadDialogOpen(true);
                                    toggleActionsMenu(task.id);
                                  }}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                  <Upload className="w-4 h-4" />
                                  Upload Files
                                </button>
                                
                                {user?.role === 'freelancer' && task.status !== 'Canceled' && task.status !== 'Done' && (
                                  <button
                                    onClick={() => {
                                      handleStatusChange(task.id, 'Canceled');
                                      toggleActionsMenu(task.id);
                                    }}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Cancel Task
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {expandedTasks[task.id] && (
                      <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50 animate-in fade-in duration-200">
                        {/* Comments Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-3">
                            <MessageSquare className="w-4 h-4 text-gray-600" />
                            <span className="font-medium text-gray-900">Comments ({task.comments?.length || 0})</span>
                          </div>
                          
                          <div className="space-y-3">
                            {task.comments?.map((comment) => (
                              <div key={comment.id} className="flex gap-3 group">
                                <Avatar className="w-8 h-8 flex-shrink-0">
                                  <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                                    {comment.author.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200 group-hover:border-gray-300 transition-colors">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-sm text-gray-900">{comment.author}</span>
                                    <span className="text-xs text-gray-500">{getTimeDifference(new Date(comment.time))}</span>
                                  </div>
                                  <p className="text-sm text-gray-700">{comment.message}</p>
                                </div>
                              </div>
                            ))}
                            
                            {/* Add Comment */}
                            <div className="flex gap-3">
                              <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarFallback className="text-xs bg-green-100 text-green-600">
                                  {user?.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 flex gap-2">
                                <Input
                                  placeholder="Add a comment..."
                                  value={taskComments[task.id] || ""}
                                  onChange={(e) => updateTaskComment(task.id, e.target.value)}
                                  onKeyPress={(e) => e.key === "Enter" && handleAddComment(task.id)}
                                  className="flex-1"
                                />
                                <Button 
                                  size="sm" 
                                  onClick={() => handleAddComment(task.id)}
                                  disabled={isAddingComment || !taskComments[task.id]?.trim()}
                                  className="bg-blue-600 hover:bg-blue-700 transition-colors"
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === "files" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Project Files</h2>
              <Button 
                className="bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-colors"
                onClick={() => setUploadDialogOpen(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
            </div>
            
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                {filesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading files...</p>
                  </div>
                ) : projectFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No files uploaded yet</p>
                    <Button 
                      className="mt-3 bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => setUploadDialogOpen(true)}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload First File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projectFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{file.filename}</p>
                            <p className="text-sm text-gray-500">
                              {Math.round(file.size / 1024)} KB • Uploaded by {file.uploader} • {getTimeDifference(new Date(file.uploadedAt))}
                            </p>
                          </div>
                        </div>
                        <a href={`${API_BASE_URL}/api/Files/${file.id}`} download={file.filename}>
                          <Button variant="ghost" size="sm" className="hover:bg-gray-200 transition-colors">
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
        {selectedTaskForUpload && (
          <FileUploadDialog
            open={uploadDialogOpen}
            onOpenChange={(open) => {
              setUploadDialogOpen(open);
              if (!open) setSelectedTaskForUpload(null);
            }}
            projectId={id!}
            taskId={selectedTaskForUpload}
            taskTitle={tasks.find(task => task.id === selectedTaskForUpload)?.title || "Unknown Task"}
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