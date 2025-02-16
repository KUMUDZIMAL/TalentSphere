"use client";
import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import { EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";

export const TimelineTracker: React.FC = () => {
  // Start with some initial events
  const [events, setEvents] = useState<EventInput[]>([
    { title: "Script Deadline", date: "2025-02-20" },
    { title: "Audition Day", date: "2025-02-25" },
    { title: "Location Scouting", date: "2025-03-01" },
  ]);

  // When a date is clicked, prompt the user to add an event
  const handleDateClick = (arg: DateClickArg) => {
    const eventTitle = window.prompt("Enter event title:");
    if (eventTitle) {
      setEvents((prevEvents) => [
        ...prevEvents,
        { title: eventTitle, date: arg.dateStr },
      ]);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Timeline & Milestones</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        dateClick={handleDateClick}
        height="auto"
      />
    </div>
  );
};
