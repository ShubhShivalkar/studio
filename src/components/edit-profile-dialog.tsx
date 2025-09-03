
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Trash2 } from 'lucide-react';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from './ui/separator';

interface EditProfileDialogProps {
  user: User;
  onUpdate: (updatedUser: Partial<User>) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const religions = [
  "Christianity",
  "Islam",
  "Hinduism",
  "Buddhism",
  "Sikhism",
  "Judaism",
  "Baháʼí Faith",
  "Jainism",
  "Shinto",
  "Taoism",
  "Zoroastrianism",
  "Atheism/Agnosticism",
  "Other",
  "Prefer not to say",
];

export function EditProfileDialog({ user, onUpdate, open, onOpenChange }: EditProfileDialogProps) {
  const [avatarPreview, setAvatarPreview] = useState<string>(user.avatar);
  const [profession, setProfession] = useState(user.profession || '');
  const [religion, setReligion] = useState(user.religion || '');
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    const updatedUser: Partial<User> = {
      avatar: avatarPreview,
      profession: profession.trim(),
      religion: religion.trim(),
    };
    onUpdate(updatedUser);
    toast({
      title: 'Profile Updated',
      description: 'Your changes have been saved successfully.',
    });
    onOpenChange(false);
  };

  const handleDeleteProfile = () => {
    // In a real app, this would trigger a confirmation and then a call to the backend.
    toast({
        variant: "destructive",
        title: "Profile Deletion",
        description: "Profile deletion functionality is not implemented in this demo.",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24 border-4 border-primary/20">
              <AvatarImage src={avatarPreview} alt={user.name} data-ai-hint="person photo" />
              <AvatarFallback>
                <UserIcon className="w-12 h-12 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="picture" className="sr-only">Upload Picture</Label>
              <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={user.name} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dob" className="text-right">
              Birth Date
            </Label>
            <Input id="dob" value={user.dob ? format(parseISO(user.dob), 'MMMM d, yyyy') : ''} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="profession" className="text-right">
              Profession
            </Label>
            <Input
              id="profession"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="Your profession"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="religion" className="text-right">
              Religion
            </Label>
            <Select value={religion} onValueChange={setReligion}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select your religion" />
                </SelectTrigger>
                <SelectContent>
                    {religions.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSaveChanges}>
            Save changes
          </Button>
        </DialogFooter>
        <Separator />
        <div className="pt-2">
            <Button variant="destructive" className="w-full justify-start" onClick={handleDeleteProfile}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Profile
            </Button>
            <p className="text-xs text-muted-foreground mt-2 px-1">
                Permanently delete your account and all your data. This action cannot be undone.
            </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
