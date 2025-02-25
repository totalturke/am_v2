import { format } from "date-fns";
import { Home, Calendar, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Apartment {
  id: number;
  apartmentNumber: string;
  status: string;
  lastMaintenance?: string | Date | null;
  nextMaintenance?: string | Date | null;
  building?: {
    id: number;
    name: string;
  };
  city?: {
    id: number;
    name: string;
  };
  imageUrl?: string;
  recentTask?: {
    id: number;
    issue: string;
    status: string;
  };
}

interface ApartmentsGridProps {
  apartments: Apartment[];
}

export default function ApartmentsGrid({ apartments }: ApartmentsGridProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-500 text-white">Maintenance</Badge>;
      case 'inactive':
        return <Badge className="bg-neutral-500 text-white">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-800">Recently Maintained Apartments</h2>
        <div className="mt-2 md:mt-0">
          <Link href="/apartments">
            <Button variant="link" className="text-sm font-medium text-primary-600 hover:text-primary-900 inline-flex items-center">
              View All Apartments
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {apartments.map((apartment) => (
          <Card key={apartment.id} className="overflow-hidden">
            <div className="relative h-40">
              <img 
                src={apartment.imageUrl || `https://source.unsplash.com/random/600x400/?apartment,${apartment.id}`} 
                alt={`Apartment ${apartment.apartmentNumber}`} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute top-0 right-0 m-2">
                {getStatusBadge(apartment.status)}
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-neutral-900">
                    Apt {apartment.apartmentNumber}, {apartment.building?.name}
                  </h3>
                  <p className="text-sm text-neutral-500">{apartment.city?.name}</p>
                </div>
                <div className="bg-primary-50 text-primary-700 text-xs font-medium px-2 py-1 rounded-md">
                  ID: #{`A-${10000 + apartment.id}`}
                </div>
              </div>
              <div className="mt-3 flex items-center text-sm">
                <Calendar className="h-4 w-4 text-neutral-500 mr-1" />
                <span className="text-neutral-600">
                  Last maintenance: {apartment.lastMaintenance 
                    ? format(new Date(apartment.lastMaintenance), "d MMM yyyy") 
                    : "Not yet maintained"}
                </span>
              </div>
              <div className="mt-1 flex items-center text-sm">
                {apartment.recentTask ? (
                  <>
                    <AlertTriangle className="h-4 w-4 text-neutral-500 mr-1" />
                    <span className="text-neutral-600">{apartment.recentTask.issue}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-neutral-500 mr-1" />
                    <span className="text-neutral-600">No issues reported</span>
                  </>
                )}
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <div className="text-xs text-neutral-500 mb-1">Next scheduled maintenance</div>
                  <div className="text-sm font-medium">
                    {apartment.nextMaintenance 
                      ? format(new Date(apartment.nextMaintenance), "MMM d, yyyy") 
                      : "Not scheduled"}
                  </div>
                </div>
                <Link href={`/apartments/${apartment.id}`}>
                  <Button variant="outline" size="sm" className="inline-flex items-center border-primary-300 text-primary-700 hover:bg-primary-50">
                    Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {apartments.length === 0 && (
          <div className="col-span-3 text-center py-10 text-neutral-500">
            No apartments found
          </div>
        )}
      </div>
    </div>
  );
}
