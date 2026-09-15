"use client";

import { useState } from "react";
import { BackHeader } from "@/components/back-header";
import { EditEventDialog } from "./edit-event-dialog";
import { Pencil } from "lucide-react";

interface EventDetailHeaderProps {
  event: any;
}

export function EventDetailHeader({ event }: EventDetailHeaderProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <BackHeader
        title={`Event: ${event.title}`}
        menuItems={[
          {
            label: "Edit Event",
            icon: <Pencil className="w-4 h-4 text-pink-500" />,
            onClick: () => setEditOpen(true),
          },
        ]}
      />
      <EditEventDialog event={event} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
