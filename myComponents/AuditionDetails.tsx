// File: /myComponents/AuditionDetails.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  DollarSign,
  Camera,
  Mic,
  Music,
} from "lucide-react";
import mongoose from "mongoose";

interface AuditionDetailsProps {
  audition: {
    id: string;       // MongoDB _id
    title: string;
    date: string;     // initial date (ISO or string); will be overwritten by fetched data
  };
  onBack?: () => void;
  isFullPage?: boolean;
}

interface FullOpportunity {
  _id: string;
  title: string;
  date: string;
  type?: string;
  location?: string;
  compensation?: string;
  description?: string;
  requirements?: string[] | null;
  castingDirector?: string;
  applicationDeadline?: string;
  contactEmail?: string;
  experienceLevel?: string;
  genres?: string[];
  // other fields…
}

export function AuditionDetails({
  audition,
  onBack,
  isFullPage = false,
}: AuditionDetailsProps) {
  const router = useRouter();
  const [details, setDetails] = useState<FullOpportunity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/fetchOpportunities/${audition.id}`);
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || "Failed to fetch details");
        }
        const json = await res.json();
        setDetails(json.opportunity as FullOpportunity);
      } catch (err: any) {
        console.error("Error fetching audition details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [audition.id]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Feature Film":
        return <Camera className="w-4 h-4" />;
      case "Voice Acting":
        return <Mic className="w-4 h-4" />;
      case "Dance Performance":
        return <Music className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const containerClass = isFullPage
    ? "min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-6"
    : "";

  const cardClass = isFullPage
    ? "max-w-4xl mx-auto bg-white/95 border-purple-200 shadow-2xl"
    : "bg-white/90 border-green-200 text-gray-800";

  return (
    <div className={containerClass}>
      <Card className={cardClass}>
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            {/* Title + type icon */}
            <div className="flex items-center space-x-3">
              {details?.type && getTypeIcon(details.type)}
              <div>
                <CardTitle className="text-xl lg:text-2xl">
                  {details ? details.title : audition.title}
                </CardTitle>
                <p className="text-purple-100 mt-1">
                  {details?.type || "Audition"}
                </p>
              </div>
            </div>

            {/* Back button */}
            {onBack && (
              <Button
                variant="outline"
                size="sm"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all duration-300"
                onClick={onBack}
              >
                ← Back
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {loading ? (
            // Loading state
            <div className="text-center py-10">
              <p className="text-gray-600">Loading details…</p>
            </div>
          ) : error ? (
            // Error state
            <div className="text-center py-10">
              <p className="text-red-600">Error: {error}</p>
            </div>
          ) : details ? (
            <>
              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Audition Date */}
                <div className="flex items-center space-x-2 text-gray-700">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">Audition Date</p>
                    <p className="font-semibold">
                      {new Date(details.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Application Deadline */}
                {details.applicationDeadline && (
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Clock className="w-5 h-5 text-pink-500" />
                    <div>
                      <p className="text-sm text-gray-500">Deadline</p>
                      <p className="font-semibold">
                        {new Date(
                          details.applicationDeadline
                        ).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Location */}
                {details.location && (
                  <div className="flex items-center space-x-2 text-gray-700">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-semibold">{details.location}</p>
                    </div>
                  </div>
                )}

                {/* Compensation */}
                {details.compensation && (
                  <div className="flex items-center space-x-2 text-gray-700">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Compensation</p>
                      <p className="font-semibold">{details.compensation}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Genres and Experience Level */}
              {(details.genres?.length || details.experienceLevel) && (
                <div className="space-y-3">
                  {details.genres && details.genres.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Genres
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {details.genres.map((genre, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="bg-purple-100 text-purple-800"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {details.experienceLevel && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Experience Level
                      </h4>
                      <Badge
                        variant="outline"
                        className="border-green-500 text-green-700"
                      >
                        {details.experienceLevel}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              <Separator />

              {/* Description */}
              {details.description && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Project Description
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {details.description}
                  </p>
                </div>
              )}

{details.requirements && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                   Requirements
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {details.requirements}
                  </p>
                </div>
              )}


              <Separator />

              {/* Contact Information */}
              {(details.castingDirector || details.contactEmail) && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-600" />
                    Contact Information
                  </h4>
                  <div className="space-y-2">
                    {details.castingDirector && (
                      <p className="text-gray-700">
                        <span className="font-medium">Casting Director:</span>{" "}
                        {details.castingDirector}
                      </p>
                    )}
                    {details.contactEmail && (
                      <p className="text-gray-700">
                        <span className="font-medium">Email:</span>{" "}
                        <a
                          href={`mailto:${details.contactEmail}`}
                          className="text-purple-600 hover:text-purple-800 ml-1"
                        >
                          {details.contactEmail}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex-1">
                  Apply Now
                </Button>
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 transition-all duration-300"
                >
                  Save for Later
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
                >
                  Share
                </Button>
              </div>
            </>
          ) : (
            // Fallback if `details` is null
            <div className="text-center py-8">
              <p className="text-gray-600">No details available.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
