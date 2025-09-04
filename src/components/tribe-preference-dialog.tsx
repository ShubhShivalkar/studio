
"use client";

import { useState, useEffect } from 'react';
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
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { TribePreferences } from '@/lib/types';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

interface TribePreferenceDialogProps {
  preferences?: TribePreferences;
  onSave: (preferences: TribePreferences) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultPreferences: TribePreferences = {
    ageRange: [18, 60],
    gender: "No Preference",
};

export function TribePreferenceDialog({ preferences, onSave, open, onOpenChange }: TribePreferenceDialogProps) {
  const [ageRange, setAgeRange] = useState(preferences?.ageRange || defaultPreferences.ageRange);
  const [gender, setGender] = useState(preferences?.gender || defaultPreferences.gender);

  useEffect(() => {
    if (open) {
      setAgeRange(preferences?.ageRange || defaultPreferences.ageRange);
      setGender(preferences?.gender || defaultPreferences.gender);
    }
  }, [open, preferences]);

  const handleSaveChanges = () => {
    onSave({ ageRange, gender });
    onOpenChange(false);
  };

  const DisabledFeature = ({ title, description }: { title: string; description: string }) => (
    <div className="space-y-2 opacity-50 cursor-not-allowed">
      <div className="flex items-center justify-between">
         <Label>{title}</Label>
         <Badge variant="outline" className="text-xs bg-muted">
            <Lock className="h-3 w-3 mr-1" />
            Coming Soon
        </Badge>
      </div>
       <div className="p-4 bg-muted/50 rounded-md text-center text-muted-foreground text-sm">
        {description}
       </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tribe Preferences</DialogTitle>
          <DialogDescription>
            Help us find the best tribe for you by setting your preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Label htmlFor="age-range">Age Range</Label>
                <span className="text-sm font-medium text-muted-foreground">
                    {ageRange[0]} - {ageRange[1]} years
                </span>
            </div>
            <Slider
              id="age-range"
              min={18}
              max={80}
              step={1}
              value={ageRange}
              onValueChange={(value) => setAgeRange(value as [number, number])}
            />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup 
              value={gender} 
              onValueChange={(value) => setGender(value as TribePreferences['gender'])}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="No Preference" id="no-preference" />
                <Label htmlFor="no-preference">No Preference</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Same Gender" id="same-gender" />
                <Label htmlFor="same-gender">Same Gender</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Mixed Gender" id="mixed-gender" />
                <Label htmlFor="mixed-gender">Mixed Gender</Label>

              </div>
            </RadioGroup>
          </div>
          
          <DisabledFeature 
             title="Tribe Size"
             description="Set your ideal group size."
          />
          <DisabledFeature 
             title="Personality Traits"
             description="Match with users who have specific traits."
          />
          <DisabledFeature 
             title="Hobbies & Interests"
             description="Connect with people who share your passions."
          />

        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSaveChanges}>
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
