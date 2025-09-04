
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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <CardTitle>Meet-up History</CardTitle>
                <CardDescription>
                A record of all your past tribe meetups.
                </CardDescription>
            </div>
            <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                <ArrowLeft className="mr-2" /> Back to Tribe
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {(!pastTribes || pastTribes.length === 0) ? (
            <div className="flex flex-col items-center justify-center text-center h-64 text-muted-foreground border-2 border-dashed rounded-lg">
                <p className="text-lg">You have no past tribe events.</p>
            </div>
        ) : (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="hidden sm:table-cell">Tribe ID</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {pastTribes.map((tribe) => (
                <TableRow key={tribe.id}>
                    <TableCell className="font-medium">
                    {format(parseISO(tribe.meetupDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
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
        )}
      </CardContent>
    </Card>
  );
}
