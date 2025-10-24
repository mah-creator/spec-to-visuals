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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProjects } from "@/hooks/useProjects";
import { Plus, X, Calendar, FileText, Briefcase, Target, Clock, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateProjectDialog = ({ open, onOpenChange }: CreateProjectDialogProps) => {
  const { createProject, isCreating } = useProjects();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
    },
  });

  const onSubmit = (data: FormData) => {
    createProject({
      title: data.title,
      description: data.description,
      dueDate: data.dueDate || undefined,
    });
    
    form.reset();
    onOpenChange(false);
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border border-gray-200 shadow-xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Rocket className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-semibold">Create New Project</div>
                <div className="text-sm font-normal text-gray-500 mt-1">
                  Start a new project journey
                </div>
              </div>
            </DialogTitle>
          </div>
          
          <DialogDescription className="text-gray-600">
            <p className="text-sm leading-relaxed">
              Set up your new project with a clear title, detailed description, and timeline to get started successfully.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Project Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    Project Title
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter a clear and descriptive project name..."
                      className={cn(
                        "h-11 border-gray-300 focus:border-blue-500 transition-colors",
                        form.formState.errors.title && "border-red-500 focus:border-red-500"
                      )}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-red-600 text-sm flex items-center gap-1" />
                </FormItem>
              )}
            />
            
            {/* Project Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Project Description
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the project goals, objectives, deliverables, and any important details..."
                      className={cn(
                        "min-h-[120px] border-gray-300 focus:border-blue-500 transition-colors resize-none",
                        form.formState.errors.description && "border-red-500 focus:border-red-500"
                      )}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-red-600 text-sm flex items-center gap-1" />
                </FormItem>
              )}
            />
            
            {/* Due Date */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    Target Completion Date
                    <span className="text-gray-400 font-normal text-sm">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        type="date"
                        min={today}
                        className={cn(
                          "h-11 pl-10 border-gray-300 focus:border-blue-500 transition-colors",
                          field.value && "border-green-500"
                        )}
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  {field.value && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Target completion date: {new Date(field.value).toLocaleDateString()}
                    </p>
                  )}
                  <FormMessage className="text-red-600 text-sm flex items-center gap-1" />
                </FormItem>
              )}
            />

            {/* Form Status */}
            {form.formState.isValid && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>Ready to launch project</span>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <DialogFooter className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isCreating}
                className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isCreating || !form.formState.isValid}
                className={cn(
                  "flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200",
                  "shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isCreating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Project...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Rocket className="w-4 h-4" />
                    Launch Project
                  </div>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {/* Project Setup Tips */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="text-xs font-medium text-gray-900 mb-2 flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              Project Setup Tips
            </h4>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>Choose a clear, descriptive project name</li>
              <li>Include specific goals and deliverables in the description</li>
              <li>Set realistic timelines to keep everyone aligned</li>
              <li>You can add tasks and invite team members after creation</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};