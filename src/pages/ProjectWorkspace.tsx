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
  CheckCircle,
  TrendingUp,
  UserCircle,
  LogOut,
  Trash2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "../App";
import { useProject, useProjects } from "@/hooks/useProjects";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTasks, useTaskComments } from "@/hooks/useTasks";
import FileUploadDialog from "@/components/FileUploadDialog";
import { useProjectFiles } from "@/hooks/useFiles";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { InviteToProjectDialog } from "@/components/InviteToProjectDialog";
import { cn, getTimeDifference } from "@/lib/utils";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "@/lib/api-client";
import FileTypeIcon from "@/components/ui/FileTypeIcon";
import { Pagination } from "@/components/ui/Pagination";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { useProfile } from "@/hooks/useProfile";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProjectWorkspace = () => {
  const { profile } = useProfile();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [taskComments, setTaskComments] = useState<Record<string, string>>({});
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [highlightedFileId, setHighlightedFileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("tasks");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedTaskForUpload, setSelectedTaskForUpload] = useState<string | null>(null);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<Record<string, boolean>>({});
  const [tasksPage, setTasksPage] = useState(1);
  const [filesPage, setFilesPage] = useState(1);
  const tasksPageSize = 5;
  const filesPageSize = 10;
  const [avatarTimestamp] = useState(Date.now());
  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    open: boolean;
    newStatus: string;
    title: string;
    description: string;
  }>({ open: false, newStatus: '', title: '', description: '' });
  
  
  const { project, isLoading: projectLoading } = useProject(id);
  const { updateProjectStatus, isUpdatingStatus } = useProjects();
  const { tasks, isLoading: tasksLoading, updateTaskStatus, isUpdating, totalPages: tasksTotalPages } = useTasks(id, tasksPage, tasksPageSize);
  const { addComment, isAddingComment } = useTaskComments(id, tasksPage, tasksPageSize);
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
      setAnimatedProgress(project?.progress *100 || 0);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [project?.progress * 100 || 0]);
  
  const { files: projectFiles, isLoading: filesLoading, totalPages: filesTotalPages } = useProjectFiles(id || "", filesPage, filesPageSize);

  // Handle deep linking to specific tasks and files
  useEffect(() => {
    const taskId = searchParams.get('taskId');
    const fileId = searchParams.get('fileId');
    
    // Handle file deep linking - prioritize files over tasks
    if (fileId) {
      // Switch to files tab immediately
      setActiveTab('files');
      
      // Highlight and scroll when files are loaded
      if (projectFiles.length > 0) {
        setHighlightedFileId(fileId);
        
        setTimeout(() => {
          const fileElement = document.getElementById(`file-${fileId}`);
          if (fileElement) {
            fileElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
        
        setTimeout(() => {
          setHighlightedFileId(null);
          searchParams.delete('fileId');
          setSearchParams(searchParams, { replace: true });
        }, 6500);
      }
      return; // Don't process taskId if fileId is present
    }
    
    // Handle task deep linking
    if (taskId && tasks.length > 0) {
      setActiveTab('tasks');
      setHighlightedTaskId(taskId);
      setExpandedTasks(prev => ({ ...prev, [taskId]: true }));
      
      setTimeout(() => {
        const taskElement = document.getElementById(`task-${taskId}`);
        if (taskElement) {
          taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      
      setTimeout(() => {
        setHighlightedTaskId(null);
        searchParams.delete('taskId');
        setSearchParams(searchParams, { replace: true });
      }, 6500);
    }
  }, [searchParams, tasks, projectFiles, setSearchParams]);

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
      'Pending_Complete_Approval': 'bg-amber-100 text-amber-800 border-amber-200',
      'Pending_Delete_Approval': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return variants[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleProjectStatusChange = (newStatus: string) => {
    const statusLabels: Record<string, string> = {
      'Pending_Complete_Approval': 'Submit for Completion Approval',
      'Pending_Delete_Approval': 'Submit for Deletion Approval',
      'Completed': 'Mark as Completed',
      'Deleted': 'Delete Project',
      'Active': 'Reactivate Project'
    };

    const descriptions: Record<string, string> = {
      'Pending_Complete_Approval': 'This will submit the project to the client for completion approval.',
      'Pending_Delete_Approval': 'This will submit the project to the client for deletion approval.',
      'Completed': 'This will mark the project as completed.',
      'Deleted': 'This will permanently delete the project.',
      'Active': 'This will reactivate the project and set its status back to Active.'
    };

    setStatusChangeDialog({
      open: true,
      newStatus,
      title: statusLabels[newStatus] || 'Change Status',
      description: descriptions[newStatus] || 'Are you sure you want to change the project status?'
    });
  };

  const confirmStatusChange = () => {
    if (id && statusChangeDialog.newStatus) {
      updateProjectStatus({ 
        projectId: id, 
        status: statusChangeDialog.newStatus 
      });
    }
    setStatusChangeDialog({ open: false, newStatus: '', title: '', description: '' });
  };

  const getAvailableStatusActions = () => {
    if (!project || !user) return [];

    const actions: Array<{ label: string; status: string; variant: 'default' | 'destructive'; icon: any }> = [];

    // Freelancer actions
    if (user.role === 'freelancer' && project.status === 'Active') {
      if (project.progress >= 1) {
        actions.push({
          label: 'Submit for Completion',
          status: 'Pending_Complete_Approval',
          variant: 'default',
          icon: <CheckCircle className="w-4 h-4" />
        });
      }
      actions.push({
        label: 'Request Deletion',
        status: 'Pending_Delete_Approval',
        variant: 'destructive',
        icon: <Trash2 className="w-4 h-4" />
      });
    }

    // Customer actions
    if (user.role === 'customer') {
      if (project.status === 'Pending_Complete_Approval') {
        actions.push({
          label: 'Approve Completion',
          status: 'Completed',
          variant: 'default',
          icon: <CheckCircle className="w-4 h-4" />
        });
        actions.push({
          label: 'Reject Completion',
          status: 'Active',
          variant: 'destructive',
          icon: <XCircle className="w-4 h-4" />
        });
      }
      
      if (project.status === 'Pending_Delete_Approval') {
        actions.push({
          label: 'Approve Deletion',
          status: 'Deleted',
          variant: 'destructive',
          icon: <Trash2 className="w-4 h-4" />
        });
        actions.push({
          label: 'Reject Deletion',
          status: 'Active',
          variant: 'default',
          icon: <XCircle className="w-4 h-4" />
        });
      }
    }

    return actions;
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
            <div className="flex items-center gap-4">
              <NotificationsDropdown />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100 transition-colors">
                    <Avatar className="w-8 h-8 border border-gray-200">
                      <AvatarImage 
                        src={profile?.avatarUrl ? `${API_BASE_URL}${profile.avatarUrl}?t=${avatarTimestamp}` : ''} 
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                        {user?.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm text-left">
                      <div className="font-medium text-gray-900">{profile?.name}</div>
                      <div className="text-gray-600 capitalize">{user?.role}</div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border border-gray-200 shadow-lg">
                  <DropdownMenuLabel className="text-gray-900">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => navigate('/profile')}
                    className="cursor-pointer text-gray-700 hover:bg-gray-50"
                  >
                    <UserCircle className="w-4 h-4 mr-2 text-gray-600" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="cursor-pointer text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* <div className="flex items-center gap-2">
              
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
            </div> */}
          </div>
        </div>
      </header>

      <div className="max-w-[var(--content-width)] mx-auto px-6 py-8">
<div className="max-w-[var(--content-width)] mx-auto px-6 py-8">
  {/* Project Overview */}
  <Card className="border border-gray-200/60 shadow-sm hover:shadow-xl transition-all duration-500 backdrop-blur-sm bg-white/97 rounded-2xl overflow-hidden">
    {/* Subtle top accent border */}
    <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"></div>
    
    <CardContent className="p-8 space-y-8">
      {/* Header with Actions and Status */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{project.title}</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Project ID: {project.id.slice(0, 8)}...
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              {user?.role === 'freelancer' ? project.client : project.freelancer}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
          {user?.role === 'freelancer' && (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setInviteDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
            >
              <UserPlus className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
              Invite Client
            </Button>
          )}
          
          {/* Status Badge with Dropdown Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold border-0 shadow-lg backdrop-blur-sm cursor-pointer",
                getProjectStatusBadge(project.status),
                "transition-all duration-300 hover:scale-105 hover:shadow-xl",
                "flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50",
                getAvailableStatusActions().length > 0 && "hover:brightness-95"
              )}>
                <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                {project.status.split('_').map((word, i) => 
                  i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
                ).join(' ')}
                {getAvailableStatusActions().length > 0 && (
                  <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-70" />
                )}
              </button>
            </DropdownMenuTrigger>
            
            {getAvailableStatusActions().length > 0 && (
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-white border border-gray-200 shadow-xl z-50 rounded-lg p-1"
              >
                <DropdownMenuLabel className="text-xs text-gray-500 font-medium px-2 py-1.5">
                  Project Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {getAvailableStatusActions().map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => handleProjectStatusChange(action.status)}
                    disabled={isUpdatingStatus}
                    className={cn(
                      "cursor-pointer px-3 py-2.5 rounded-md transition-colors",
                      "flex items-center gap-3 focus:outline-none",
                      action.variant === 'destructive' 
                        ? "text-red-600 hover:bg-red-50 focus:bg-red-50" 
                        : "text-gray-700 hover:bg-blue-50 focus:bg-blue-50",
                      isUpdatingStatus && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full",
                      action.variant === 'destructive' 
                        ? "bg-red-100 text-red-600" 
                        : "bg-blue-100 text-blue-600"
                    )}>
                      {action.icon}
                    </span>
                    <span className="font-medium text-sm">{action.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </div>
      </div>

      {/* Project Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Description */}
        <div className="space-y-4 group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Description</h3>
              <p className="text-sm text-gray-500">Project overview and details</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100/50 hover:border-blue-200 transition-all duration-300 group-hover:shadow-md">
            <p className="text-gray-700 leading-relaxed text-sm">
              {project.description || (
                <span className="text-gray-400 italic">No description provided for this project</span>
              )}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4 group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Timeline</h3>
              <p className="text-sm text-gray-500">Project schedule and deadlines</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100/50 hover:border-green-200 transition-all duration-300 group-hover:shadow-md">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Due Date</span>
                {project.dueDate ? (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-green-600" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
              
              {project.dueDate ? (
                <>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {new Date(project.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(project.dueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        weekday: 'long'
                      })}
                    </p>
                  </div>
                  
                  <div className="bg-white/80 rounded-lg p-3 text-center border border-green-200/50">
                    <p className={cn(
                      "text-sm font-semibold",
                      Math.ceil((new Date(project.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 7 
                        ? "text-amber-600" 
                        : "text-green-600"
                    )}>
                      {Math.ceil((new Date(project.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">No due date set</p>
                  <Button variant="ghost" size="sm" className="mt-2 text-blue-600 hover:text-blue-700">
                    Set deadline
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-4 group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Progress</h3>
              <p className="text-sm text-gray-500">Completion status</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100/50 hover:border-purple-200 transition-all duration-300 group-hover:shadow-md">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Completion</span>
                <span className={cn(
                  "text-xl font-bold px-3 py-1 rounded-full",
                  animatedProgress >= 80 ? "text-green-600 bg-green-100" :
                  animatedProgress >= 50 ? "text-blue-600 bg-blue-100" :
                  "text-purple-600 bg-purple-100"
                )}>
                  {(project.progress*100).toFixed(0)}%
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="w-full bg-white/80 rounded-full h-3 overflow-hidden shadow-inner border border-gray-200/50">
                  <div 
                    className={cn(
                      "h-3 rounded-full transition-all duration-1000 ease-out shadow-sm",
                      animatedProgress >= 80 ? "bg-gradient-to-r from-green-500 to-emerald-600" :
                      animatedProgress >= 50 ? "bg-gradient-to-r from-blue-500 to-cyan-600" :
                      "bg-gradient-to-r from-purple-500 to-indigo-600"
                    )}
                    style={{ width: `${animatedProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div className="bg-white/80 rounded-lg p-3 text-center border border-purple-200/50">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">{project.tasksCompleted}</span> of{" "}
                  <span className="font-semibold text-gray-900">{project.tasksTotal}</span> tasks completed
                </p>
                {project.tasksTotal > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round((project.tasksCompleted / project.tasksTotal) * 100)}% of tasks done
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</div>

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
                  <div 
                    key={task.id} 
                    id={`task-${task.id}`}
                    className={cn(
                      "bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden",
                      highlightedTaskId === task.id && "flash-highlight"
                    )}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border whitespace-nowrap",
                              status.color
                            )}>
                              {status.icon}
                              {status.label}
                            </span>
                            
                            {/* Overdue Badge */}
                            {task.isOverdue && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 flex items-center gap-1 whitespace-nowrap">
                                <AlertTriangle className="w-3 h-3" />
                                Overdue
                              </span>
                            )}
                          </div>

                          <h3 
                            className="font-semibold text-gray-900 text-lg mb-1 hover:text-blue-600 cursor-pointer transition-colors break-words"
                            onClick={() => toggleTaskExpansion(task.id)}
                          >
                            {task.title}
                          </h3>
                          
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3 break-words">
                            {task.description}
                          </p>

                          {/* Metadata Row */}
                          <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1.5 whitespace-nowrap">
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              {task.dueDate ? (
                                <span className={task.isOverdue ? 'text-red-600 font-medium' : ''}>
                                  Due {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              ) : (
                                'No due date'
                              )}
                            </span>
                            
                            <span className="flex items-center gap-1.5 min-w-0">
                              <Users className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{task.assignee || 'Unassigned'}</span>
                            </span>

                            {/* File Count */}
                            {task.filesCount > 0 && (
                              <span className="flex items-center gap-1.5 whitespace-nowrap">
                                <Paperclip className="w-4 h-4 flex-shrink-0" />
                                {task.filesCount} file{task.filesCount !== 1 ? 's' : ''}
                              </span>
                            )}

                            {/* Comment Count */}
                            {task.comments?.length > 0 && (
                              <span className="flex items-center gap-1.5 text-blue-600 font-medium whitespace-nowrap">
                                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                                {task.comments.length} comment{task.comments.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Area */}
                        <div className="flex items-center gap-2 flex-shrink-0">
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
                                    <span className="text-xs text-gray-500">{getTimeDifference(new Date(comment.time.charAt(comment.time.length-1) == 'Z' ? comment.time : `${comment.time}Z`))}</span>
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
            {tasksTotalPages > 1 && (
              <Pagination 
                currentPage={tasksPage}
                totalPages={tasksTotalPages}
                onPageChange={setTasksPage}
                className="mt-6"
              />
            )}
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
                      <div 
                        key={index} 
                        id={`file-${file.id}`}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100",
                          highlightedFileId === file.id.toString() && "flash-highlight"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                              <FileTypeIcon 
                                mimeType={file.contentType} 
                                filename={file.filename}
                                className="w-5 h-5 text-blue-600"
                              />
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
                {filesTotalPages > 1 && (
                  <Pagination 
                    currentPage={filesPage}
                    totalPages={filesTotalPages}
                    onPageChange={setFilesPage}
                    className="mt-4"
                  />
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

        {/* Status Change Confirmation Dialog */}
        <AlertDialog open={statusChangeDialog.open} onOpenChange={(open) => 
          setStatusChangeDialog(prev => ({ ...prev, open }))
        }>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{statusChangeDialog.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {statusChangeDialog.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmStatusChange}
                disabled={isUpdatingStatus}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ProjectWorkspace;