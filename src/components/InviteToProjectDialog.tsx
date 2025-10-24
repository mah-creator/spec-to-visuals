import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProjects } from "@/hooks/useProjects";
import { Mail, UserPlus, X, Send, Users, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof formSchema>;

interface InviteToProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
}

export const InviteToProjectDialog = ({ open, onOpenChange, projectId, projectTitle }: InviteToProjectDialogProps) => {
  const { inviteToProject, isInviting } = useProjects();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: FormData) => {
    inviteToProject({ projectId, email: data.email });
    form.reset();
    onOpenChange(false);
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] border border-gray-200 shadow-xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-semibold">Invite to Project</div>
                <div className="text-sm font-normal text-gray-500 mt-1">
                  Send collaboration invitation
                </div>
              </div>
            </DialogTitle>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </Button> */}
          </div>
          
          <DialogDescription className="text-gray-600 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-gray-700">{projectTitle}</span>
            </div>
            <p className="text-sm leading-relaxed">
              Invite a client to collaborate on this project. They will receive an email invitation to join and access project details.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Client Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        type="email"
                        placeholder="client@example.com" 
                        className={cn(
                          "pl-10 pr-4 h-11 border-gray-300 focus:border-blue-500 transition-colors",
                          form.formState.errors.email && "border-red-500 focus:border-red-500"
                        )}
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-600 text-sm flex items-center gap-1" />
                </FormItem>
              )}
            />
            
            {/* Additional Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-blue-800">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">What happens next?</span>
              </div>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>Client receives email invitation</li>
                <li>They can accept and join the project</li>
                <li>You'll be notified when they accept</li>
              </ul>
            </div>
            
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isInviting}
                className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isInviting || !form.formState.isValid}
                className={cn(
                  "flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200",
                  "shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isInviting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Invitation
                  </div>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};