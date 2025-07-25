import { ChevronDown, Loader, Trash2, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { useAuthContext } from "@/context/auth-provider";
import useWorkspaceId from "@/hooks/use-workspace-id";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeWorkspaceMemberRoleMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Permissions } from "@/constant";
import { RemoveMemberDialog } from "./remove-member-dialog";
const AllMembers = () => {
  const { user, hasPermission } = useAuthContext();

  const canChangeMemberRole = hasPermission(Permissions.CHANGE_MEMBER_ROLE);
  const canRemoveMember = hasPermission(Permissions.REMOVE_MEMBER);

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const { data, isPending } = useGetWorkspaceMembers(workspaceId);
  const members = data?.members || [];
  const roles = data?.roles || [];

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: changeWorkspaceMemberRoleMutationFn,
  });

  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<
    (typeof members)[0] | null
  >(null);

  const handleOpenRemoveMemberDialog = (member: (typeof members)[0]) => {
    setSelectedMember(member);
    setRemoveMemberDialogOpen(true);
  };

  const handleCloseRemoveMemberDialog = (open: boolean) => {
    setRemoveMemberDialogOpen(open);
    if (!open) {
      // Reset state immediately to prevent stale closures
      setSelectedMember(null);
    }
  };

  const handleSelect = (roleId: string, memberId: string) => {
    if (!roleId || !memberId) return;
    const payload = {
      workspaceId,
      data: {
        roleId,
        memberId,
      },
    };
    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["members", workspaceId],
        });
        toast({
          title: "Success",
          description: "Member's role changed successfully",
          variant: "success",
        });
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="grid gap-6 pt-2">
      {isPending ? (
        <Loader className="w-8 h-8 animate-spin place-self-center flex" />
      ) : null}

      {members?.map((member) => {
        const name = member.userId?.name;
        const initials = getAvatarFallbackText(name);
        const avatarColor = getAvatarColor(name);
        return (
          <div
            key={member.userId._id}
            className="flex items-center justify-between space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Link
              to={`/workspace/${workspaceId}/members/${member.userId._id}`}
              className="flex items-center space-x-4 flex-1 cursor-pointer"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={member.userId?.profilePicture || ""}
                  alt="Image"
                />
                <AvatarFallback className={avatarColor}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{name}</p>
                <p className="text-sm text-muted-foreground">
                  {member.userId.email}
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              {canChangeMemberRole && member.userId._id !== user?._id ? (
                <Popover modal={false}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto min-w-24 capitalize disabled:opacity-95 disabled:pointer-events-none"
                      disabled={isLoading}
                    >
                      {member.role.name?.toLowerCase()}{" "}
                      <ChevronDown className="text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="p-0"
                    align="end"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <Command>
                      <CommandInput
                        placeholder="Select new role..."
                        disabled={isLoading}
                        className="disabled:pointer-events-none"
                      />
                      <CommandList>
                        {isLoading ? (
                          <Loader className="w-8 h-8 animate-spin place-self-center flex my-4" />
                        ) : (
                          <>
                            <CommandEmpty>No roles found.</CommandEmpty>
                            <CommandGroup>
                              {roles?.map(
                                (role) =>
                                  role.name !== "OWNER" && (
                                    <CommandItem
                                      key={role._id}
                                      disabled={isLoading}
                                      className="disabled:pointer-events-none gap-1 mb-1  flex flex-col items-start px-4 py-2 cursor-pointer"
                                      onSelect={() => {
                                        handleSelect(
                                          role._id,
                                          member.userId._id
                                        );
                                      }}
                                    >
                                      <p className="capitalize">
                                        {role.name?.toLowerCase()}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {role.name === "ADMIN" &&
                                          `Can view, create, edit tasks, project and manage settings .`}

                                        {role.name === "MEMBER" &&
                                          `Can view,edit only task created by.`}
                                      </p>
                                    </CommandItem>
                                  )
                              )}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto min-w-24 capitalize disabled:opacity-95 disabled:pointer-events-none"
                  disabled={true}
                >
                  {member.role.name?.toLowerCase()}
                </Button>
              )}

              {/* Remove Member Dropdown - Only show for owners and only for non-owners */}
              {canRemoveMember && member.userId._id !== user?._id && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <DropdownMenuItem
                      className="text-destructive cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleOpenRemoveMemberDialog(member);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        );
      })}
      {selectedMember && (
        <RemoveMemberDialog
          key={selectedMember.userId._id}
          open={removeMemberDialogOpen}
          onOpenChange={handleCloseRemoveMemberDialog}
          workspaceId={workspaceId}
          memberToRemove={{
            userId: {
              _id: selectedMember.userId._id,
              name: selectedMember.userId.name,
              email: selectedMember.userId.email,
              profilePicture: selectedMember.userId.profilePicture || undefined,
            },
            role: {
              name: selectedMember.role.name,
            },
          }}
          availableMembers={members
            .filter((m) => m.userId._id !== selectedMember.userId._id)
            .map((m) => ({
              userId: {
                _id: m.userId._id,
                name: m.userId.name,
                email: m.userId.email,
                profilePicture: m.userId.profilePicture || undefined,
              },
              role: {
                name: m.role.name,
              },
            }))}
        />
      )}
    </div>
  );
};

export default AllMembers;
