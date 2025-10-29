import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInvitationsByStatus } from '@/hooks/useInvitationsByStatus';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Check, X, Mail, Briefcase, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Pagination } from '@/components/ui/Pagination';
import { useState, useEffect } from 'react';

export const InvitationsSection = ({ highlightedInvitationId }: { highlightedInvitationId?: string | null }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const { 
    invitations, 
    isLoading, 
    totalPages, 
    acceptInvitation, 
    declineInvitation, 
    isAccepting, 
    isDeclining 
  } = useInvitationsByStatus(
    activeTab === 'pending' ? 'Pending' : 
    activeTab === 'accepted' ? 'Accepted' : 'Declined',
    currentPage, 
    pageSize
  );

  // Reset to page 1 when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'pending' | 'accepted' | 'declined');
    setCurrentPage(1);
  };

  // Scroll to highlighted invitation
  useEffect(() => {
    if (highlightedInvitationId) {
      setTimeout(() => {
        const element = document.getElementById(`invitation-${highlightedInvitationId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [highlightedInvitationId, invitations]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Accepted':
        return <Badge className="bg-green-500 hover:bg-green-600"><Check className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'Declined':
        return <Badge variant="secondary"><X className="h-3 w-3 mr-1" />Declined</Badge>;
      case 'Pending':
        return <Badge variant="outline" className="border-primary text-primary">Pending Response</Badge>;
      default:
        return null;
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'declined':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case 'pending':
        return {
          icon: <Clock className="h-16 w-16 mb-3 opacity-20" />,
          title: "No pending invitations",
          description: "You're all caught up! No pending invitations at the moment."
        };
      case 'accepted':
        return {
          icon: <CheckCircle className="h-16 w-16 mb-3 opacity-20" />,
          title: "No accepted invitations",
          description: "You haven't accepted any invitations yet."
        };
      case 'declined':
        return {
          icon: <XCircle className="h-16 w-16 mb-3 opacity-20" />,
          title: "No declined invitations",
          description: "You haven't declined any invitations."
        };
      default:
        return {
          icon: <Mail className="h-16 w-16 mb-3 opacity-20" />,
          title: "No invitations",
          description: "You don't have any project invitations"
        };
    }
  };

const renderInvitationCard = (invitation: any) => (
  <Card 
    key={invitation.id}
    id={`invitation-${invitation.id}`}
    className={`
      transition-all duration-200 hover:shadow-md
      ${invitation.status === 'Pending' && !invitation.isExpired 
        ? 'border-primary shadow-sm bg-primary/5' 
        : 'border-muted'
      }
      ${invitation.isExpired ? 'opacity-75' : ''}
      ${highlightedInvitationId === invitation.id ? 'flash-highlight' : ''}
    `}
  >
    <CardContent className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left Content */}
        <div className="flex-1 space-y-3">
          {/* Header with Project Info */}
          <div className="flex items-start gap-3">
            <div className={`
              p-2 rounded-lg flex-shrink-0
              ${invitation.status === 'Pending' && !invitation.isExpired 
                ? 'bg-primary/20' 
                : invitation.status === 'Accepted'
                ? 'bg-green-500/20'
                : 'bg-gray-200'
              }
            `}>
              <Briefcase className={`
                h-5 w-5
                ${invitation.status === 'Pending' && !invitation.isExpired 
                  ? 'text-primary' 
                  : invitation.status === 'Accepted'
                  ? 'text-green-600'
                  : 'text-gray-600'
                }
              `} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground truncate">
                {invitation.projectTitle}
              </h3>
              {/* <div className="flex items-center gap-2 mt-2 flex-wrap">
                {getStatusBadge(invitation.status)}
                {invitation.isExpired && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <X className="h-3 w-3" />
                    Expired
                  </Badge>
                )}
              </div> */}
            </div>
          </div>

          {/* Inviter Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground pl-11">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              Invited by <span className="font-medium text-foreground">{invitation.inviter.name}</span>
            </span>
          </div>

          {/* Metadata Row */}
          <div className="flex items-center justify-between pl-11">
            {/* <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(`${invitation.invitationDate}Z`), { addSuffix: true })}
            </div> */}
            {invitation.status !== 'Pending' && (
              <div className="text-xs text-muted-foreground">
                {invitation.status === 'Accepted' ? 'Joined' : 'Declined'}{' '}
                {formatDistanceToNow(new Date(`${invitation.invitationDate}Z`), { addSuffix: true })}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Only for Pending & Not Expired */}
        {invitation.status === 'Pending' && !invitation.isExpired && (
          <div className="flex sm:flex-col gap-2 sm:min-w-[120px]">
            <Button
              size="sm"
              className="flex-1 sm:w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => acceptInvitation(invitation.id)}
              disabled={isAccepting || isDeclining}
            >
              {isAccepting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 sm:w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => declineInvitation(invitation.id)}
              disabled={isAccepting || isDeclining}
            >
              {isDeclining ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </>
              )}
            </Button>
          </div>
        )}

        {/* Status Indicator for Non-Pending */}
        {invitation.status !== 'Pending' && (
          <div className="flex sm:flex-col items-center gap-2 sm:min-w-[80px]">
            <div className={`
              p-2 rounded-full
              ${invitation.status === 'Accepted' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-600'
              }
            `}>
              {invitation.status === 'Accepted' ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </div>
            <span className="text-xs text-muted-foreground hidden sm:block text-center">
              {invitation.status === 'Accepted' ? 'Accepted' : 'Declined'}
            </span>
          </div>
        )}
      </div>

      {/* Expired Message */}
      {invitation.isExpired && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs text-red-600 text-center">
            This invitation has expired and can no longer be accepted
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);

  const emptyState = getEmptyStateMessage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Project Invitations
        </CardTitle>
        <CardDescription>
          Manage your project invitations across different statuses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Accepted
            </TabsTrigger>
            <TabsTrigger value="declined" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Declined
            </TabsTrigger>
          </TabsList>

          {['pending', 'accepted', 'declined'].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : invitations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
                  {emptyState.icon}
                  <p className="text-sm font-medium mb-1">{emptyState.title}</p>
                  <p className="text-xs">{emptyState.description}</p>
                </div>
              ) : (
                <>
                  {invitations.map(renderInvitationCard)}
                  {totalPages > 1 && (
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      className="mt-4"
                    />
                  )}
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};