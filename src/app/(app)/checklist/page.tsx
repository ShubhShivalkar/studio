
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Check, ListTodo, Plus, Trash2, X } from "lucide-react";
import { checklists } from "@/lib/mock-data";
import { format, parseISO } from "date-fns";
import type { Checklist, ChecklistItem } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export default function ChecklistPage() {
  const { toast } = useToast();
  const [checklistData, setChecklistData] = useState(checklists);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [newChecklistDate, setNewChecklistDate] = useState(new Date().toISOString().split('T')[0]);
  const [newChecklistItems, setNewChecklistItems] = useState<Pick<ChecklistItem, 'text' | 'completed'>>([{ text: "", completed: false }]);

  const handleAddItem = () => {
    setNewChecklistItems([...newChecklistItems, { text: "", completed: false }]);
  };

  const handleItemChange = (index: number, text: string) => {
    const items = [...newChecklistItems];
    items[index].text = text;
    setNewChecklistItems(items);
  };

  const handleRemoveItem = (index: number) => {
    const items = [...newChecklistItems];
    items.splice(index, 1);
    setNewChecklistItems(items);
  };

  const handleCreateChecklist = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newChecklistTitle.trim() || !newChecklistDate) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please provide a title and date for the checklist."
        });
        return;
    }
    const validItems = newChecklistItems.filter(item => item.text.trim() !== "");
    if(validItems.length === 0) {
        toast({
            variant: "destructive",
            title: "No Items",
            description: "Please add at least one item to the checklist."
        });
        return;
    }

    const newChecklist: Checklist = {
      id: `cl-${Date.now()}`,
      title: newChecklistTitle,
      date: newChecklistDate,
      items: validItems.map(item => ({...item, id: `item-${Date.now()}-${Math.random()}`})),
    };
    
    checklists.push(newChecklist);
    setChecklistData([...checklists]);

    toast({
      title: "Checklist Created!",
      description: `"${newChecklist.title}" has been added.`,
    });

    // Reset form
    setNewChecklistTitle("");
    setNewChecklistDate(new Date().toISOString().split('T')[0]);
    setNewChecklistItems([{ text: "", completed: false }]);
  };
  
  const handleDeleteChecklist = (checklistId: string) => {
    const checklistToDelete = checklistData.find(c => c.id === checklistId);
    if (!checklistToDelete) return;

    const newChecklists = checklistData.filter((checklist) => checklist.id !== checklistId);
    checklists.splice(0, checklists.length, ...newChecklists); 
    setChecklistData(newChecklists);

    toast({
        variant: "destructive",
        title: "Checklist Deleted",
        description: `"${checklistToDelete.title}" has been removed.`
    });
  }

  const toggleItemCompletion = (checklistId: string, itemId: string) => {
    const newChecklistData = checklistData.map(checklist => {
        if(checklist.id === checklistId) {
            return {
                ...checklist,
                items: checklist.items.map(item => 
                    item.id === itemId ? {...item, completed: !item.completed} : item
                )
            }
        }
        return checklist;
    });
    checklists.splice(0, checklists.length, ...newChecklistData);
    setChecklistData(newChecklistData);
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="md:col-span-1">
        <Card>
            <CardHeader>
                <CardTitle>New Checklist</CardTitle>
                <CardDescription>Create a new checklist to stay organized.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleCreateChecklist} className="space-y-4">
                    <div>
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" value={newChecklistTitle} onChange={e => setNewChecklistTitle(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" name="date" type="date" value={newChecklistDate} onChange={e => setNewChecklistDate(e.target.value)} required />
                    </div>
                    <div>
                        <Label>Items</Label>
                        <div className="space-y-2">
                        {newChecklistItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input 
                                    type="text" 
                                    placeholder={`Item ${index + 1}`} 
                                    value={item.text} 
                                    onChange={(e) => handleItemChange(index, e.target.value)}
                                />
                                <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveItem(index)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        </div>
                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={handleAddItem}>
                            <Plus className="h-4 w-4 mr-2" /> Add Item
                        </Button>
                    </div>
                    <Button type="submit" className="w-full">
                        <Check className="mr-2 h-4 w-4" />
                        Create Checklist
                    </Button>
                </form>
            </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1 space-y-4">
         {checklistData.length > 0 ? (
            checklistData.map((checklist) => (
                <Card key={checklist.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                           <div>
                            <CardTitle>{checklist.title}</CardTitle>
                            <CardDescription>{format(parseISO(checklist.date), 'MMMM d, yyyy')}</CardDescription>
                           </div>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive flex-shrink-0" onClick={() => handleDeleteChecklist(checklist.id)}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {checklist.items.map(item => (
                                <div key={item.id} className="flex items-center gap-2">
                                    <Checkbox 
                                        id={`${checklist.id}-${item.id}`} 
                                        checked={item.completed}
                                        onCheckedChange={() => toggleItemCompletion(checklist.id, item.id)}
                                    />
                                    <Label htmlFor={`${checklist.id}-${item.id}`} className={cn(item.completed && "line-through text-muted-foreground")}>{item.text}</Label>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))
         ) : (
            <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
                <ListTodo className="h-10 w-10 mb-4" />
                <p>You have no checklists.</p>
                <p className="text-sm">Use the form to create your first one.</p>
            </div>
         )}
      </div>
    </div>
  );
}
