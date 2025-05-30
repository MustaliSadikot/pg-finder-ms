
import React, { useState, useEffect } from "react";
import { Room, Bed as BedType } from "@/types";
import { roomAPI, bedAPI } from "@/services/roomApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, BedDouble } from "lucide-react";

interface RoomListProps {
  pgId: string;
}

const RoomList: React.FC<RoomListProps> = ({ pgId }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Record<string, BedType[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRooms = async () => {
      setLoading(true);
      try {
        const roomsData = await roomAPI.getRoomsByPGId(pgId);
        setRooms(roomsData);

        // Load beds for each room
        const bedsData: Record<string, BedType[]> = {};
        for (const room of roomsData) {
          const roomBeds = await bedAPI.getBedsByRoomId(room.id);
          bedsData[room.id] = roomBeds;
        }
        setBeds(bedsData);
      } catch (error) {
        console.error("Error loading rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    if (pgId) {
      loadRooms();
    }
  }, [pgId]);

  if (loading) {
    return <div className="text-center py-4">Loading rooms...</div>;
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No room information available for this PG.
      </div>
    );
  }

  const countVacantBeds = (roomBeds: BedType[]) => {
    return roomBeds.filter(bed => !bed.is_occupied && !bed.isOccupied).length;
  };

  // Helper function to get room capacity per bed with fallbacks
  const getCapacityPerBed = (room: Room): number => {
    return room.capacityPerBed || room.capacity_per_bed || 1;
  };

  // Helper function to get total beds
  const getTotalBeds = (room: Room): number => {
    return room.totalBeds || room.capacity || 0;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Available Rooms</h3>
      <div className="grid grid-cols-1 gap-4">
        {rooms.filter(room => room.availability).map((room) => {
          const roomBeds = beds[room.id] || [];
          const vacantBeds = countVacantBeds(roomBeds);
          const totalBeds = getTotalBeds(room);
          const capacityPerBed = getCapacityPerBed(room);
          
          return (
            <Card key={room.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Room {room.room_number || room.roomNumber}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Total Capacity:</span>
                    <span className="font-medium">{totalBeds * capacityPerBed} persons</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Beds:</span>
                    <span className="font-medium">
                      {totalBeds} ({capacityPerBed} {capacityPerBed > 1 ? "persons" : "person"} per bed)
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Available Beds:</span>
                    <span className="font-medium text-green-600">{vacantBeds} of {totalBeds}</span>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-sm font-medium mb-2">Bed Availability:</p>
                    <div className="flex flex-wrap gap-2">
                      {roomBeds.length ? (
                        roomBeds.map((bed) => (
                          <Badge
                            key={bed.id}
                            variant="outline"
                            className={`flex items-center gap-1 ${
                              bed.is_occupied || bed.isOccupied
                                ? "bg-red-50 text-red-700"
                                : "bg-green-50 text-green-700"
                            }`}
                          >
                            <BedDouble className="h-3 w-3" />
                            Bed {bed.bed_number || bed.bedNumber}: {bed.is_occupied || bed.isOccupied ? "Occupied" : "Vacant"}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No bed details available</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RoomList;
