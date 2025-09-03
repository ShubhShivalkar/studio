
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { pastTribes } from "@/lib/mock-data";
import { format, parseISO } from 'date-fns';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";

export default function TribeHistoryPage() {
  const router = useRouter();

  if (!pastTribes || pastTribes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full">
         <Button variant="ghost" onClick={() => router.back()} className="absolute top-6 left-6">
            <ArrowLeft className="mr-2" /> Back
         </Button>
        <p className="text-lg text-muted-foreground">You have no past tribe events.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="font-headline">Tribe History</CardTitle>
                <CardDescription>
                A record of all your past tribe meetups.
                </CardDescription>
            </div>
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2" /> Back to Tribe
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Tribe ID</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pastTribes.map((tribe) => (
              <TableRow key={tribe.id}>
                <TableCell className="font-medium">
                  {format(parseISO(tribe.meetupDate), 'MMMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{tribe.id}</Badge>
                </TableCell>
                <TableCell>{tribe.location}</TableCell>
                <TableCell>
                  <Badge variant={tribe.attendance === 'attended' ? 'default' : 'destructive'}>
                     {tribe.attendance === 'attended' ? <CheckCircle className="mr-2" /> : <XCircle className="mr-2" />}
                    {tribe.attendance.charAt(0).toUpperCase() + tribe.attendance.slice(1)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
